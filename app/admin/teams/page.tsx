import Link from "next/link"
import { Users, Plus, Edit, Shield } from "lucide-react"

import { getAdminSupabase } from "@/lib/supabase/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DeleteTeamButton } from "@/components/admin/delete-team-button"

type Team = {
  id: string
  name: string | null
  captain: string | null
}

export default async function AdminTeamsPage() {
  const { supabase } = await getAdminSupabase()
  const { data: teams, error } = await supabase
    .from("teams")
    .select("id, name, captain")
    .order("name", { ascending: true })

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Team Management
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Add, edit, or remove teams stored in Supabase. Only admins can access this panel.
            </p>
          </div>
          <div className="flex gap-3">
            <Button className="neon-glow" asChild>
              <Link href="/admin/teams/new">
                <Plus className="h-4 w-4 mr-2" />
                New Team
              </Link>
            </Button>
            <Button variant="outline" className="glass bg-transparent" asChild>
              <Link href="/admin">
                <Shield className="h-4 w-4 mr-2" />
                Admin Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {error ? (
          <Card className="glass border-destructive/40">
            <CardContent className="p-6 text-destructive text-sm space-y-2">
              <p>Unable to load teams from Supabase.</p>
              <p className="text-muted-foreground">
                Confirm that the <code>teams</code> table exists with <code>name</code> and <code>captain</code> columns and that
                row level security policies allow authenticated admin access.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Users className="h-5 w-5 text-primary" /> Registered Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teams && teams.length > 0 ? (
                <div className="space-y-4">
                  {teams.map((team: Team) => (
                    <div
                      key={team.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border border-border/50 p-4 glass-hover"
                    >
                      <div>
                        <h3 className="text-xl font-semibold">{team.name ?? "Unnamed team"}</h3>
                        <p className="text-sm text-muted-foreground">
                          Captain: {team.captain?.trim() || "Not provided"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="hidden sm:inline-flex">
                          Team ID: {team.id.slice(0, 8)}…
                        </Badge>
                        <Button variant="secondary" size="sm" asChild>
                          <Link href={`/admin/teams/${team.id}`}>
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Link>
                        </Button>
                        <DeleteTeamButton teamId={team.id} teamName={team.name ?? "team"} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  No teams found. Use the "New Team" button to add your first team.
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
