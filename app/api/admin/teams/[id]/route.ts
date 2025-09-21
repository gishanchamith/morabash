import { NextResponse } from "next/server"

import { getAdminSupabase } from "@/lib/supabase/admin"

type RouteContext = {
  params: { id: string }
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = context.params
  const { supabase } = await getAdminSupabase()
  const { name, captain } = await request.json()

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Team name is required" }, { status: 400 })
  }

  const payload = {
    name: name.trim(),
    captain: captain && typeof captain === "string" && captain.trim() ? captain.trim() : null,
  }

  const { error } = await supabase.from("teams").update(payload).eq("id", id)

  if (error) {
    const status = (error as any).code === "23505" ? 409 : 400
    return NextResponse.json({ error: error.message, code: (error as any).code }, { status })
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
