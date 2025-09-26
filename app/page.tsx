import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Trophy, Users, Calendar, TrendingUp } from "lucide-react"
import { LiveScoreCard } from "@/components/live-score-card"
import { LiveStandings } from "@/components/live-standings"

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch basic stats for initial load
  const [{ count: totalTeams }, { count: totalMatches }, { count: ongoingMatches }, { count: completedMatches }] =
    await Promise.all([
      supabase.from("teams").select("*", { count: "exact", head: true }),
      supabase.from("matches").select("*", { count: "exact", head: true }),
      supabase.from("matches").select("*", { count: "exact", head: true }).eq("status", "ongoing"),
      supabase.from("matches").select("*", { count: "exact", head: true }).eq("status", "completed"),
    ])

  // Fetch recent matches
  const { data: recentMatches } = await supabase
    .from("matches")
    .select(`
      *,
      team1:teams!matches_team1_id_fkey(name),
      team2:teams!matches_team2_id_fkey(name),
      winner:teams!matches_winner_id_fkey(name)
    `)
    .order("match_date", { ascending: false })
    .limit(3)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="glass rounded-3xl p-12 mb-8">
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MORA BASH 2025
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experience the thrill of live cricket with real-time scores, detailed statistics, and comprehensive
              tournament management.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" className="neon-glow" asChild>
                <Link href="/live-scores">
                  <Trophy className="mr-2 h-5 w-5" />
                  Live Scores
                </Link>
              </Button>
              <Button size="lg" variant="secondary" className="neon-glow-blue" asChild>
                <Link href="/standings">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Standings
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      {/* <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="glass glass-hover text-center">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold">{totalTeams || 0}</h3>
                <p className="text-muted-foreground">Teams</p>
              </CardContent>
            </Card>
            <Card className="glass glass-hover text-center">
              <CardContent className="p-6">
                <Calendar className="h-12 w-12 text-secondary mx-auto mb-4" />
                <h3 className="text-2xl font-bold">{totalMatches || 0}</h3>
                <p className="text-muted-foreground">Matches</p>
              </CardContent>
            </Card>
            <Card className="glass glass-hover text-center">
              <CardContent className="p-6">
                <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold">{ongoingMatches || 0}</h3>
                <p className="text-muted-foreground">Live Matches</p>
              </CardContent>
            </Card>
            <Card className="glass glass-hover text-center">
              <CardContent className="p-6">
                <TrendingUp className="h-12 w-12 text-secondary mx-auto mb-4" />
                <h3 className="text-2xl font-bold">{completedMatches || 0}</h3>
                <p className="text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section> */}

      {/* Live Scores Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-3">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            Live Matches
          </h2>
          <LiveScoreCard />
        </div>
      </section>

      {/* Live Standings */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-3">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            Live Standings
          </h2>
          <LiveStandings />
          <div className="text-center mt-8">
            <Button variant="outline" className="glass glass-hover bg-transparent" asChild>
              <Link href="/standings">View Full Standings</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Recent Matches */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Recent Matches</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentMatches?.map((match) => (
              <Card key={match.id} className="glass glass-hover">
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{match.team1?.name}</span>
                      <span className="text-sm">vs</span>
                      <span className="font-semibold">{match.team2?.name}</span>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">{match.venue}</p>
                      {match.winner && (
                        <p className="text-sm font-medium text-primary mt-2">Winner: {match.winner.name}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass glass-hover text-center">
              <CardContent className="p-8">
                <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Live Scores</h3>
                <p className="text-muted-foreground mb-4">Follow live matches with ball-by-ball updates</p>
                <Button className="w-full" asChild>
                  <Link href="/live-scores">View Live Scores</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="glass glass-hover text-center">
              <CardContent className="p-8">
                <Users className="h-16 w-16 text-secondary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Teams</h3>
                <p className="text-muted-foreground mb-4">Explore team profiles and player statistics</p>
                <Button variant="secondary" className="w-full" asChild>
                  <Link href="/teams">View Teams</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="glass glass-hover text-center">
              <CardContent className="p-8">
                <TrendingUp className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Standings</h3>
                <p className="text-muted-foreground mb-4">Check tournament points table and rankings</p>
                <Button className="w-full" asChild>
                  <Link href="/standings">View Standings</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
