import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, BarChart3, Trophy } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table"
import { createClient } from "@/lib/supabase/server"
import { fetchScorecardData } from "@/lib/scorecard"

function formatDate(value: string | null) {
  if (!value) return ""
  const date = new Date(value)
  return date.toLocaleString()
}

type PageProps = {
  params: { id: string }
}

export default async function MatchScorecardPage({ params }: PageProps) {
  const matchId = params.id
  const supabase = await createClient()

  let scorecard
  try {
    scorecard = await fetchScorecardData(supabase, matchId)
  } catch (error) {
    notFound()
  }

  if (!scorecard) {
    notFound()
  }

  const result = scorecard.result

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Full Scorecard
            </h1>
            <p className="text-muted-foreground">
              {scorecard.match.team1.name} vs {scorecard.match.team2.name} @ {scorecard.match.venue || "Venue TBC"}
            </p>
            <p className="text-sm text-muted-foreground">{formatDate(scorecard.match.matchDate)}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="glass bg-transparent" asChild>
              <Link href={`/match/${matchId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Live View
              </Link>
            </Button>
            <Button className="neon-glow" asChild>
              <Link href="/live-scores">
                <BarChart3 className="mr-2 h-4 w-4" /> Live Scores
              </Link>
            </Button>
          </div>
        </div>

        {result && (
          <Card className="glass border-primary/40">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Result</p>
                  <h2 className="text-2xl font-semibold text-primary">
                    {result.winnerName ? `${result.winnerName} won` : "Match completed"}
                    {result.margin ? ` by ${result.margin}` : ""}
                  </h2>
                </div>
                {result.winnerName && (
                  <Badge variant="secondary" className="text-sm">
                    <Trophy className="h-4 w-4 mr-2" /> Winner: {result.winnerName}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {scorecard.innings.map((innings) => {
          const extrasToString = () => {
            const fragments: string[] = []
            if (innings.extras.wides) fragments.push(`w ${innings.extras.wides}`)
            if (innings.extras.noBalls) fragments.push(`nb ${innings.extras.noBalls}`)
            if (innings.extras.byes) fragments.push(`b ${innings.extras.byes}`)
            if (innings.extras.legByes) fragments.push(`lb ${innings.extras.legByes}`)
            if (innings.extras.others) fragments.push(`pen ${innings.extras.others}`)
            return fragments.length > 0 ? fragments.join(", ") : "-"
          }

          const fallOfWickets = innings.fallOfWickets.length
            ? innings.fallOfWickets
                .map((event) => `${event.wicket}-${event.score.split("/")[0]} (${event.player}, ${event.over})`)
                .join(", ")
            : "None"

          return (
            <Card key={innings.innings} className="glass">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      {innings.battingTeam.name} Innings
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Targeting {innings.bowlingTeam.name} • Total {innings.total.runs}/{innings.total.wickets} in {innings.total.overs} overs
                    </p>
                  </div>
                  <Badge variant={innings.total.wickets === 10 ? "destructive" : "secondary"}>
                    Run Rate {innings.total.runRate}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Batter</TableHead>
                        <TableHead>Dismissal</TableHead>
                        <TableHead className="text-right">R</TableHead>
                        <TableHead className="text-right">B</TableHead>
                        <TableHead className="text-right">4s</TableHead>
                        <TableHead className="text-right">6s</TableHead>
                        <TableHead className="text-right">SR</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {innings.batting.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground">
                            No batting data recorded.
                          </TableCell>
                        </TableRow>
                      )}
                      {innings.batting.map((batter) => (
                        <TableRow key={batter.playerId}>
                          <TableCell className={batter.isNotOut ? "font-semibold" : ""}>{batter.name}</TableCell>
                          <TableCell className="text-muted-foreground">{batter.dismissal}</TableCell>
                          <TableCell className="text-right">{batter.runs}</TableCell>
                          <TableCell className="text-right">{batter.balls}</TableCell>
                          <TableCell className="text-right">{batter.fours}</TableCell>
                          <TableCell className="text-right">{batter.sixes}</TableCell>
                          <TableCell className="text-right">{batter.strikeRate}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableCaption>
                      Extras {innings.extras.total} ({extrasToString()}) • Total {innings.total.runs}/{innings.total.wickets} ({innings.total.overs} ov) • Run Rate {innings.total.runRate}
                    </TableCaption>
                  </Table>
                  {innings.didNotBat.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Did not bat: {innings.didNotBat.join(", ")}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Fall of wickets: {fallOfWickets}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Bowling</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bowler</TableHead>
                        <TableHead className="text-right">O</TableHead>
                        <TableHead className="text-right">R</TableHead>
                        <TableHead className="text-right">W</TableHead>
                        <TableHead className="text-right">Econ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {innings.bowling.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No bowling data recorded.
                          </TableCell>
                        </TableRow>
                      )}
                      {innings.bowling.map((bowler) => (
                        <TableRow key={bowler.playerId}>
                          <TableCell>{bowler.name}</TableCell>
                          <TableCell className="text-right">{bowler.overs}</TableCell>
                          <TableCell className="text-right">{bowler.runs}</TableCell>
                          <TableCell className="text-right">{bowler.wickets}</TableCell>
                          <TableCell className="text-right">{bowler.economy}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
