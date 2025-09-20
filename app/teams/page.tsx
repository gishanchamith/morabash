import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Trophy, Target, TrendingUp } from "lucide-react"

export default async function TeamsPage() {
  const supabase = await createClient()

  // Fetch all teams with their standings
  const { data: teams } = await supabase
    .from("teams")
    .select(`
      *,
      tournament_standings(
        matches_played,
        wins,
        losses,
        points,
        nrr
      )
    `)
    .order("name", { ascending: true })

  // Fetch player counts for each team
  const { data: playerCounts } = await supabase
    .from("players")
    .select("team_id")
    .then(({ data }) => {
      const counts: Record<string, number> = {}
      data?.forEach((player) => {
        counts[player.team_id] = (counts[player.team_id] || 0) + 1
      })
      return counts
    })

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Tournament Teams
          </h1>
          <p className="text-xl text-muted-foreground">Meet the 11 teams competing in the championship</p>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teams?.map((team) => {
            const standings = team.tournament_standings?.[0]
            const playerCount = playerCounts?.[team.id] || 0

            return (
              <Card key={team.id} className="glass glass-hover group">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-primary-foreground" />
                    </div>
                    {standings && standings.points > 0 && (
                      <Badge className="neon-glow bg-primary/20 text-primary border-primary/50">
                        {standings.points} pts
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">{team.name}</CardTitle>
                  {team.captain_name && <p className="text-sm text-muted-foreground">Captain: {team.captain_name}</p>}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Team Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 glass rounded-lg">
                      <div className="text-lg font-bold text-primary">{playerCount}</div>
                      <div className="text-xs text-muted-foreground">Players</div>
                    </div>
                    <div className="text-center p-3 glass rounded-lg">
                      <div className="text-lg font-bold text-secondary">{standings?.matches_played || 0}</div>
                      <div className="text-xs text-muted-foreground">Matches</div>
                    </div>
                  </div>

                  {/* Performance Stats */}
                  {standings && standings.matches_played > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Wins</span>
                        <span className="font-semibold text-primary">{standings.wins}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Losses</span>
                        <span className="font-semibold">{standings.losses}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">NRR</span>
                        <span className="font-semibold text-secondary">{standings.nrr.toFixed(3)}</span>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button size="sm" className="w-full" asChild>
                    <Link href={`/teams/${team.id}`}>
                      <Users className="mr-2 h-4 w-4" />
                      View Team
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Stats */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Tournament Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass glass-hover text-center">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold">{teams?.length || 0}</h3>
                <p className="text-muted-foreground">Total Teams</p>
              </CardContent>
            </Card>
            <Card className="glass glass-hover text-center">
              <CardContent className="p-6">
                <Target className="h-12 w-12 text-secondary mx-auto mb-4" />
                <h3 className="text-2xl font-bold">
                  {Object.values(playerCounts || {}).reduce((sum, count) => sum + count, 0)}
                </h3>
                <p className="text-muted-foreground">Total Players</p>
              </CardContent>
            </Card>
            <Card className="glass glass-hover text-center">
              <CardContent className="p-6">
                <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold">
                  {teams?.reduce((sum, team) => sum + (team.tournament_standings?.[0]?.matches_played || 0), 0) || 0}
                </h3>
                <p className="text-muted-foreground">Matches Played</p>
              </CardContent>
            </Card>
            <Card className="glass glass-hover text-center">
              <CardContent className="p-6">
                <TrendingUp className="h-12 w-12 text-secondary mx-auto mb-4" />
                <h3 className="text-2xl font-bold">
                  {teams?.filter((team) => (team.tournament_standings?.[0]?.wins || 0) > 0).length || 0}
                </h3>
                <p className="text-muted-foreground">Teams with Wins</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Navigation */}
        <div className="text-center mt-12">
          <div className="flex gap-4 justify-center flex-wrap">
            <Button variant="outline" className="glass bg-transparent" asChild>
              <Link href="/standings">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Standings
              </Link>
            </Button>
            <Button variant="outline" className="glass bg-transparent" asChild>
              <Link href="/live-scores">
                <Trophy className="mr-2 h-4 w-4" />
                Live Scores
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
