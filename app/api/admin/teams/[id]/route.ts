import { NextResponse } from "next/server"
import { z } from "zod"

import { getAdminSupabase } from "@/lib/supabase/admin"

type RouteContext = {
  params: { id: string }
}

const playerSchema = z.object({
  id: z.string().uuid().optional(),
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

export async function PUT(request: Request, context: RouteContext) {
  const { id } = context.params
  const { supabase } = await getAdminSupabase()

  const rawBody = await request.json().catch(() => null)
  if (!rawBody) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 })
  }

  const { name, captain, players } = parsed.data

  const payload = {
    name,
    captain: captain && captain.length > 0 ? captain : null,
  }

  const { error } = await supabase.from("teams").update(payload).eq("id", id)

  if (error) {
    const status = (error as any).code === "23505" ? 409 : 400
    return NextResponse.json({ error: error.message, code: (error as any).code }, { status })
  }

  if (players) {
    const preparedPlayers = players.map((player, index) => ({
      id: player.id ?? null,
      name: player.name,
      batting_order: index + 1,
    }))

    const { data: existingPlayers, error: existingError } = await supabase
      .from("players")
      .select("id")
      .eq("team_id", id)

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 })
    }

    const existingIds = new Set((existingPlayers ?? []).map((player) => player.id))
    const payloadIds = new Set(preparedPlayers.filter((player) => player.id).map((player) => player.id as string))

    const idsToRemove = [...existingIds].filter((playerId) => !payloadIds.has(playerId))
    if (idsToRemove.length > 0) {
      const { error: deleteError } = await supabase.from("players").delete().in("id", idsToRemove)
      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 })
      }
    }

    const updates = preparedPlayers
      .filter((player) => player.id)
      .map((player) => ({
        id: player.id as string,
        name: player.name,
        team_id: id,
        batting_order: player.batting_order,
      }))

    if (updates.length > 0) {
      const { error: updatePlayersError } = await supabase.from("players").upsert(updates, { onConflict: "id" })
      if (updatePlayersError) {
        return NextResponse.json({ error: updatePlayersError.message }, { status: 400 })
      }
    }

    const inserts = preparedPlayers
      .filter((player) => !player.id)
      .map((player) => ({
        name: player.name,
        team_id: id,
        batting_order: player.batting_order,
      }))

    if (inserts.length > 0) {
      const { error: insertPlayersError } = await supabase.from("players").insert(inserts)
      if (insertPlayersError) {
        return NextResponse.json({ error: insertPlayersError.message }, { status: 400 })
      }
    }
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = context.params
  const { supabase } = await getAdminSupabase()

  const { error } = await supabase.from("teams").delete().eq("id", id)

  if (error) {
    const status = (error as any).code === "23503" ? 409 : 400
    return NextResponse.json({ error: error.message, code: (error as any).code }, { status })
  }

  return NextResponse.json({ success: true })
}
