"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Flag, Play, Trophy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

export type StartMatchDetails = {
  id: string
  venue: string | null
  match_date: string | null
  team1: { id: string; name: string }
  team2: { id: string; name: string }
  overs_per_innings: number | null
  toss_winner_id: string | null
  elected_to: "bat" | "bowl" | null
}

type StartMatchClientProps = {
  match: StartMatchDetails
}

export function StartMatchClient({ match }: StartMatchClientProps) {
  const router = useRouter()

  const [tossWinner, setTossWinner] = useState<string>(match.toss_winner_id ?? "")
  const [decision, setDecision] = useState<string>(match.elected_to ?? "")
  const [overs, setOvers] = useState<string>(
    match.overs_per_innings ? String(match.overs_per_innings) : "20"
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const parsedOvers = Number(overs)
    if (!Number.isFinite(parsedOvers) || parsedOvers <= 0) {
      setError("Overs per innings must be a positive number")
      return
    }

    if (parsedOvers > 90) {
      setError("Overs per innings cannot exceed 90")
      return
    }

    if (!tossWinner) {
      setError("Select the toss winner")
      return
    }

    if (!decision) {
      setError("Select the toss decision")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/matches/${match.id}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toss_winner_id: tossWinner,
          elected_to: decision,
          overs_per_innings: Math.round(parsedOvers),
        }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error || "Unable to start match")
      }

      toast({ title: "Match started", description: "Score entry is now unlocked." })
      router.push(`/admin/score-entry/${match.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start match")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" className="glass bg-transparent" asChild>
          <Link href="/admin/matches">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to matches
          </Link>
        </Button>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Venue: {match.venue || "TBD"}</p>
          {match.match_date && (
            <p className="text-sm text-muted-foreground">
              {new Date(match.match_date).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Play className="h-5 w-5 text-primary" />
            Start Match
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Confirm toss details and format before moving this fixture to live scoring.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <h2 className="text-lg font-semibold mb-2">Match</h2>
              <p className="text-muted-foreground">
                {match.team1.name} vs {match.team2.name}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Toss Winner</Label>
                <Select value={tossWinner} onValueChange={setTossWinner}>
                  <SelectTrigger className="glass bg-input/50 border-border/50">
                    <SelectValue placeholder="Select toss winner" />
                  </SelectTrigger>
                  <SelectContent className="glass">
                    <SelectGroup>
                      <SelectLabel>Teams</SelectLabel>
                      <SelectItem value={match.team1.id}>{match.team1.name}</SelectItem>
                      <SelectItem value={match.team2.id}>{match.team2.name}</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Toss Decision</Label>
                <Select value={decision} onValueChange={setDecision}>
                  <SelectTrigger className="glass bg-input/50 border-border/50">
                    <SelectValue placeholder="Choose decision" />
                  </SelectTrigger>
                  <SelectContent className="glass">
                    <SelectGroup>
                      <SelectLabel>Decision</SelectLabel>
                      <SelectItem value="bat">Bat first</SelectItem>
                      <SelectItem value="bowl">Bowl first</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Overs per Innings</Label>
              <Input
                type="number"
                min={1}
                max={90}
                value={overs}
                onChange={(event) => setOvers(event.target.value)}
                className="glass bg-input/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                required
              />
              <p className="text-xs text-muted-foreground">
                This covers each innings. Typical formats use 20 or 50 overs.
              </p>
            </div>

            {error && (
              <div className="p-3 glass rounded-md border border-destructive/40 bg-destructive/10 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="submit" className="sm:flex-1 neon-glow" disabled={isSubmitting}>
                {isSubmitting ? "Starting..." : "Start Match"}
              </Button>
              <Button type="button" variant="outline" className="sm:flex-1 glass bg-transparent" asChild disabled={isSubmitting}>
                <Link href={`/admin/matches/${match.id}`}>
                  <Trophy className="mr-2 h-4 w-4" /> View Match Details
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flag className="h-4 w-4 text-secondary" /> What happens next?
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>The match status changes to LIVE and appears in the score entry dashboard.</p>
          <p>Initial scoreboard rows are created so you can jump straight into ball-by-ball updates.</p>
          <p>Overs per innings can still be edited later from the match form if needed.</p>
        </CardContent>
      </Card>
    </div>
  )
}
