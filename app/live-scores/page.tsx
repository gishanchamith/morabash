import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Clock, MapPin, Trophy, Target, TrendingUp } from "lucide-react"

export default async function LiveScoresPage() {
  const supabase = await createClient()

  // Fetch ongoing matches with scoreboard data
  const { data: liveMatches } = await supabase
    .from("matches")
    .select(`
      *,
      team1:teams!matches_team1_id_fkey(name),
      team2:teams!matches_team2_id_fkey(name),
      scoreboard(*)
    `)
    .eq("status", "ongoing")
    .order("match_date", { ascending: true })

  // Fetch recent completed matches
  const { data: recentMatches } = await supabase
    .from("matches")
    .select(`
      *,
      team1:teams!matches_team1_id_fkey(name),
      team2:teams!matches_team2_id_fkey(name),
      winner:teams!matches_winner_id_fkey(name)
    `)
    .eq("status", "completed")
    .order("match_date", { ascending: false })
    .limit(6)

  // Fetch upcoming matches
  const { data: upcomingMatches } = await supabase
    .from("matches")
    .select(`
      *,
      team1:teams!matches_team1_id_fkey(name),
      team2:teams!matches_team2_id_fkey(name)
    `)
    .eq("status", "upcoming")
    .order("match_date", { ascending: true })
    .limit(4)

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Live Cricket Scores
          </h1>
          <p className="text-xl text-muted-foreground">Real-time updates from the tournament</p>
        </div>

        {/* Live Matches */}
        {liveMatches && liveMatches.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              Live Matches
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {liveMatches.map((match) => {
                const team1Score = match.scoreboard?.find((s: any) => s.team_id === match.team1_id)
                const team2Score = match.scoreboard?.find((s: any) => s.team_id === match.team2_id)

                return (
                  <Card key={match.id} className="glass glass-hover border-primary/30">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <Badge className="neon-glow bg-primary/20 text-primary border-primary/50">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse mr-2"></div>
                          LIVE
                        </Badge>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {match.venue}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Team 1 */}
                      <div className="flex justify-between items-center p-4 glass rounded-lg">
                        <div>
                          <h3 className="text-xl font-bold">{match.team1?.name}</h3>
                          <p className="text-sm text-muted-foreground">Innings {team1Score?.innings || 1}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {team1Score?.runs || 0}/{team1Score?.wickets || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">({team1Score?.overs || 0.0} overs)</div>
                          <div className="text-xs text-secondary">
                            RR: {team1Score?.current_rr?.toFixed(2) || "0.00"}
                          </div>
                        </div>
                      </div>

                      {/* Team 2 */}
                      <div className="flex justify-between items-center p-4 glass rounded-lg">
                        <div>
                          <h3 className="text-xl font-bold">{match.team2?.name}</h3>
                          <p className="text-sm text-muted-foreground">Innings {team2Score?.innings || 1}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {team2Score?.runs || 0}/{team2Score?.wickets || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">({team2Score?.overs || 0.0} overs)</div>
                          {team2Score?.required_rr && (
                            <div className="text-xs text-secondary">Req RR: {team2Score.required_rr.toFixed(2)}</div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button size="sm" className="flex-1" asChild>
                          <Link href={`/match/${match.id}`}>
                            <Target className="mr-2 h-4 w-4" />
                            Ball by Ball
                          </Link>
                        </Button>
                        <Button size="sm" variant="secondary" className="flex-1" asChild>
                          <Link href={`/match/${match.id}/scorecard`}>
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Scorecard
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>
        )}

        {/* Recent Results */}
        {recentMatches && recentMatches.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <Trophy className="h-8 w-8 text-secondary" />
              Recent Results
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentMatches.map((match) => (
                <Card key={match.id} className="glass glass-hover">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">COMPLETED</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(match.match_date).toLocaleDateString()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{match.team1?.name}</span>
                        <span className="text-sm text-muted-foreground">vs</span>
                        <span className="font-semibold">{match.team2?.name}</span>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4" />
                          {match.venue}
                        </div>
                        {match.winner && (
                          <div className="p-2 glass rounded-lg">
                            <p className="text-sm font-medium text-primary">
                              <Trophy className="inline h-4 w-4 mr-1" />
                              Winner: {match.winner.name}
                            </p>
                          </div>
                        )}
                      </div>
                      <Button size="sm" variant="outline" className="w-full glass bg-transparent" asChild>
                        <Link href={`/match/${match.id}/scorecard`}>View Scorecard</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Matches */}
        {upcomingMatches && upcomingMatches.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <Clock className="h-8 w-8 text-primary" />
              Upcoming Matches
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {upcomingMatches.map((match) => (
                <Card key={match.id} className="glass glass-hover">
                  <CardHeader>
                    <Badge variant="outline">UPCOMING</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="font-bold text-lg mb-2">{match.team1?.name}</h3>
                        <div className="text-sm text-muted-foreground mb-2">vs</div>
                        <h3 className="font-bold text-lg">{match.team2?.name}</h3>
                      </div>
                      <div className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {new Date(match.match_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {match.venue}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {(!liveMatches || liveMatches.length === 0) &&
          (!recentMatches || recentMatches.length === 0) &&
          (!upcomingMatches || upcomingMatches.length === 0) && (
            <div className="text-center py-16">
              <Card className="glass max-w-md mx-auto">
                <CardContent className="p-12">
                  <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">No Matches Available</h3>
                  <p className="text-muted-foreground mb-6">Check back later for live scores and match updates.</p>
                  <Button asChild>
                    <Link href="/">Back to Home</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
      </div>
    </div>
  )
}
