import type { SupabaseClient } from "@supabase/supabase-js"

function formatOvers(legalBalls: number) {
  if (legalBalls <= 0) return "0.0"
  const overs = Math.floor(legalBalls / 6)
  const balls = legalBalls % 6
  return `${overs}.${balls}`
}

function formatNumber(value: number, decimals = 2) {
  return Number.isFinite(value) ? value.toFixed(decimals) : "0.00"
}

type ScorecardBattingRow = {
  playerId: string
  name: string
  runs: number
  balls: number
  fours: number
  sixes: number
  strikeRate: string
  dismissal: string
  isNotOut: boolean
}

type ScorecardBowlingRow = {
  playerId: string
  name: string
  overs: string
  runs: number
  wickets: number
  economy: string
}

type ScorecardExtras = {
  wides: number
  noBalls: number
  byes: number
  legByes: number
  others: number
  total: number
}

type FallOfWicket = {
  wicket: number
  score: string
  over: string
  player: string
}

type ScorecardInnings = {
  innings: number
  battingTeam: { id: string; name: string }
  bowlingTeam: { id: string; name: string }
  batting: ScorecardBattingRow[]
  didNotBat: string[]
  fallOfWickets: FallOfWicket[]
  bowling: ScorecardBowlingRow[]
  extras: ScorecardExtras
  total: {
    runs: number
    wickets: number
    overs: string
    runRate: string
  }
}

type ScorecardResponse = {
  match: {
    id: string
    venue: string | null
    status: string
    matchDate: string | null
    team1: { id: string; name: string }
    team2: { id: string; name: string }
  }
  innings: ScorecardInnings[]
  result: {
    winnerId: string | null
    winnerName: string | null
    margin: string | null
  } | null
}

type RawBall = {
  id: string
  innings: number
  over_number: number
  ball_number: number
  runs: number | null
  extras: number | null
  extra_type: string | null
  wicket_type: string | null
  wicket_player_id: string | null
  created_at: string
  batsman: { id: string; name: string | null } | null
  bowler: { id: string; name: string | null } | null
  wicket_player: { id: string; name: string | null } | null
}

type RawPlayer = {
  id: string
  name: string | null
  team_id: string
}

function extractTeamName(team: any, fallback: string) {
  if (!team) return fallback
  if (Array.isArray(team)) {
    return team[0]?.name ?? fallback
  }
  return team.name ?? fallback
}

function formatDismissal(ball: RawBall) {
  const bowlerName = ball.bowler?.name ?? ""
  const type = ball.wicket_type
  switch (type) {
    case "bowled":
      return `b ${bowlerName}`.trim()
    case "lbw":
      return `lbw b ${bowlerName}`.trim()
    case "caught":
      return `c ? b ${bowlerName}`.trim()
    case "stumped":
      return `stumped b ${bowlerName}`.trim()
    case "hit-wicket":
      return "hit wicket"
    case "run-out":
      return "run out"
    default:
      return type ? type.replace(/-/g, " ") : "out"
  }
}

function aggregateInnings(
  inningsNumber: number,
  rawBalls: RawBall[],
  battingTeam: { id: string; name: string },
  bowlingTeam: { id: string; name: string },
  teamPlayers: RawPlayer[],
): ScorecardInnings {
  const battingStats = new Map<string, {
    runs: number
    balls: number
    fours: number
    sixes: number
    dismissal: string
    isOut: boolean
    firstSeenIndex: number
    name: string
  }>()
  const battingOrder: string[] = []
  const bowlingStats = new Map<string, {
    runs: number
    legalBalls: number
    wickets: number
    name: string
  }>()
  const fallOfWickets: FallOfWicket[] = []
  const extras: ScorecardExtras = { wides: 0, noBalls: 0, byes: 0, legByes: 0, others: 0, total: 0 }

  let legalBalls = 0
  let totalRuns = 0
  let wicketCount = 0

  const sortedBalls = rawBalls
    .filter((ball) => ball.innings === inningsNumber)
    .slice()
    .sort((a, b) => {
      if (a.over_number === b.over_number) {
        return a.ball_number - b.ball_number
      }
      return a.over_number - b.over_number
    })

  sortedBalls.forEach((ball, index) => {
    const runs = Number(ball.runs ?? 0)
    const extrasValue = Number(ball.extras ?? 0)
    const extraType = ball.extra_type
    const batsmanId = ball.batsman?.id ?? ""
    const bowlerId = ball.bowler?.id ?? ""

    totalRuns += runs + extrasValue

    const isLegal = extraType !== "wide" && extraType !== "no-ball"
    if (isLegal) {
      legalBalls += 1
    }

    if (batsmanId) {
      if (!battingStats.has(batsmanId)) {
        battingStats.set(batsmanId, {
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          dismissal: "not out",
          isOut: false,
          firstSeenIndex: battingOrder.length,
          name: ball.batsman?.name ?? "Unknown",
        })
        battingOrder.push(batsmanId)
      }

      const batter = battingStats.get(batsmanId)!
      batter.runs += runs
      if (isLegal) {
        batter.balls += 1
      }
      if (!extraType && runs === 4) {
        batter.fours += 1
      }
      if (!extraType && runs === 6) {
        batter.sixes += 1
      }
    }

    if (extrasValue > 0) {
      extras.total += extrasValue
      switch (extraType) {
        case "wide":
          extras.wides += extrasValue
          break
        case "no-ball":
          extras.noBalls += extrasValue
          break
        case "bye":
          extras.byes += extrasValue
          break
        case "leg-bye":
          extras.legByes += extrasValue
          break
        default:
          extras.others += extrasValue
          break
      }
    }

    if (bowlerId) {
      if (!bowlingStats.has(bowlerId)) {
        bowlingStats.set(bowlerId, {
          runs: 0,
          legalBalls: 0,
          wickets: 0,
          name: ball.bowler?.name ?? "Unknown",
        })
      }
      const bowler = bowlingStats.get(bowlerId)!

      const extrasForBowler = extraType === "bye" || extraType === "leg-bye" ? 0 : extrasValue
      bowler.runs += runs + extrasForBowler
      if (isLegal) {
        bowler.legalBalls += 1
      }
      if (ball.wicket_type && ball.wicket_player_id && ball.wicket_type !== "run-out") {
        bowler.wickets += 1
      }
    }

    if (ball.wicket_type && ball.wicket_player_id && ball.wicket_player) {
      wicketCount += 1
      const dismissedId = ball.wicket_player_id
      if (!battingStats.has(dismissedId)) {
        battingStats.set(dismissedId, {
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          dismissal: formatDismissal(ball),
          isOut: true,
          firstSeenIndex: battingOrder.length,
          name: ball.wicket_player?.name ?? "Unknown",
        })
        battingOrder.push(dismissedId)
      } else {
        const dismissed = battingStats.get(dismissedId)!
        dismissed.dismissal = formatDismissal(ball)
        dismissed.isOut = true
      }

      fallOfWickets.push({
        wicket: wicketCount,
        score: `${totalRuns}/${wicketCount}`,
        over: `${ball.over_number}.${ball.ball_number}`,
        player: ball.wicket_player?.name ?? "Unknown",
      })
    }
  })

  const battingRows: ScorecardBattingRow[] = battingOrder.map((playerId) => {
    const stats = battingStats.get(playerId)!
    const strikeRate = stats.balls > 0 ? formatNumber((stats.runs * 100) / stats.balls) : "0.00"
    return {
      playerId,
      name: stats.name,
      runs: stats.runs,
      balls: stats.balls,
      fours: stats.fours,
      sixes: stats.sixes,
      strikeRate,
      dismissal: stats.isOut ? stats.dismissal : "not out",
      isNotOut: !stats.isOut,
    }
  })

  const teamPlayerNames = teamPlayers
    .filter((player) => player.team_id === battingTeam.id)
    .map((player) => ({ id: player.id, name: player.name ?? "Unknown" }))

  const didNotBat = teamPlayerNames
    .filter((player) => !battingStats.has(player.id))
    .map((player) => player.name)

  const bowlingRows: ScorecardBowlingRow[] = Array.from(bowlingStats.entries())
    .map(([playerId, stats]) => {
      const overs = formatOvers(stats.legalBalls)
      const economyValue = stats.legalBalls > 0 ? (stats.runs * 6) / stats.legalBalls : 0
      return {
        playerId,
        name: stats.name,
        overs,
        runs: stats.runs,
        wickets: stats.wickets,
        economy: formatNumber(economyValue),
        _economyValue: economyValue,
      } as ScorecardBowlingRow & { _economyValue: number }
    })
    .sort((a, b) => b.wickets - a.wickets || a._economyValue - b._economyValue || a.runs - b.runs)
    .map(({ _economyValue, ...row }) => row)

  const overs = formatOvers(legalBalls)
  const runRate = legalBalls > 0 ? formatNumber((totalRuns * 6) / legalBalls) : "0.00"

  return {
    innings: inningsNumber,
    battingTeam,
    bowlingTeam,
    batting: battingRows,
    didNotBat,
    fallOfWickets,
    bowling: bowlingRows,
    extras,
    total: {
      runs: totalRuns,
      wickets: wicketCount,
      overs,
      runRate,
    },
  }
}

export async function fetchScorecardData(
  supabase: SupabaseClient<any, any, any>,
  matchId: string,
): Promise<ScorecardResponse> {
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select(
      `
        id,
        venue,
        status,
        match_date,
        team1_id,
        team2_id,
        winner_id,
        team1:teams!matches_team1_id_fkey(id, name),
        team2:teams!matches_team2_id_fkey(id, name)
      `,
    )
    .eq("id", matchId)
    .maybeSingle()

  if (matchError) {
    throw new Error(matchError.message)
  }

  if (!match) {
    throw new Error("Match not found")
  }

  const { data: players, error: playersError } = await supabase
    .from("players")
    .select("id, name, team_id")
    .in("team_id", [match.team1_id, match.team2_id])

  if (playersError) {
    throw new Error(playersError.message)
  }

  const { data: rawBalls, error: ballsError } = await supabase
    .from("balls")
    .select(
      `
        id,
        innings,
        over_number,
        ball_number,
        runs,
        extras,
        extra_type,
        wicket_type,
        wicket_player_id,
        created_at,
        batsman:players!balls_batsman_id_fkey(id, name),
        bowler:players!balls_bowler_id_fkey(id, name),
        wicket_player:players!balls_wicket_player_id_fkey(id, name)
      `,
    )
    .eq("match_id", matchId)
    .order("innings", { ascending: true })
    .order("over_number", { ascending: true })
    .order("ball_number", { ascending: true })

  if (ballsError) {
    throw new Error(ballsError.message)
  }

  const inningsData: ScorecardInnings[] = [1, 2].map((inningsNumber) =>
    aggregateInnings(
      inningsNumber,
      (rawBalls as RawBall[]) || [],
      {
        id: inningsNumber === 1 ? match.team1_id : match.team2_id,
        name:
          inningsNumber === 1
            ? extractTeamName(match.team1, "Team 1")
            : extractTeamName(match.team2, "Team 2"),
      },
      {
        id: inningsNumber === 1 ? match.team2_id : match.team1_id,
        name:
          inningsNumber === 1
            ? extractTeamName(match.team2, "Team 2")
            : extractTeamName(match.team1, "Team 1"),
      },
      (players as RawPlayer[]) || [],
    ),
  )

  const firstInnings = inningsData[0]
  const secondInnings = inningsData[1]

  let winnerId: string | null = match.winner_id ?? null
  let winnerName: string | null = null
  let margin: string | null = null

  const team1Runs = firstInnings.total.runs
  const team2Runs = secondInnings.total.runs
  const team1Wickets = firstInnings.total.wickets
  const team2Wickets = secondInnings.total.wickets

  const team1Name = firstInnings.battingTeam.name
  const team2Name = secondInnings.battingTeam.name

  if (winnerId === firstInnings.battingTeam.id) {
    winnerName = team1Name
  } else if (winnerId === secondInnings.battingTeam.id) {
    winnerName = team2Name
  }

  if (match.status === "completed") {
    if (!winnerId) {
      if (team1Runs > team2Runs) {
        winnerId = firstInnings.battingTeam.id
        winnerName = team1Name
      } else if (team2Runs > team1Runs) {
        winnerId = secondInnings.battingTeam.id
        winnerName = team2Name
      }
    }

    if (team1Runs > team2Runs) {
      const marginRuns = team1Runs - team2Runs
      margin = `${marginRuns} run${marginRuns === 1 ? "" : "s"}`
    } else if (team2Runs > team1Runs) {
      const wicketsRemaining = Math.max(1, 10 - team2Wickets)
      margin = `${wicketsRemaining} wicket${wicketsRemaining === 1 ? "" : "s"}`
    } else if (team1Runs === team2Runs && (team1Runs > 0 || team2Runs > 0)) {
      margin = "Match tied"
    }
  }

  return {
    match: {
      id: match.id,
      venue: match.venue,
      status: match.status,
      matchDate: match.match_date,
      team1: {
        id: match.team1_id,
        name: extractTeamName(match.team1, "Team 1"),
      },
      team2: {
        id: match.team2_id,
        name: extractTeamName(match.team2, "Team 2"),
      },
    },
    innings: inningsData,
    result: match.status === "completed"
      ? {
          winnerId: winnerId ?? null,
          winnerName: winnerName ?? null,
          margin,
        }
      : null,
  }
}

export type { ScorecardResponse, ScorecardInnings, ScorecardBattingRow, ScorecardBowlingRow }
