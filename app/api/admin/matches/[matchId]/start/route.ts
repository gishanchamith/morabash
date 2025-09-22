import { NextResponse } from "next/server"
import { z } from "zod"

import { getAdminSupabase } from "@/lib/supabase/admin"

export const runtime = "edge"

const payloadSchema = z.object({
  toss_winner_id: z.string().uuid().optional().nullable(),
  elected_to: z.enum(["bat", "bowl"]).optional().nullable(),
  overs_per_innings: z.coerce.number().int().min(1).max(90).optional(),
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

  const payload = parsed.data

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("id, status, team1_id, team2_id, overs_per_innings")
    .eq("id", matchId)
    .maybeSingle()

  if (matchError) {
    return NextResponse.json({ error: matchError.message }, { status: 500 })
  }

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 })
  }

  if (match.status !== "upcoming") {
    return NextResponse.json({ error: "Only upcoming matches can be started" }, { status: 400 })
  }

  if (!match.team1_id || !match.team2_id) {
    return NextResponse.json({ error: "Both teams must be assigned before starting the match" }, { status: 400 })
  }

  const updates: Record<string, any> = {
    status: "ongoing",
  }

  if (payload.toss_winner_id !== undefined) {
    updates.toss_winner_id = payload.toss_winner_id
  }

  if (payload.elected_to !== undefined) {
    updates.elected_to = payload.elected_to
  }

  if (payload.overs_per_innings !== undefined) {
    updates.overs_per_innings = payload.overs_per_innings
  }

  const { error: updateError } = await supabase.from("matches").update(updates).eq("id", matchId)
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  const now = new Date().toISOString()
  const scoreboardSeeds = [
    {
      match_id: matchId,
      team_id: match.team1_id,
      innings: 1,
      runs: 0,
      wickets: 0,
      overs: 0,
      current_rr: 0,
      required_rr: null,
      updated_at: now,
    },
    {
      match_id: matchId,
      team_id: match.team2_id,
      innings: 2,
      runs: 0,
      wickets: 0,
      overs: 0,
      current_rr: 0,
      required_rr: null,
      updated_at: now,
    },
  ]

  const { error: scoreboardError } = await supabase
    .from("scoreboard")
    .upsert(scoreboardSeeds, { onConflict: "match_id,team_id,innings" })

  if (scoreboardError) {
    return NextResponse.json({ error: scoreboardError.message }, { status: 500 })
  }

  return NextResponse.json({ data: { matchId } }, { status: 200 })
}
