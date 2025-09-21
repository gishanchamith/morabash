import { NextResponse } from "next/server"
import { z } from "zod"

import { getAdminSupabase } from "@/lib/supabase/admin"

const EXTRA_TYPE_ENUM = z.enum(["wide", "no-ball", "bye", "leg-bye"])
const WICKET_TYPE_ENUM = z.enum(["bowled", "caught", "lbw", "run-out", "stumped", "hit-wicket"])

const payloadSchema = z.object({
  innings: z.coerce.number().int().min(1).max(2),
  batsman_id: z.string().min(1),
  bowler_id: z.string().min(1),
  runs: z.coerce.number().int().min(0).max(6),
  extras: z.coerce.number().int().min(0).max(6).default(0),
  extra_type: EXTRA_TYPE_ENUM.nullish().transform((value) => value ?? null),
  wicket_type: WICKET_TYPE_ENUM.nullish().transform((value) => value ?? null),
  wicket_player_id: z
    .string()
    .nullish()
    .transform((value) => (value && value.length > 0 ? value : null)),
  is_free_hit: z.coerce.boolean().optional().default(false),
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

  const raw = await request.json().catch(() => null)
  if (!raw) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
  }

  const parsed = payloadSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 })
  }

  const payload = parsed.data

  if (payload.extras > 0 && !payload.extra_type) {
    return NextResponse.json({ error: "Extra type is required when extras are recorded" }, { status: 400 })
  }

  if (payload.extras === 0 && payload.extra_type) {
    return NextResponse.json({ error: "Extras must be greater than zero when an extra type is selected" }, { status: 400 })
  }

  if (payload.wicket_type && !payload.wicket_player_id) {
    return NextResponse.json({ error: "Select the player dismissed for the chosen wicket type" }, { status: 400 })
  }

  if (!payload.wicket_type) {
    payload.wicket_player_id = null
  }

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("team1_id, team2_id")
    .eq("id", matchId)
    .maybeSingle()

  if (matchError) {
    return NextResponse.json({ error: matchError.message }, { status: 500 })
  }

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 })
  }

  const expectedBattingTeam = payload.innings === 1 ? match.team1_id : match.team2_id
  const expectedBowlingTeam = payload.innings === 1 ? match.team2_id : match.team1_id

  const { data: batsman } = await supabase
    .from("players")
    .select("id, team_id")
    .eq("id", payload.batsman_id)
    .maybeSingle()

  if (!batsman) {
    return NextResponse.json({ error: "Batsman not found" }, { status: 400 })
  }

  if (batsman.team_id !== expectedBattingTeam) {
    return NextResponse.json({ error: "Selected batsman is not part of the batting team for this innings" }, { status: 400 })
  }

  const { data: bowler } = await supabase
    .from("players")
    .select("id, team_id")
    .eq("id", payload.bowler_id)
    .maybeSingle()

  if (!bowler) {
    return NextResponse.json({ error: "Bowler not found" }, { status: 400 })
  }

  if (bowler.team_id !== expectedBowlingTeam) {
    return NextResponse.json({ error: "Selected bowler is not part of the bowling team for this innings" }, { status: 400 })
  }

  if (payload.wicket_player_id) {
    const { data: wicketPlayer } = await supabase
      .from("players")
      .select("id, team_id")
      .eq("id", payload.wicket_player_id)
      .maybeSingle()

    if (!wicketPlayer) {
      return NextResponse.json({ error: "Dismissed player not found" }, { status: 400 })
    }

    if (wicketPlayer.team_id !== expectedBattingTeam) {
      return NextResponse.json({ error: "Dismissed player must belong to the batting team" }, { status: 400 })
    }
  }

  const { data: lastBall } = await supabase
    .from("balls")
    .select("over_number, ball_number, extra_type")
    .eq("match_id", matchId)
    .eq("innings", payload.innings)
    .order("over_number", { ascending: false })
    .order("ball_number", { ascending: false })
    .limit(1)
    .maybeSingle()

  let overNumber = 1
  let ballNumber = 1

  if (lastBall) {
    overNumber = lastBall.over_number
    ballNumber = lastBall.ball_number

    const lastWasLegal = !lastBall.extra_type || !["wide", "no-ball"].includes(lastBall.extra_type)

    if (lastWasLegal) {
      if (ballNumber >= 6) {
        overNumber += 1
        ballNumber = 1
      } else {
        ballNumber += 1
      }
    }
  }

  const insertPayload = {
    match_id: matchId,
    innings: payload.innings,
    over_number: overNumber,
    ball_number: ballNumber,
    batsman_id: payload.batsman_id,
    bowler_id: payload.bowler_id,
    runs: payload.runs,
    extras: payload.extras,
    extra_type: payload.extra_type,
    wicket_type: payload.wicket_type,
    wicket_player_id: payload.wicket_player_id,
    is_free_hit: payload.is_free_hit,
  }

  let insertError = null

  const { error: primaryInsertError } = await supabase.from("balls").insert(insertPayload)
  insertError = primaryInsertError

  if (insertError && String(insertError.message).includes("is_free_hit")) {
    const fallbackPayload = { ...insertPayload }
    delete (fallbackPayload as any).is_free_hit
    const { error: fallbackInsertError } = await supabase.from("balls").insert(fallbackPayload)
    insertError = fallbackInsertError
  }

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 })
  }

  // Recalculate the scoreboard totals in application code so the UI reflects the latest delivery immediately.
  let ballsError = null
  let allBalls: any[] | null = null

  const { data: primaryBalls, error: primaryBallsError } = await supabase
    .from("balls")
    .select("innings, runs, extras, extra_type, wicket_type, is_free_hit")
    .eq("match_id", matchId)

  allBalls = primaryBalls
  ballsError = primaryBallsError

  if (ballsError && String(ballsError.message).includes("is_free_hit")) {
    const { data: fallbackBalls, error: fallbackError } = await supabase
      .from("balls")
      .select("innings, runs, extras, extra_type, wicket_type")
      .eq("match_id", matchId)

    allBalls = fallbackBalls
    ballsError = fallbackError
  }

  if (ballsError) {
    console.error("Failed to load balls for scoreboard refresh", ballsError)
  } else if (allBalls) {
    const totals = new Map<number, { runs: number; wickets: number; legalBalls: number }>()

    allBalls.forEach((ball) => {
      const key = Number(ball.innings) || 1
      const current = totals.get(key) || { runs: 0, wickets: 0, legalBalls: 0 }

      const runs = Number(ball.runs) || 0
      const extras = Number(ball.extras) || 0
      current.runs += runs + extras

      if (ball.wicket_type) {
        current.wickets += 1
      }

      const extraType = ball.extra_type as string | null
      const isLegalDelivery = !extraType || (extraType !== "wide" && extraType !== "no-ball")
      if (isLegalDelivery) {
        current.legalBalls += 1
      }

      totals.set(key, current)
    })

    const makeOvers = (legalBalls: number) => {
      if (legalBalls <= 0) return 0
      const completedOvers = Math.floor(legalBalls / 6)
      const remainingBalls = legalBalls % 6
      return Number(`${completedOvers}.${remainingBalls}`)
    }

    const makeRunRate = (runs: number, legalBalls: number) => {
      if (legalBalls <= 0) return 0
      return Number(((runs * 6) / legalBalls).toFixed(2))
    }

    const inningsOne = totals.get(1) || { runs: 0, wickets: 0, legalBalls: 0 }
    const inningsTwo = totals.get(2) || { runs: 0, wickets: 0, legalBalls: 0 }

    const inningsOneOvers = makeOvers(inningsOne.legalBalls)
    const inningsTwoOvers = makeOvers(inningsTwo.legalBalls)

    const inningsOneRR = makeRunRate(inningsOne.runs, inningsOne.legalBalls)
    const inningsTwoRR = makeRunRate(inningsTwo.runs, inningsTwo.legalBalls)

    let requiredRR: number | null = null
    if (inningsOne.runs > 0) {
      const target = inningsOne.runs + 1
      const runsNeeded = Math.max(0, target - inningsTwo.runs)
      const ballsRemaining = Math.max(0, 120 - inningsTwo.legalBalls)
      if (runsNeeded <= 0) {
        requiredRR = 0
      } else if (ballsRemaining > 0) {
        requiredRR = Number(((runsNeeded * 6) / ballsRemaining).toFixed(2))
      }
    }

    const scoreboardUpdates = [
      {
        match_id: matchId,
        team_id: match.team1_id,
        innings: 1,
        runs: inningsOne.runs,
        wickets: inningsOne.wickets,
        overs: inningsOneOvers,
        current_rr: inningsOneRR,
        required_rr: null,
        updated_at: new Date().toISOString(),
      },
      {
        match_id: matchId,
        team_id: match.team2_id,
        innings: 2,
        runs: inningsTwo.runs,
        wickets: inningsTwo.wickets,
        overs: inningsTwoOvers,
        current_rr: inningsTwoRR,
        required_rr: requiredRR,
        updated_at: new Date().toISOString(),
      },
    ]

    const { error: scoreboardError } = await supabase
      .from("scoreboard")
      .upsert(scoreboardUpdates, { onConflict: "match_id,team_id,innings" })

    if (scoreboardError) {
      console.error("Failed to upsert scoreboard", scoreboardError)
    }
  }

  return NextResponse.json({ data: insertPayload }, { status: 201 })
}
