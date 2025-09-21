import { getAdminSupabase } from "@/lib/supabase/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Trophy, Target, Clock, Edit } from "lucide-react"

export default async function ScoreEntryPage() {
  const { supabase } = await getAdminSupabase()

  // Fetch ongoing matches
  const { data: ongoingMatches } = await supabase
    .from("matches")
    .select(`
      *,
      team1:teams!matches_team1_id_fkey(name),
      team2:teams!matches_team2_id_fkey(name),
      scoreboard(*)
    `)
    .eq("status", "ongoing")
    .order("match_date", { ascending: true })

  // Fetch recent matches that can be edited
  const { data: recentMatches } = await supabase
    .from("matches")
    .select(`
      *,
      team1:teams!matches_team1_id_fkey(name),
      team2:teams!matches_team2_id_fkey(name)
    `)
    .in("status", ["completed", "ongoing"])
    .order("match_date", { ascending: false })
    .limit(8)

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Score Entry
            </h1>
            <p className="text-xl text-muted-foreground">Update live match scores and statistics</p>
          </div>
          <Button variant="outline" className="glass bg-transparent" asChild>
            <Link href="/admin">
              <Clock className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Live Matches */}
        {ongoingMatches && ongoingMatches.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              Live Matches - Score Entry
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {ongoingMatches.map((match) => {
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
                        <span className="text-sm text-muted-foreground">{match.venue}</span>
                      </div>
                      <CardTitle className="text-xl">
                        {match.team1?.name} vs {match.team2?.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Current Score Display */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 glass rounded-lg">
                          <h3 className="font-bold text-lg mb-2">{match.team1?.name}</h3>
                          <div className="text-2xl font-bold text-primary">
                            {team1Score?.runs || 0}/{team1Score?.wickets || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">({team1Score?.overs || 0.0} overs)</div>
                        </div>
                        <div className="text-center p-4 glass rounded-lg">
                          <h3 className="font-bold text-lg mb-2">{match.team2?.name}</h3>
                          <div className="text-2xl font-bold text-primary">
                            {team2Score?.runs || 0}/{team2Score?.wickets || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">({team2Score?.overs || 0.0} overs)</div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Button className="flex-1 neon-glow" asChild>
                          <Link href={`/admin/score-entry/${match.id}`}>
                            <Target className="mr-2 h-4 w-4" />
                            Ball by Ball Entry
                          </Link>
                        </Button>
                        <Button variant="secondary" className="flex-1" asChild>
                          <Link href={`/admin/score-entry/${match.id}/quick`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Quick Update
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

        {/* Recent Matches */}
        <section>
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Trophy className="h-8 w-8 text-secondary" />
            Recent Matches - Edit Scores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recentMatches?.map((match) => (
              <Card key={match.id} className="glass glass-hover">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <Badge
                      variant={
                        match.status === "ongoing" ? "default" : match.status === "completed" ? "secondary" : "outline"
                      }
                    >
                      {match.status.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(match.match_date).toLocaleDateString()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="font-bold text-lg">{match.team1?.name}</h3>
                      <div className="text-sm text-muted-foreground my-2">vs</div>
                      <h3 className="font-bold text-lg">{match.team2?.name}</h3>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">{match.venue}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" asChild>
                        <Link href={`/admin/score-entry/${match.id}`}>
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

        {/* Empty State */}
        {(!ongoingMatches || ongoingMatches.length === 0) && (!recentMatches || recentMatches.length === 0) && (
          <div className="text-center py-16">
            <Card className="glass max-w-md mx-auto">
              <CardContent className="p-12">
                <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No Matches Available</h3>
                <p className="text-muted-foreground mb-6">Create a match to start score entry.</p>
                <Button asChild>
                  <Link href="/admin/matches/new">Create New Match</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
