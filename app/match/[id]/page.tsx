"use client"

import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Target, TrendingUp, Clock } from "lucide-react"
import { useRealtimeBalls, useRealtimeMatches } from "@/lib/realtime"

export default function MatchDetailsPage() {
  const params = useParams()
  const matchId = params.id as string
  const { matches, loading: matchesLoading } = useRealtimeMatches()
  const { balls, loading: ballsLoading } = useRealtimeBalls(matchId)

  const match = matches.find((m) => m.id === matchId)

  if (matchesLoading) {
    return (
      <div className="min-h-screen py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="glass">
            <CardContent className="p-12 text-center">
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-1/2 mx-auto mb-4"></div>
                <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="min-h-screen py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="glass">
            <CardContent className="p-12 text-center">
              <h3 className="text-xl font-bold mb-2">Match Not Found</h3>
              <p className="text-muted-foreground mb-6">The requested match could not be found.</p>
              <Button asChild>
                <Link href="/live-scores">Back to Live Scores</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const team1Score = match.scoreboard?.find((s: any) => s.team_id === match.team1_id)
  const team2Score = match.scoreboard?.find((s: any) => s.team_id === match.team2_id)

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" className="glass bg-transparent" asChild>
            <Link href="/live-scores">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {match.team1?.name} vs {match.team2?.name}
            </h1>
            <p className="text-muted-foreground">{match.venue}</p>
          </div>
          <Badge
            className={
              match.status === "ongoing" ? "neon-glow bg-primary/20 text-primary border-primary/50 ml-auto" : "ml-auto"
            }
            variant={match.status === "ongoing" ? "default" : match.status === "completed" ? "secondary" : "outline"}
          >
            {match.status === "ongoing" && <div className="w-2 h-2 bg-primary rounded-full animate-pulse mr-2"></div>}
            {match.status.toUpperCase()}
          </Badge>
        </div>

        {/* Live Score */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Team 1 Score */}
          <Card className="glass glass-hover">
            <CardHeader>
              <CardTitle className="text-2xl">{match.team1?.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {team1Score?.runs || 0}/{team1Score?.wickets || 0}
                </div>
                <div className="text-lg text-muted-foreground mb-4">({team1Score?.overs || 0.0} overs)</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Run Rate:</span>
                    <div className="font-semibold text-secondary">{team1Score?.current_rr?.toFixed(2) || "0.00"}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Innings:</span>
                    <div className="font-semibold">{team1Score?.innings || 1}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team 2 Score */}
          <Card className="glass glass-hover">
            <CardHeader>
              <CardTitle className="text-2xl">{match.team2?.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {team2Score?.runs || 0}/{team2Score?.wickets || 0}
                </div>
                <div className="text-lg text-muted-foreground mb-4">({team2Score?.overs || 0.0} overs)</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Run Rate:</span>
                    <div className="font-semibold text-secondary">{team2Score?.current_rr?.toFixed(2) || "0.00"}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Required RR:</span>
                    <div className="font-semibold">{team2Score?.required_rr?.toFixed(2) || "N/A"}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ball by Ball Commentary */}
        <Card className="glass mb-8">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              Ball by Ball Commentary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ballsLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center p-4 glass rounded-lg">
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : balls.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {balls.map((ball, index) => (
                  <div key={ball.id} className="flex justify-between items-center p-4 glass rounded-lg">
                    <div>
                      <span className="font-semibold">
                        Over {ball.over_number}.{ball.ball_number}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        {ball.batsman?.name} to {ball.bowler?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {ball.runs > 0 && (
                        <Badge variant="secondary" className="text-primary">
                          {ball.runs} runs
                        </Badge>
                      )}
                      {ball.extras > 0 && (
                        <Badge variant="outline" className="text-secondary">
                          {ball.extras} {ball.extra_type}
                        </Badge>
                      )}
                      {ball.wicket_type && (
                        <Badge variant="destructive" className="text-destructive-foreground">
                          {ball.wicket_type}
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        <Clock className="inline h-3 w-3 mr-1" />
                        {new Date(ball.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No ball-by-ball data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button className="neon-glow" asChild>
            <Link href={`/match/${matchId}/scorecard`}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Full Scorecard
            </Link>
          </Button>
          <Button variant="secondary" className="neon-glow-blue" asChild>
            <Link href="/live-scores">
              <Target className="mr-2 h-4 w-4" />
              All Live Scores
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
