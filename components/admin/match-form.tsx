"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CalendarClock, MapPin } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type MatchTeamOption = {
  id: string
  name: string
}

type MatchStatus = "upcoming" | "ongoing" | "completed" | "abandoned"
type MatchDecision = "bat" | "bowl"

type MatchFormValues = {
  id: string
  team1_id: string | null
  team2_id: string | null
  venue: string | null
  match_date: string | null
  status: MatchStatus
  toss_winner_id: string | null
  elected_to: MatchDecision | null
  overs_per_innings: number | null
}

type MatchFormProps = {
  mode: "create" | "edit"
  teams: MatchTeamOption[]
  match?: MatchFormValues
}

const STATUS_OPTIONS: MatchStatus[] = ["upcoming", "ongoing", "completed", "abandoned"]
const ELECTED_OPTIONS: Array<{ value: MatchDecision; label: string }> = [
  { value: "bat", label: "Bat" },
  { value: "bowl", label: "Bowl" },
]

const UNSELECTED_VALUE = "__not_selected__"

export function MatchForm({ mode, teams, match }: MatchFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [team1Id, setTeam1Id] = useState(match?.team1_id ?? "")
  const [team2Id, setTeam2Id] = useState(match?.team2_id ?? "")
  const [venue, setVenue] = useState(match?.venue ?? "")
  const [matchDate, setMatchDate] = useState(() => {
    if (!match?.match_date) return ""
    const date = new Date(match.match_date)
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000)
    return local.toISOString().slice(0, 16)
  })
  const [status, setStatus] = useState<MatchStatus>(match?.status ?? "upcoming")
  const [tossWinnerId, setTossWinnerId] = useState<string>(match?.toss_winner_id ?? UNSELECTED_VALUE)
  const [electedTo, setElectedTo] = useState<MatchDecision | typeof UNSELECTED_VALUE>(
    match?.elected_to ?? UNSELECTED_VALUE
  )
  const [oversPerInnings, setOversPerInnings] = useState<string>(
    match?.overs_per_innings ? String(match.overs_per_innings) : "20"
  )
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const heading = mode === "create" ? "Create Match" : "Edit Match"
  const description =
    mode === "create"
      ? "Schedule a new match and add it to the tournament fixtures."
      : "Update match details, including teams, venue, and timing."

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!team1Id || !team2Id) {
      setError("Both teams are required")
      return
    }

    if (team1Id === team2Id) {
      setError("Team 1 and Team 2 must be different")
      return
    }

    if (!matchDate) {
      setError("Match date and time are required")
      return
    }

    if (!venue.trim()) {
      setError("Venue is required")
      return
    }

    const parsedOvers = Number(oversPerInnings)
    if (!Number.isFinite(parsedOvers) || parsedOvers <= 0) {
      setError("Overs per innings must be a positive number")
      return
    }

    if (parsedOvers > 90) {
      setError("Overs per innings cannot exceed 90")
      return
    }

    setIsSubmitting(true)

    try {
      const payload: Record<string, any> = {
        team1_id: team1Id,
        team2_id: team2Id,
        venue: venue.trim(),
        match_date: new Date(matchDate).toISOString(),
        status,
        overs_per_innings: Math.round(parsedOvers),
      }

      const normalizedTossWinner = tossWinnerId === UNSELECTED_VALUE ? null : tossWinnerId
      const normalizedElectedTo = electedTo === UNSELECTED_VALUE ? null : electedTo

      payload.toss_winner_id = normalizedTossWinner
      payload.elected_to = normalizedElectedTo

      let supabaseError: { message: string } | null = null

      if (mode === "create") {
        const { error: insertError } = await supabase.from("matches").insert(payload)
        supabaseError = insertError
      } else if (match) {
        const { error: updateError } = await supabase.from("matches").update(payload).eq("id", match.id)
        supabaseError = updateError
      }

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      router.push("/admin/matches")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save match")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-primary" />
          {heading}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Team 1</Label>
              <Select value={team1Id} onValueChange={setTeam1Id}>
                <SelectTrigger className="glass bg-input/50 border-border/50">
                  <SelectValue placeholder="Select Team 1" />
                </SelectTrigger>
                <SelectContent className="glass">
                  <SelectGroup>
                    <SelectLabel>Teams</SelectLabel>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Team 2</Label>
              <Select value={team2Id} onValueChange={setTeam2Id}>
                <SelectTrigger className="glass bg-input/50 border-border/50">
                  <SelectValue placeholder="Select Team 2" />
                </SelectTrigger>
                <SelectContent className="glass">
                  <SelectGroup>
                    <SelectLabel>Teams</SelectLabel>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Match Date & Time</Label>
            <Input
              type="datetime-local"
              value={matchDate}
              onChange={(event) => setMatchDate(event.target.value)}
              className="glass bg-input/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Venue</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={venue}
                onChange={(event) => setVenue(event.target.value)}
                placeholder="Enter match venue"
                className="pl-10 glass bg-input/50 border-border/50 focus:border-secondary/50 focus:ring-secondary/20"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Overs per Innings</Label>
            <Input
              type="number"
              min={1}
              max={90}
              value={oversPerInnings}
              onChange={(event) => setOversPerInnings(event.target.value)}
              placeholder="e.g. 20"
              className="glass bg-input/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
              required
            />
            <p className="text-xs text-muted-foreground">
              Configure match length. Limited overs formats typically use 20 or 50 overs per innings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as MatchStatus)}>
                <SelectTrigger className="glass bg-input/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass">
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Toss Winner (optional)</Label>
              <Select value={tossWinnerId} onValueChange={setTossWinnerId}>
                <SelectTrigger className="glass bg-input/50 border-border/50">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent className="glass">
                  <SelectGroup>
                    <SelectLabel>Teams</SelectLabel>
                    <SelectItem value={UNSELECTED_VALUE}>Not decided</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Elected To (optional)</Label>
              <Select
                value={electedTo}
                onValueChange={(value) => setElectedTo(value as MatchDecision | typeof UNSELECTED_VALUE)}
              >
                <SelectTrigger className="glass bg-input/50 border-border/50">
                  <SelectValue placeholder="Choose option" />
                </SelectTrigger>
                <SelectContent className="glass">
                  <SelectGroup>
                    <SelectLabel>Decision</SelectLabel>
                    <SelectItem value={UNSELECTED_VALUE}>Not decided</SelectItem>
                    {ELECTED_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div className="p-3 glass rounded-lg border border-destructive/40 bg-destructive/10">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="submit" className="sm:flex-1 neon-glow" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : mode === "create" ? "Create Match" : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="sm:flex-1 glass bg-transparent"
              asChild
              disabled={isSubmitting}
            >
              <Link href="/admin/matches">Cancel</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
