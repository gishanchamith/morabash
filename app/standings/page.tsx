import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Trophy, TrendingUp, Target, Medal } from "lucide-react"

export default async function StandingsPage() {
  const supabase = await createClient()

  // Fetch tournament standings with team details
  const { data: standings } = await supabase
    .from("tournament_standings")
    .select(`
      *,
      team:teams(name, captain)
    `)
    .order("points", { ascending: false })
    .order("nrr", { ascending: false })

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Tournament Standings
          </h1>
          <p className="text-xl text-muted-foreground">Current points table and team rankings</p>
        </div>

        {/* Points Table */}
        <Card className="glass mb-12">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Trophy className="h-8 w-8 text-primary" />
              Points Table
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-4 px-2 font-semibold">Pos</th>
                    <th className="text-left py-4 px-2 font-semibold">Team</th>
                    <th className="text-center py-4 px-2 font-semibold">M</th>
                    <th className="text-center py-4 px-2 font-semibold">W</th>
                    <th className="text-center py-4 px-2 font-semibold">L</th>
                    <th className="text-center py-4 px-2 font-semibold">T</th>
                    <th className="text-center py-4 px-2 font-semibold">Pts</th>
                    <th className="text-center py-4 px-2 font-semibold">NRR</th>
                  </tr>
                </thead>
                <tbody>
                  {standings?.map((standing, index) => (
                    <tr
                      key={standing.team_id}
                      className="border-b border-border/30 hover:bg-accent/20 transition-colors"
                    >
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">#{index + 1}</span>
                          {index === 0 && <Medal className="h-5 w-5 text-primary" />}
                          {index === 1 && <Medal className="h-5 w-5 text-secondary" />}
                          {index === 2 && <Medal className="h-5 w-5 text-muted-foreground" />}
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div>
                          <div className="font-semibold text-lg">{standing.team?.name}</div>
                          {standing.team?.captain && (
                            <div className="text-sm text-muted-foreground">{standing.team.captain}</div>
                          )}
                        </div>
                      </td>
                      <td className="text-center py-4 px-2 font-semibold">{standing.matches_played}</td>
                      <td className="text-center py-4 px-2 font-semibold text-primary">{standing.wins}</td>
                      <td className="text-center py-4 px-2 font-semibold text-destructive">{standing.losses}</td>
                      <td className="text-center py-4 px-2 font-semibold text-muted-foreground">{standing.ties}</td>
                      <td className="text-center py-4 px-2">
                        <Badge className="neon-glow bg-primary/20 text-primary border-primary/50">
                          {standing.points}
                        </Badge>
                      </td>
                      <td className="text-center py-4 px-2 font-semibold text-secondary">
                        {standing.nrr >= 0 ? "+" : ""}
                        {standing.nrr.toFixed(3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-secondary" />
            Top Performers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Most Wins */}
            {standings && standings.length > 0 && (
              <Card className="glass glass-hover">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-primary" />
                    Most Wins
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <h3 className="text-xl font-bold mb-2">{standings[0]?.team?.name}</h3>
                    <div className="text-3xl font-bold text-primary mb-2">{standings[0]?.wins}</div>
                    <p className="text-sm text-muted-foreground">out of {standings[0]?.matches_played} matches</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Best NRR */}
            {standings && standings.length > 0 && (
              <Card className="glass glass-hover">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-6 w-6 text-secondary" />
                    Best Net Run Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <h3 className="text-xl font-bold mb-2">{standings.sort((a, b) => b.nrr - a.nrr)[0]?.team?.name}</h3>
                    <div className="text-3xl font-bold text-secondary mb-2">
                      {standings.sort((a, b) => b.nrr - a.nrr)[0]?.nrr >= 0 ? "+" : ""}
                      {standings.sort((a, b) => b.nrr - a.nrr)[0]?.nrr.toFixed(3)}
                    </div>
                    <p className="text-sm text-muted-foreground">Net Run Rate</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Most Active */}
            {standings && standings.length > 0 && (
              <Card className="glass glass-hover">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Medal className="h-6 w-6 text-primary" />
                    Most Active
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <h3 className="text-xl font-bold mb-2">
                      {standings.sort((a, b) => b.matches_played - a.matches_played)[0]?.team?.name}
                    </h3>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {standings.sort((a, b) => b.matches_played - a.matches_played)[0]?.matches_played}
                    </div>
                    <p className="text-sm text-muted-foreground">Matches Played</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Tournament Format Info */}
        <Card className="glass mb-12">
          <CardHeader>
            <CardTitle className="text-xl">Tournament Format</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Points System</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Win: 2 points</li>
                  <li>• Tie/No Result: 1 point</li>
                  <li>• Loss: 0 points</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Ranking Criteria</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• 1. Total Points</li>
                  <li>• 2. Net Run Rate (NRR)</li>
                  <li>• 3. Head-to-head record</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="text-center">
          <div className="flex gap-4 justify-center flex-wrap">
            <Button className="neon-glow" asChild>
              <Link href="/live-scores">
                <Trophy className="mr-2 h-4 w-4" />
                Live Scores
              </Link>
            </Button>
            <Button variant="secondary" className="neon-glow-blue" asChild>
              <Link href="/teams">
                <Target className="mr-2 h-4 w-4" />
                View Teams
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
