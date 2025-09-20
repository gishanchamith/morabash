import { getAdminSupabase } from "@/lib/supabase/admin"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Settings, Users, Trophy, Target, Calendar, TrendingUp, Plus, Edit } from "lucide-react"

export default async function AdminDashboard() {
  const { supabase, user } = await getAdminSupabase()

  // Fetch dashboard statistics
  const [
    { count: totalTeams },
    { count: totalMatches },
    { count: ongoingMatches },
    { count: completedMatches },
    { data: recentMatches },
    { data: upcomingMatches },
  ] = await Promise.all([
    supabase.from("teams").select("*", { count: "exact", head: true }),
    supabase.from("matches").select("*", { count: "exact", head: true }),
    supabase.from("matches").select("*", { count: "exact", head: true }).eq("status", "ongoing"),
    supabase.from("matches").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase
      .from("matches")
      .select(`
        *,
        team1:teams!matches_team1_id_fkey(name),
        team2:teams!matches_team2_id_fkey(name)
      `)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("matches")
      .select(`
        *,
        team1:teams!matches_team1_id_fkey(name),
        team2:teams!matches_team2_id_fkey(name)
      `)
      .eq("status", "upcoming")
      .order("match_date", { ascending: true })
      .limit(5),
  ])

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-xl text-muted-foreground">
              Welcome back, {user.email} - Tournament Management Control Panel
            </p>
          </div>
          <div className="flex gap-3">
            <Button className="neon-glow" asChild>
              <Link href="/admin/matches/new">
                <Plus className="mr-2 h-4 w-4" />
                New Match
              </Link>
            </Button>
            <Button variant="secondary" className="neon-glow-blue" asChild>
              <Link href="/admin/teams/new">
                <Plus className="mr-2 h-4 w-4" />
                New Team
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass glass-hover">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-primary">{totalTeams || 0}</h3>
                <p className="text-muted-foreground">Total Teams</p>
              </CardContent>
            </Card>
            <Card className="glass glass-hover">
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 text-secondary mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-secondary">{totalMatches || 0}</h3>
                <p className="text-muted-foreground">Total Matches</p>
              </CardContent>
            </Card>
            <Card className="glass glass-hover">
              <CardContent className="p-6 text-center">
                <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-primary">{ongoingMatches || 0}</h3>
                <p className="text-muted-foreground">Live Matches</p>
              </CardContent>
            </Card>
            <Card className="glass glass-hover">
              <CardContent className="p-6 text-center">
                <Target className="h-12 w-12 text-secondary mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-secondary">{completedMatches || 0}</h3>
                <p className="text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass glass-hover group cursor-pointer" asChild>
              <Link href="/admin/score-entry">
                <CardContent className="p-6 text-center">
                  <Edit className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-bold mb-2">Score Entry</h3>
                  <p className="text-sm text-muted-foreground">Update live match scores</p>
                </CardContent>
              </Link>
            </Card>
            <Card className="glass glass-hover group cursor-pointer" asChild>
              <Link href="/admin/matches">
                <CardContent className="p-6 text-center">
                  <Calendar className="h-12 w-12 text-secondary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-bold mb-2">Manage Matches</h3>
                  <p className="text-sm text-muted-foreground">Schedule and control matches</p>
                </CardContent>
              </Link>
            </Card>
            <Card className="glass glass-hover group cursor-pointer" asChild>
              <Link href="/admin/teams">
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-bold mb-2">Manage Teams</h3>
                  <p className="text-sm text-muted-foreground">Edit teams and players</p>
                </CardContent>
              </Link>
            </Card>
            <Card className="glass glass-hover group cursor-pointer" asChild>
              <Link href="/admin/standings">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-12 w-12 text-secondary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-bold mb-2">Update Standings</h3>
                  <p className="text-sm text-muted-foreground">Manage tournament table</p>
                </CardContent>
              </Link>
            </Card>
          </div>
        </section>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Matches */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Trophy className="h-6 w-6 text-primary" />
              Recent Matches
            </h2>
            <div className="space-y-4">
              {recentMatches?.map((match) => (
                <Card key={match.id} className="glass glass-hover">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">
                          {match.team1?.name} vs {match.team2?.name}
                        </div>
                        <div className="text-sm text-muted-foreground">{match.venue}</div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            match.status === "ongoing"
                              ? "default"
                              : match.status === "completed"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {match.status.toUpperCase()}
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          {new Date(match.match_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="glass bg-transparent" asChild>
                        <Link href={`/admin/matches/${match.id}`}>
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Link>
                      </Button>
                      {match.status === "ongoing" && (
                        <Button size="sm" className="neon-glow" asChild>
                          <Link href={`/admin/score-entry/${match.id}`}>
                            <Target className="mr-1 h-3 w-3" />
                            Score
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!recentMatches || recentMatches.length === 0) && (
                <Card className="glass">
                  <CardContent className="p-8 text-center">
                    <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No recent matches found</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>

          {/* Upcoming Matches */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Calendar className="h-6 w-6 text-secondary" />
              Upcoming Matches
            </h2>
            <div className="space-y-4">
              {upcomingMatches?.map((match) => (
                <Card key={match.id} className="glass glass-hover">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">
                          {match.team1?.name} vs {match.team2?.name}
                        </div>
                        <div className="text-sm text-muted-foreground">{match.venue}</div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">UPCOMING</Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          {new Date(match.match_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="glass bg-transparent" asChild>
                        <Link href={`/admin/matches/${match.id}`}>
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Link>
                      </Button>
                      <Button size="sm" variant="secondary" asChild>
                        <Link href={`/admin/matches/${match.id}/start`}>
                          <Trophy className="mr-1 h-3 w-3" />
                          Start
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!upcomingMatches || upcomingMatches.length === 0) && (
                <Card className="glass">
                  <CardContent className="p-8 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No upcoming matches scheduled</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
