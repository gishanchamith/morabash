import { notFound } from "next/navigation"

import { StartMatchClient } from "@/components/admin/start-match-client"
import { getAdminSupabase } from "@/lib/supabase/admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Target } from "lucide-react"

export default async function StartMatchPage({ params }: { params: { matchId: string } }) {
  const { matchId } = params
  const { supabase } = await getAdminSupabase()

  const { data: match, error } = await supabase
    .from("matches")
    .select(`
      id,
      status,
      venue,
      match_date,
      overs_per_innings,
      toss_winner_id,
      elected_to,
      team1:teams!matches_team1_id_fkey(id, name),
      team2:teams!matches_team2_id_fkey(id, name)
    `)
    .eq("id", matchId)
    .maybeSingle()

  if (error) {
    console.error("Failed to load match for start page", error)
  }

  if (!match) {
    notFound()
  }

  const resolveTeam = (team: any, fallback: string) => {
    if (!team) return { id: "", name: fallback }
    if (Array.isArray(team)) {
      const first = team[0]
      return { id: first?.id ?? "", name: first?.name ?? fallback }
    }
    return { id: team.id ?? "", name: team.name ?? fallback }
  }

  const team1 = resolveTeam(match.team1, "Team 1")
  const team2 = resolveTeam(match.team2, "Team 2")

  if (!team1.id || !team2.id) {
    return (
      <div className="min-h-screen py-8 px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Target className="h-5 w-5 text-primary" /> Unable to start match
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>This match is missing one or both competing teams.</p>
              <p>Please edit the match and assign both teams before trying again.</p>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href="/admin/matches">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to matches
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={`/admin/matches/${matchId}`}>
                    Edit match
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (match.status !== "upcoming") {
    return (
      <div className="min-h-screen py-8 px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Target className="h-5 w-5 text-primary" /> Match already {match.status}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>This fixture is currently marked as {match.status}. You can manage it from the options below.</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" asChild>
                  <Link href="/admin/matches">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to matches
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={`/admin/score-entry/${matchId}`}>
                    Go to score entry
                  </Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link href={`/admin/matches/${matchId}`}>
                    Edit match
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const matchPayload = {
    id: match.id,
    venue: match.venue,
    match_date: match.match_date,
    team1,
    team2,
    overs_per_innings: match.overs_per_innings,
    toss_winner_id: match.toss_winner_id,
    elected_to: match.elected_to,
  } as const

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <StartMatchClient match={matchPayload} />
      </div>
    </div>
  )
}
