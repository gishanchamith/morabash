import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users } from "lucide-react"

type Team = {
  id: string
  name: string | null
  captain: string | null
}

export default async function TeamsPage() {
  const supabase = await createClient()

  const { data: teams, error } = await supabase
    .from("teams")
    .select("id, name, captain")
    .order("name", { ascending: true })

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Tournament Teams
          </h1>
          <p className="text-lg text-muted-foreground">
            Browse every registered team along with their captain details straight from Supabase.
          </p>
        </header>

        {error ? (
          <Card className="glass border-destructive/40">
            <CardContent className="p-6 text-center text-destructive">
              Unable to load teams right now. Double-check your Supabase credentials and table setup.
            </CardContent>
          </Card>
        ) : (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams?.length ? (
                teams.map((team: Team) => (
                  <Card key={team.id} className="glass glass-hover">
                    <CardHeader className="space-y-2">
                      <CardTitle className="text-xl font-semibold">{team.name || "Unnamed Team"}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Captain: {team.captain?.trim() || "Not provided"}
                      </p>
                    </CardHeader>
                  </Card>
                ))
              ) : (
                <Card className="glass">
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No teams found. Add a few rows to the `teams` table to see them listed here.
                  </CardContent>
                </Card>
              )}
            </section>

            <div className="text-center">
              <Card className="inline-flex flex-col items-center justify-center px-8 py-6 glass">
                <Users className="h-10 w-10 text-primary mb-3" />
                <p className="text-sm text-muted-foreground">Total teams</p>
                <p className="text-2xl font-semibold">{teams?.length ?? 0}</p>
              </Card>
            </div>
          </>
        )}

        <div className="text-center">
          <Button variant="outline" className="glass bg-transparent" asChild>
            <Link href="/">
              <Users className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
