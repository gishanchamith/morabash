import { NextResponse } from "next/server"
import { z } from "zod"

import { getAdminSupabase } from "@/lib/supabase/admin"
import { ballsToOversDecimal, oversToBalls } from "@/lib/standings"

const payloadSchema = z.object({
  status: z.enum(["upcoming", "ongoing", "completed", "abandoned"]),
  innings_complete: z.boolean().optional(),
  innings: z.number().int().min(1).max(2).optional(),
  winner_id: z.string().uuid().optional().nullable(),
})

type RouteContext = {
  params: {
    matchId: string
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { matchId } = context.params
  if (!matchId) {
    return NextResponse.json({ error: "Match id is required" }, { status: 400 })
  }

  const { supabase } = await getAdminSupabase()

  const rawBody = await request.json().catch(() => null)
  if (!rawBody) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
  }

  const parsed = payloadSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 })
  }

  const { status, innings_complete, innings, winner_id } = parsed.data

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("id, status")
    .eq("id", matchId)
    .maybeSingle()

  if (matchError) {
    return NextResponse.json({ error: matchError.message }, { status: 500 })
  }

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 })
  }

  if (match.status === "completed" && status !== "completed") {
    return NextResponse.json({ error: "Completed matches cannot be reopened" }, { status: 400 })
  }

  const updates: Record<string, any> = { status }

  if (status === "completed" && winner_id !== undefined) {
    updates.winner_id = winner_id
  } else if (status !== "completed") {
    updates.winner_id = null
  }

  const { error: updateError } = await supabase
    .from("matches")
    .update(updates)
    .eq("id", matchId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  if (innings_complete && innings) {
    await supabase
      .from("scoreboard")
      .update({ updated_at: new Date().toISOString() })
      .eq("match_id", matchId)
      .eq("innings", innings)
  }

  if (status === "completed") {
    await updateStandings(supabase, matchId, updates.winner_id ?? null)
  }

  return NextResponse.json({ success: true })
}

async function updateStandings(
  supabase: ReturnType<typeof getAdminSupabase>["supabase"],
  matchId: string,
  winnerId: string | null,
) {
  const { data: matchRow } = await supabase
    .from("matches")
    .select("team1_id, team2_id")
    .eq("id", matchId)
    .maybeSingle()

  if (!matchRow) {
    return
  }

  await Promise.all(
    [matchRow.team1_id, matchRow.team2_id].map((teamId) =>
      recomputeTeamStanding(supabase, teamId),
    ),
  )
}

async function recomputeTeamStanding(supabase: ReturnType<typeof getAdminSupabase>["supabase"], teamId: string) {
  const { data: matches } = await supabase
    .from("matches")
    .select("id, team1_id, team2_id, winner_id")
    .eq("status", "completed")
    .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`)

  if (!matches || matches.length === 0) {
    await supabase
      .from("tournament_standings")
      .upsert(
        {
          team_id: teamId,
          matches_played: 0,
          wins: 0,
          losses: 0,
          ties: 0,
          points: 0,
          runs_for: 0,
          runs_against: 0,
          overs_faced: 0,
          overs_bowled: 0,
          nrr: 0,
          last_updated: new Date().toISOString(),
        },
        { onConflict: "team_id" },
      )
    return
  }

  const matchIds = matches.map((match) => match.id)

  const { data: scoreboardRows } = await supabase
    .from("scoreboard")
    .select("match_id, team_id, innings, runs, wickets, overs")
    .in("match_id", matchIds)

  if (!scoreboardRows) {
    return
  }

  let matchesPlayed = 0
  let wins = 0
  let ties = 0
  let runsFor = 0
  let runsAgainst = 0
  let oversFacedBalls = 0
  let oversBowledBalls = 0

  matches.forEach((match) => {
    const teamRow = scoreboardRows.find((row) => row.match_id === match.id && row.team_id === teamId)
    const opponentRow = scoreboardRows.find((row) => row.match_id === match.id && row.team_id !== teamId)

    if (!teamRow || !opponentRow) {
      return
    }

    matchesPlayed += 1

    const teamRuns = Number(teamRow.runs ?? 0)
    const opponentRuns = Number(opponentRow.runs ?? 0)

    runsFor += teamRuns
    runsAgainst += opponentRuns
    oversFacedBalls += oversToBalls(teamRow.overs)
    oversBowledBalls += oversToBalls(opponentRow.overs)

    if (teamRuns === opponentRuns) {
      ties += 1
    } else if (match.winner_id) {
      if (match.winner_id === teamId) {
        wins += 1
      }
    } else if (teamRuns > opponentRuns) {
      wins += 1
    }
  })

  const losses = Math.max(0, matchesPlayed - wins - ties)
  const points = wins * 2 + ties
  const runRateFor = oversFacedBalls > 0 ? (runsFor * 6) / oversFacedBalls : 0
  const runRateAgainst = oversBowledBalls > 0 ? (runsAgainst * 6) / oversBowledBalls : 0
  const nrr = Number((runRateFor - runRateAgainst).toFixed(3))

  await supabase
    .from("tournament_standings")
    .upsert(
      {
        team_id: teamId,
        matches_played: matchesPlayed,
        wins,
        losses,
        ties,
        points,
        runs_for: runsFor,
        runs_against: runsAgainst,
        overs_faced: ballsToOversDecimal(oversFacedBalls),
        overs_bowled: ballsToOversDecimal(oversBowledBalls),
        nrr,
        last_updated: new Date().toISOString(),
      },
      { onConflict: "team_id" },
    )
}
