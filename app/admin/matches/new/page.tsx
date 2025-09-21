import { MatchForm, type MatchTeamOption } from "@/components/admin/match-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { getAdminSupabase } from "@/lib/supabase/admin"
import Link from "next/link"
import { Users, AlertTriangle } from "lucide-react"

export default async function NewMatchPage() {
  const { supabase } = await getAdminSupabase()

  const { data: teamRows, error } = await supabase
    .from("teams")
    .select("id, name")
    .order("name", { ascending: true })

  if (error) {
    console.error("Failed to load teams for match form", error)
  }

  const teams: MatchTeamOption[] = (teamRows ?? []).map((team) => ({
    id: team.id,
    name: team.name ?? "Unnamed Team",
  }))

  const hasTeams = teams.length >= 2

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Schedule New Match
          </h1>
          <p className="text-muted-foreground">
            Set up upcoming fixtures by selecting the competing teams, venue, and match timing.
          </p>
        </div>

        {!hasTeams && (
          <Alert variant="destructive" className="glass border-destructive/40 bg-destructive/10">
            <AlertTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Add more teams first
            </AlertTitle>
            <AlertDescription className="space-y-3">
              <p>At least two teams are required to schedule a match.</p>
              <Button size="sm" variant="outline" className="glass bg-transparent" asChild>
                <Link href="/admin/teams/new" className="inline-flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Create Team
                </Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {hasTeams && <MatchForm mode="create" teams={teams} />}
      </div>
    </div>
  )
}
