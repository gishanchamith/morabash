import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"
import { fetchScorecardData } from "@/lib/scorecard"

export const runtime = "edge"

type RouteContext = {
  params: {
    matchId: string
  }
}

export async function GET(request: Request, context: RouteContext) {
  const { matchId } = context.params

  if (!matchId) {
    return NextResponse.json({ error: "Match id is required" }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    const data = await fetchScorecardData(supabase, matchId)
    return NextResponse.json({ data })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load scorecard"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
