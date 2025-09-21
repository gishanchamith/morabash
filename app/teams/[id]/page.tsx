import { notFound } from "next/navigation"
import Link from "next/link"
import { Users, ArrowLeft, Medal, BarChart2 } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { computeStandings } from "@/lib/standings"

export default async function TeamDetailsPage({ params }: { params: { id: string } }) {
  const teamId = params.id
  const supabase = await createClient()

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id, name, captain")
    .eq("id", teamId)
    .maybeSingle()

  if (teamError) {
    console.error("Failed to fetch team", teamError)
  }

  if (!team) {
    notFound()
  }

  const { data: players, error: playersError } = await supabase
    .from("players")
    .select("id, name, role")
    .eq("team_id", teamId)
    .order("name")

  if (playersError) {
    console.error("Failed to fetch players for team", playersError)
  }

  const standings = await computeStandings(supabase)
  const teamStanding = standings.find((entry) => entry.team_id === teamId)

  return (
    <div className="min-h-screen py-10 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {team.name || "Unnamed Team"}
              </h1>
            </div>
            <p className="text-muted-foreground">
              Captain: {team.captain?.trim() || "Not assigned"}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="glass bg-transparent" asChild>
              <Link href="/teams">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Teams
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Matches Played</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-3xl font-bold">
              {teamStanding?.matches_played ?? 0}
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Wins</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-3xl font-bold text-primary">
              {teamStanding?.wins ?? 0}
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Losses</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-3xl font-bold text-destructive">
              {teamStanding?.losses ?? 0}
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Points</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-3xl font-bold">
              {teamStanding?.points ?? 0}
            </CardContent>
          </Card>
        </div>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-secondary" /> Team Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="space-y-2">
              <p>
                <span className="font-semibold text-foreground">Losses:</span> {teamStanding?.losses ?? 0}
              </p>
              <p>
                <span className="font-semibold text-foreground">Ties:</span> {teamStanding?.ties ?? 0}
              </p>
              <p>
                <span className="font-semibold text-foreground">Runs For:</span> {teamStanding?.runs_for ?? 0}
              </p>
            </div>
            <div className="space-y-2">
              <p>
                <span className="font-semibold text-foreground">Net Run Rate:</span> {teamStanding ? `${teamStanding.nrr >= 0 ? "+" : ""}${teamStanding.nrr.toFixed(3)}` : "0.000"}
              </p>
              <p>
                <span className="font-semibold text-foreground">Runs Against:</span> {teamStanding?.runs_against ?? 0}
              </p>
              <p>
                <span className="font-semibold text-foreground">Captain:</span> {team.captain?.trim() || "Not assigned"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Medal className="h-5 w-5 text-primary" /> Squad
            </CardTitle>
          </CardHeader>
          <CardContent>
            {players?.length ? (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {players.map((player) => (
                  <li key={player.id} className="glass rounded-lg p-4">
                    <div className="text-lg font-semibold">{player.name}</div>
                    {player.role && <div className="text-sm text-muted-foreground">{player.role}</div>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No players recorded for this team yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
