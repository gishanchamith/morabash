import type { SupabaseClient } from "@supabase/supabase-js"

function oversToBalls(value: number | string | null | undefined) {
  if (value === null || value === undefined) return 0
  const str = value.toString()
  if (!str.includes(".")) {
    const whole = Number(str)
    return Number.isFinite(whole) ? whole * 6 : 0
  }
  const [oversPart, ballsPartRaw] = str.split(".")
  const overs = Number(oversPart)
  const balls = Number(ballsPartRaw?.slice(0, 1) ?? "0")
  if (!Number.isFinite(overs) || !Number.isFinite(balls)) return 0
  return overs * 6 + Math.min(5, Math.max(0, balls))
}

function ballsToOversDecimal(balls: number) {
  if (balls <= 0) return 0
  const overs = Math.floor(balls / 6)
  const remaining = balls % 6
  return Number(`${overs}.${remaining}`)
}

export type ComputedStanding = {
  team_id: string
  team_name: string
  matches_played: number
  wins: number
  losses: number
  ties: number
  points: number
  runs_for: number
  runs_against: number
  overs_faced: number
  overs_bowled: number
  nrr: number
}

export async function computeStandings(
  supabase: SupabaseClient<any, any, any>,
): Promise<ComputedStanding[]> {
  const { data: matches, error: matchesError } = await supabase
    .from("matches")
    .select("id, status, team1_id, team2_id, winner_id")
    .eq("status", "completed")

  if (matchesError) {
    throw new Error(matchesError.message)
  }

  if (!matches || matches.length === 0) {
    return []
  }

  const matchIds = matches.map((match) => match.id)

  const { data: scoreboards, error: scoreboardError } = await supabase
    .from("scoreboard")
    .select("match_id, team_id, runs, wickets, overs")
    .in("match_id", matchIds)

  if (scoreboardError) {
    throw new Error(scoreboardError.message)
  }

  const teamStats = new Map<string, {
    matchesPlayed: number
    wins: number
    losses: number
    ties: number
    points: number
    runsFor: number
    runsAgainst: number
    oversFacedBalls: number
    oversBowledBalls: number
  }>()

  matches.forEach((match) => {
    const entries = (scoreboards || []).filter((row) => row.match_id === match.id)
    if (entries.length < 2) return

    const [teamA, teamB] = entries
    if (!teamA || !teamB) return

    const processTeam = (teamEntry: any, opponentEntry: any, isTeamOne: boolean) => {
      const teamId = teamEntry.team_id
      const current = teamStats.get(teamId) || {
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        points: 0,
        runsFor: 0,
        runsAgainst: 0,
        oversFacedBalls: 0,
        oversBowledBalls: 0,
      }

      const teamRuns = Number(teamEntry.runs ?? 0)
      const opponentRuns = Number(opponentEntry.runs ?? 0)
      const isTie = teamRuns === opponentRuns
      const didWin = match.winner_id
        ? match.winner_id === teamId
        : teamRuns > opponentRuns

      current.matchesPlayed += 1
      current.wins += didWin && !isTie ? 1 : 0
      current.losses += !didWin && !isTie ? 1 : 0
      current.ties += isTie ? 1 : 0
      current.points += didWin && !isTie ? 2 : isTie ? 1 : 0
      current.runsFor += teamRuns
      current.runsAgainst += opponentRuns
      current.oversFacedBalls += oversToBalls(teamEntry.overs)
      current.oversBowledBalls += oversToBalls(opponentEntry.overs)

      teamStats.set(teamId, current)
    }

    processTeam(teamA, teamB, true)
    processTeam(teamB, teamA, false)
  })

  const teamIds = Array.from(teamStats.keys())
  if (teamIds.length === 0) {
    return []
  }

  const { data: teams } = await supabase
    .from("teams")
    .select("id, name")
    .in("id", teamIds)

  const standings: ComputedStanding[] = teamIds.map((teamId) => {
    const stats = teamStats.get(teamId)!
    const team = teams?.find((t) => t.id === teamId)
    const runRateFor = stats.oversFacedBalls > 0 ? (stats.runsFor * 6) / stats.oversFacedBalls : 0
    const runRateAgainst = stats.oversBowledBalls > 0 ? (stats.runsAgainst * 6) / stats.oversBowledBalls : 0
    const nrr = Number((runRateFor - runRateAgainst).toFixed(3))

    return {
      team_id: teamId,
      team_name: team?.name ?? "Unknown Team",
      matches_played: stats.matchesPlayed,
      wins: stats.wins,
      losses: stats.losses,
      ties: stats.ties,
      points: stats.points,
      runs_for: stats.runsFor,
      runs_against: stats.runsAgainst,
      overs_faced: ballsToOversDecimal(stats.oversFacedBalls),
      overs_bowled: ballsToOversDecimal(stats.oversBowledBalls),
      nrr,
    }
  })

  return standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    return b.nrr - a.nrr
  })
}

export { oversToBalls, ballsToOversDecimal }
