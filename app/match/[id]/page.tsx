"use client"

import { useMemo } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Target, TrendingUp, Clock } from "lucide-react"
import { useRealtimeBalls, useRealtimeMatches } from "@/lib/realtime"
import { aggregateScoreboard, normaliseScoreboardRow } from "@/lib/score-utils"

export default function MatchDetailsPage() {
  const params = useParams()
  const matchId = params.id as string
  const { matches, loading: matchesLoading } = useRealtimeMatches()
  const { balls, loading: ballsLoading } = useRealtimeBalls(matchId)

  const match = matches.find((m) => m.id === matchId)

  const sortedBalls = useMemo(
    () =>
      [...balls].sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [balls],
  )
  const rawOversValue = Number(match?.overs_per_innings ?? 20)
  const oversPerInnings = Number.isFinite(rawOversValue) && rawOversValue > 0 ? rawOversValue : 20
  const ballsPerInnings = oversPerInnings * 6

  const aggregatedScoreboard = aggregateScoreboard(balls, { ballsPerInnings })

  const fallbackTeam1 = useMemo(() => {
    const teamId = match?.team1_id
    const row = match?.scoreboard?.find((s: any) => s.team_id === teamId)
    const normalised = normaliseScoreboardRow(row)
    return {
      runs: normalised.runs,
      wickets: normalised.wickets,
      overs: normalised.overs,
      runRate: normalised.runRate,
    }
  }, [match])

  const fallbackTeam2 = useMemo(() => {
    const teamId = match?.team2_id
    const row = match?.scoreboard?.find((s: any) => s.team_id === teamId)
    const normalised = normaliseScoreboardRow(row)
    return {
      runs: normalised.runs,
      wickets: normalised.wickets,
      overs: normalised.overs,
      runRate: normalised.runRate,
      requiredRunRate: normalised.requiredRunRate,
    }
  }, [match])

  const team1Score = aggregatedScoreboard
    ? {
        runs: aggregatedScoreboard.innings1.runs,
        wickets: aggregatedScoreboard.innings1.wickets,
        overs: aggregatedScoreboard.innings1.overs,
        runRate: aggregatedScoreboard.innings1.runRate,
      }
    : fallbackTeam1

  const team2Score = aggregatedScoreboard
    ? {
        runs: aggregatedScoreboard.innings2.runs,
        wickets: aggregatedScoreboard.innings2.wickets,
        overs: aggregatedScoreboard.innings2.overs,
        runRate: aggregatedScoreboard.innings2.runRate,
        requiredRunRate: aggregatedScoreboard.innings2.requiredRunRate,
      }
    : fallbackTeam2

  const latestBall = sortedBalls[sortedBalls.length - 1]
  const activeInnings = latestBall?.innings ?? 1
  const activeInningsBalls = sortedBalls.filter((ball) => ball.innings === activeInnings)
  const activeStriker = activeInningsBalls[activeInningsBalls.length - 1]
  const activeNonStriker = activeInningsBalls
    .slice()
    .reverse()
    .find((ball) => ball.batsman_id && ball.batsman_id !== activeStriker?.batsman_id)

  const isUpcomingFreeHit = latestBall?.extra_type === "no-ball"

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
            <p className="text-sm text-muted-foreground">
              Limited to {oversPerInnings} overs per innings ({ballsPerInnings} balls).
            </p>
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
                  {team1Score.runs}/{team1Score.wickets}
                </div>
                <div className="text-lg text-muted-foreground mb-4">({team1Score.overs} overs)</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Run Rate:</span>
                    <div className="font-semibold text-secondary">{team1Score.runRate.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Innings:</span>
                    <div className="font-semibold">1</div>
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
                  {team2Score.runs}/{team2Score.wickets}
                </div>
                <div className="text-lg text-muted-foreground mb-4">({team2Score.overs} overs)</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Run Rate:</span>
                    <div className="font-semibold text-secondary">{team2Score.runRate.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Required RR:</span>
                    <div className="font-semibold">
                      {team2Score.requiredRunRate === null ? "N/A" : team2Score.requiredRunRate.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass glass-hover mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Target className="h-6 w-6 text-primary" />
              Current Batters (Innings {activeInnings})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 glass rounded-lg border border-primary/30">
                <p className="text-sm text-muted-foreground uppercase tracking-wide">Striker</p>
                <p className="text-xl font-semibold">
                  {activeStriker?.batsman?.name || "TBD"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Facing next delivery{isUpcomingFreeHit ? " • Free Hit" : ""}
                </p>
              </div>
              <div className="p-4 glass rounded-lg border border-secondary/30">
                <p className="text-sm text-muted-foreground uppercase tracking-wide">Non-striker</p>
                <p className="text-xl font-semibold">
                  {activeNonStriker?.batsman?.name || "TBD"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Ready at non-striker's end</p>
              </div>
            </div>
          </CardContent>
        </Card>

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
                      {ball.is_free_hit && (
                        <Badge variant="outline" className="border-secondary text-secondary">
                          Free Hit
                        </Badge>
                      )}
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
