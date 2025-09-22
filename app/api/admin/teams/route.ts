import { NextResponse } from "next/server"
import { z } from "zod"

import { getAdminSupabase } from "@/lib/supabase/admin"

export const runtime = "edge"

const playerSchema = z.object({
  name: z
    .string({ required_error: "Player name is required" })
    .trim()
    .min(1, "Player name is required")
    .max(100, "Player name must be 100 characters or fewer"),
})

const bodySchema = z.object({
  name: z.string().trim().min(1, "Team name is required"),
  captain: z.string().trim().max(100).optional().nullable(),
  players: z.array(playerSchema).max(20, "Teams can have up to 20 players").optional(),
})

export async function POST(request: Request) {
  const { supabase } = await getAdminSupabase()

  const rawBody = await request.json().catch(() => null)
  if (!rawBody) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 })
  }

  const { name, captain, players = [] } = parsed.data

  const teamPayload = {
    name,
    captain: captain && captain.length > 0 ? captain : null,
  }

  const { error, data } = await supabase.from("teams").insert(teamPayload).select("id").maybeSingle()

  if (error || !data) {
    const status = (error as any)?.code === "23505" ? 409 : 400
    return NextResponse.json({ error: error?.message ?? "Unable to create team", code: (error as any)?.code }, { status })
  }

  if (players.length > 0) {
    const playerPayload = players.map((player, index) => ({
      name: player.name,
      team_id: data.id,
      batting_order: index + 1,
    }))

    const { error: playersError } = await supabase.from("players").insert(playerPayload)

    if (playersError) {
      await supabase.from("teams").delete().eq("id", data.id)
      return NextResponse.json({ error: playersError.message }, { status: 400 })
    }
  }

  return NextResponse.json({ data }, { status: 201 })
}
