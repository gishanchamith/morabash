"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MapPin, Target, TrendingUp } from "lucide-react"
import { useRealtimeMatches } from "@/lib/realtime"

export function LiveScoreCard() {
  const { matches, loading } = useRealtimeMatches()

  if (loading) {
    return (
      <Card className="glass">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-8 bg-muted rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const liveMatches = matches.filter((match) => match.status === "ongoing")

  if (liveMatches.length === 0) {
    return (
      <Card className="glass">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No live matches at the moment</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
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
                  <div className="text-xs text-secondary">RR: {team1Score?.current_rr?.toFixed(2) || "0.00"}</div>
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
  )
}
