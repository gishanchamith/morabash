import { getAdminSupabase } from "@/lib/supabase/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, Plus, Edit, Play, Trophy, MapPin } from "lucide-react"

export default async function MatchesManagementPage() {
  const { supabase } = await getAdminSupabase()

  // Fetch all matches
  const { data: matches } = await supabase
    .from("matches")
    .select(`
      *,
      team1:teams!matches_team1_id_fkey(name),
      team2:teams!matches_team2_id_fkey(name),
      winner:teams!matches_winner_id_fkey(name)
    `)
    .order("match_date", { ascending: false })

  // Group matches by status
  const ongoingMatches = matches?.filter((m) => m.status === "ongoing") || []
  const upcomingMatches = matches?.filter((m) => m.status === "upcoming") || []
  const completedMatches = matches?.filter((m) => m.status === "completed") || []

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Match Management
            </h1>
            <p className="text-xl text-muted-foreground">Schedule, control, and manage tournament matches</p>
          </div>
          <div className="flex gap-3">
            <Button className="neon-glow" asChild>
              <Link href="/admin/matches/new">
                <Plus className="mr-2 h-4 w-4" />
                New Match
              </Link>
            </Button>
            <Button variant="outline" className="glass bg-transparent" asChild>
              <Link href="/admin">
                <Calendar className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass glass-hover text-center">
              <CardContent className="p-6">
                <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold">{matches?.length || 0}</h3>
                <p className="text-muted-foreground">Total Matches</p>
              </CardContent>
            </Card>
            <Card className="glass glass-hover text-center">
              <CardContent className="p-6">
                <Play className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold">{ongoingMatches.length}</h3>
                <p className="text-muted-foreground">Live Matches</p>
              </CardContent>
            </Card>
            <Card className="glass glass-hover text-center">
              <CardContent className="p-6">
                <Calendar className="h-12 w-12 text-secondary mx-auto mb-4" />
                <h3 className="text-2xl font-bold">{upcomingMatches.length}</h3>
                <p className="text-muted-foreground">Upcoming</p>
              </CardContent>
            </Card>
            <Card className="glass glass-hover text-center">
              <CardContent className="p-6">
                <Trophy className="h-12 w-12 text-secondary mx-auto mb-4" />
                <h3 className="text-2xl font-bold">{completedMatches.length}</h3>
                <p className="text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Live Matches */}
        {ongoingMatches.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              Live Matches
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {ongoingMatches.map((match) => (
                <Card key={match.id} className="glass glass-hover border-primary/30">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <Badge className="neon-glow bg-primary/20 text-primary border-primary/50">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse mr-2"></div>
                        LIVE
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(match.match_date).toLocaleDateString()}
                      </span>
                    </div>
                    <CardTitle className="text-xl">
                      {match.team1?.name} vs {match.team2?.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {match.venue}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 neon-glow" asChild>
                          <Link href={`/admin/score-entry/${match.id}`}>
                            <Edit className="mr-1 h-3 w-3" />
                            Score Entry
                          </Link>
                        </Button>
                        <Button size="sm" variant="secondary" className="flex-1" asChild>
                          <Link href={`/admin/matches/${match.id}`}>
                            <Edit className="mr-1 h-3 w-3" />
                            Edit Match
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Matches */}
        {upcomingMatches.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <Calendar className="h-8 w-8 text-secondary" />
              Upcoming Matches
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingMatches.map((match) => (
                <Card key={match.id} className="glass glass-hover">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">UPCOMING</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(match.match_date).toLocaleDateString()}
                      </span>
                    </div>
                    <CardTitle className="text-lg">
                      {match.team1?.name} vs {match.team2?.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {match.venue}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" asChild>
                          <Link href={`/admin/matches/${match.id}/start`}>
                            <Play className="mr-1 h-3 w-3" />
                            Start
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 glass bg-transparent" asChild>
                          <Link href={`/admin/matches/${match.id}`}>
                            <Edit className="mr-1 h-3 w-3" />
                            Edit
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Completed Matches */}
        {completedMatches.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <Trophy className="h-8 w-8 text-primary" />
              Completed Matches
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {completedMatches.map((match) => (
                <Card key={match.id} className="glass glass-hover">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">COMPLETED</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(match.match_date).toLocaleDateString()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="font-bold">{match.team1?.name}</h3>
                        <div className="text-sm text-muted-foreground my-1">vs</div>
                        <h3 className="font-bold">{match.team2?.name}</h3>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4" />
                          {match.venue}
                        </div>
                        {match.winner && (
                          <div className="p-2 glass rounded-lg">
                            <p className="text-sm font-medium text-primary">Winner: {match.winner.name}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 glass bg-transparent" asChild>
                          <Link href={`/admin/matches/${match.id}`}>
                            <Edit className="mr-1 h-3 w-3" />
                            Edit
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 glass bg-transparent" asChild>
                          <Link href={`/match/${match.id}/scorecard`}>
                            <Trophy className="mr-1 h-3 w-3" />
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {(!matches || matches.length === 0) && (
          <div className="text-center py-16">
            <Card className="glass max-w-md mx-auto">
              <CardContent className="p-12">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No Matches Found</h3>
                <p className="text-muted-foreground mb-6">Create your first match to get started.</p>
                <Button asChild>
                  <Link href="/admin/matches/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Match
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
