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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
    {/* Team 1 - Stacked Layout */}
    <div className="p-4 glass rounded-lg">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-sm font-bold text-primary">{match.team1?.shortCode || 'T1'}</span>
        </div>
        <div>
          <h3 className="text-xl font-bold">{match.team1?.name}</h3>
          <p className="text-sm text-muted-foreground">Innings {team1Score?.innings || 1}</p>
        </div>
      </div>
      
      {/* Score Stacked Below Team Info */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="space-y-1">
          <div className="text-3xl font-bold text-primary">
            {team1Score?.runs || 0}<span className="text-red-400">/</span>{team1Score?.wickets || 0}
          </div>
          <div className="text-sm text-muted-foreground">Runs/Wickets</div>
        </div>
        <div className="space-y-1">
          <div className="text-lg font-bold text-primary">{team1Score?.overs?.toFixed(1) || 0.0}</div>
          <div className="text-sm text-muted-foreground">Overs</div>
          <div className="text-xs text-secondary">RR: {team1Score?.current_rr?.toFixed(2) || "0.00"}</div>
        </div>
      </div>
    </div>

    {/* Match Center Info */}
    <div className="glass rounded-lg p-4 text-center space-y-3">
      {team2Score?.required_rr && (
        <div className="space-y-1">
          <div className="text-lg font-bold">Target: {team1Score?.runs || 0}</div>
          <div className="text-sm text-muted-foreground">
            Need {team1Score?.runs - (team2Score?.runs || 0)} runs • 
            Req RR: {team2Score.required_rr.toFixed(2)}
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <h4 className="font-semibold text-sm">{match.currentOver?.number || 6}th over</h4>
        <div className="flex justify-center gap-1">
          {match.currentOver?.balls?.map((ball, index) => (
            <span key={index} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              ball === 'W' ? 'bg-red-500/30 text-red-300' :
              ball === '4' ? 'bg-green-500/30 text-green-300' :
              ball === '6' ? 'bg-purple-500/30 text-purple-300' :
              'bg-white/10 text-muted-foreground'
            }`}>
              {ball}
            </span>
          )) || ['.', '.', '.', '.', '.', '.'].map((ball, index) => (
            <span key={index} className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-muted-foreground text-xs">
              {ball}
            </span>
          ))}
        </div>
      </div>
    </div>

    {/* Team 2 - Stacked Layout */}
    <div className="p-4 glass rounded-lg">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-sm font-bold text-primary">{match.team2?.shortCode || 'T2'}</span>
        </div>
        <div>
          <h3 className="text-xl font-bold">{match.team2?.name}</h3>
          <p className="text-sm text-muted-foreground">Innings {team2Score?.innings || 1}</p>
        </div>
      </div>
      
      {/* Score Stacked Below Team Info */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="space-y-1">
          <div className="text-3xl font-bold text-primary">
            {team2Score?.runs || 0}<span className="text-red-400">/</span>{team2Score?.wickets || 0}
          </div>
          <div className="text-sm text-muted-foreground">Runs/Wickets</div>
        </div>
        <div className="space-y-1">
          <div className="text-lg font-bold text-primary">{team2Score?.overs?.toFixed(1) || 0.0}</div>
          <div className="text-sm text-muted-foreground">Overs</div>
          {team2Score?.required_rr ? (
            <div className="text-xs text-secondary">Req RR: {team2Score.required_rr.toFixed(2)}</div>
          ) : (
            <div className="text-xs text-secondary">RR: {team2Score?.current_rr?.toFixed(2) || "0.00"}</div>
          )}
        </div>
      </div>
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
</Card>)
      })}
    </div>)
}
