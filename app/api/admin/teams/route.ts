import { NextResponse } from "next/server"

import { getAdminSupabase } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  const { supabase } = await getAdminSupabase()
  const { name, captain } = await request.json()

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Team name is required" }, { status: 400 })
  }

  const payload = {
    name: name.trim(),
    captain: captain && typeof captain === "string" && captain.trim() ? captain.trim() : null,
  }

  const { error, data } = await supabase.from("teams").insert(payload).select("id").maybeSingle()

  if (error) {
    const status = (error as any).code === "23505" ? 409 : 400
    return NextResponse.json({ error: error.message, code: (error as any).code }, { status })
  }

  return NextResponse.json({ data }, { status: 201 })
}
