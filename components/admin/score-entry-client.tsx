"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { AlertTriangle, ArrowLeft, Edit, Shield, Target, Trash2, Trophy, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { useRealtimeBalls, useRealtimeScoreboard } from "@/lib/realtime"
import { aggregateScoreboard, normaliseScoreboardRow } from "@/lib/score-utils"
import { ScoreEntryActions } from "@/components/admin/score-entry-actions"

const EXTRA_TYPES = [
  { value: "wide", label: "Wide" },
  { value: "no-ball", label: "No Ball" },
  { value: "bye", label: "Bye" },
  { value: "leg-bye", label: "Leg Bye" },
] as const

const WICKET_TYPES = [
  { value: "bowled", label: "Bowled" },
  { value: "caught", label: "Caught" },
  { value: "lbw", label: "LBW" },
  { value: "run-out", label: "Run Out" },
  { value: "stumped", label: "Stumped" },
  { value: "hit-wicket", label: "Hit Wicket" },
] as const

const NO_SELECTION = "__none__"

type MatchTeam = {
  id: string
  name: string
}

type MatchPlayer = {
  id: string
  name: string
  team_id: string
  role: string | null
}

type ScoreboardRow = {
  id: string
  match_id: string
  team_id: string
  innings: number
  runs: number | string | null
  wickets: number | string | null
  overs: number | string | null
  current_rr: number | string | null
  required_rr: number | string | null
}

type ScoreEntryClientProps = {
  match: {
    id: string
    venue: string | null
    status: string
    winner_id?: string | null
    match_date: string | null
    overs_per_innings: number | null
    team1: MatchTeam
    team2: MatchTeam
  }
  players: MatchPlayer[]
  initialScoreboard: ScoreboardRow[]
}

function parseMetric(value: number | string | null | undefined, precision = 1) {
  if (value === null || value === undefined) return 0
  const parsed = typeof value === "number" ? value : Number(value)
  if (Number.isNaN(parsed)) return 0
  return precision ? Number(parsed.toFixed(precision)) : parsed
}

export function ScoreEntryClient({ match, players, initialScoreboard }: ScoreEntryClientProps) {
  const [innings, setInnings] = useState<1 | 2>(1)
  const [strikerId, setStrikerId] = useState("")
  const [nonStrikerId, setNonStrikerId] = useState("")
  const [bowlerId, setBowlerId] = useState("")
  const [runs, setRuns] = useState("0")
  const [extras, setExtras] = useState("0")
  const [extraType, setExtraType] = useState<string>(NO_SELECTION)
  const [wicketType, setWicketType] = useState<string>(NO_SELECTION)
  const [wicketPlayerId, setWicketPlayerId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [editingBall, setEditingBall] = useState<any | null>(null)
  const [deletingBallId, setDeletingBallId] = useState<string | null>(null)

  const { balls } = useRealtimeBalls(match.id)
  const { scoreboard: liveScoreboard, loading: scoreboardLoading } = useRealtimeScoreboard(match.id)

  const rawOversValue = Number(match.overs_per_innings ?? 20)
  const oversPerInnings = Number.isFinite(rawOversValue) && rawOversValue > 0 ? rawOversValue : 20
  const ballsPerInnings = oversPerInnings * 6

  useEffect(() => {
    if (editingBall) {
      return
    }

    setBowlerId("")
    setExtras("0")
    setExtraType(NO_SELECTION)
    setWicketType(NO_SELECTION)
    setWicketPlayerId("")
  }, [innings, editingBall])

  const scoreboardRows = (!scoreboardLoading && liveScoreboard.length > 0 ? liveScoreboard : initialScoreboard) ?? []

  const inningsBalls = useMemo(() => {
    return balls
      .filter((ball) => ball.innings === innings)
      .slice()
      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }, [balls, innings])

  const lastBall = inningsBalls[inningsBalls.length - 1]
  const strikerFromBalls = lastBall?.batsman_id ?? null
  const nonStrikerFromBalls = useMemo(() => {
    if (!strikerFromBalls) {
      const fallback = inningsBalls
        .slice()
        .reverse()
        .find((ball) => ball.batsman_id)
      return fallback?.batsman_id ?? null
    }

    const previous = inningsBalls
      .slice()
      .reverse()
      .find((ball) => ball.batsman_id && ball.batsman_id !== strikerFromBalls)

    return previous?.batsman_id ?? null
  }, [inningsBalls, strikerFromBalls])

  const aggregatedScoreboard = useMemo(
    () => aggregateScoreboard(balls, { ballsPerInnings }),
    [balls, ballsPerInnings],
  )

  const isFreeHitDelivery = lastBall?.extra_type === "no-ball"
  const currentBallIsFreeHit = editingBall ? !!editingBall.is_free_hit : isFreeHitDelivery

  const currentOverNumber = lastBall?.over_number ?? 1

  const currentOverSlots = useMemo(() => {
    const slots = Array.from({ length: 6 }, () => [] as any[])

    inningsBalls
      .filter((ball) => ball.over_number === currentOverNumber)
      .forEach((ball) => {
        const rawIndex = Number(ball.ball_number)
        const index = Number.isFinite(rawIndex) && rawIndex > 0 ? rawIndex - 1 : 0
        if (index >= 0 && index < slots.length) {
          slots[index] = [...slots[index], ball]
        }
      })

    return slots
  }, [inningsBalls, currentOverNumber])

  const fallbackTeam1 = useMemo(
    () => normaliseScoreboardRow(scoreboardRows.find((row) => row.team_id === match.team1.id)),
    [scoreboardRows, match.team1.id],
  )

  const fallbackTeam2 = useMemo(
    () => normaliseScoreboardRow(scoreboardRows.find((row) => row.team_id === match.team2.id)),
    [scoreboardRows, match.team2.id],
  )

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

  const battingTeam = innings === 1 ? match.team1 : match.team2
  const bowlingTeam = innings === 1 ? match.team2 : match.team1

  const battingOptions = players.filter((player) => player.team_id === battingTeam.id)
  const bowlingOptions = players.filter((player) => player.team_id === bowlingTeam.id)

  const wicketOptions = battingOptions

  useEffect(() => {
    if (!battingOptions.length) {
      setStrikerId("")
      setNonStrikerId("")
      return
    }

    if (!strikerId || !battingOptions.some((player) => player.id === strikerId)) {
      if (strikerFromBalls && battingOptions.some((player) => player.id === strikerFromBalls)) {
        setStrikerId(strikerFromBalls)
      } else {
        setStrikerId(battingOptions[0].id)
      }
    }

    if (
      !nonStrikerId ||
      nonStrikerId === strikerId ||
      !battingOptions.some((player) => player.id === nonStrikerId)
    ) {
      if (nonStrikerFromBalls && nonStrikerFromBalls !== strikerId) {
        const candidate = battingOptions.find((player) => player.id === nonStrikerFromBalls)
        if (candidate) {
          setNonStrikerId(candidate.id)
          return
        }
      }

      const fallback = battingOptions.find((player) => player.id !== strikerId)
      setNonStrikerId(fallback ? fallback.id : "")
    }
  }, [battingOptions, strikerFromBalls, nonStrikerFromBalls, strikerId, nonStrikerId])

  useEffect(() => {
    if (strikerId) {
      // Ensure non-striker never duplicates striker once striker changes manually
      if (nonStrikerId === strikerId) {
        const alternative = battingOptions.find((player) => player.id !== strikerId)
        if (alternative) {
          setNonStrikerId(alternative.id)
        }
      }
    }
  }, [strikerId, nonStrikerId, battingOptions])

  const resetForm = () => {
    setEditingBall(null)
    setFormError(null)
    setStrikerId("")
    setNonStrikerId("")
    setBowlerId("")
    setRuns("0")
    setExtras("0")
    setExtraType(NO_SELECTION)
    setWicketType(NO_SELECTION)
    setWicketPlayerId("")
  }

  const beginEditing = (
    ball: any | null,
    presetOver?: { over_number: number; ball_number: number },
  ) => {
    if (deletingBallId) return

    if (!ball) {
      setEditingBall({
        id: null,
        innings,
        over_number: presetOver?.over_number ?? currentOverNumber,
        ball_number: presetOver?.ball_number ?? 1,
        is_free_hit: false,
      })
      setFormError(null)
      setRuns("0")
      setExtras("0")
      setExtraType(NO_SELECTION)
      setWicketType(NO_SELECTION)
      setWicketPlayerId("")
      setBowlerId(bowlerId)
      setStrikerId(strikerId)
      return
    }

    setEditingBall(ball)
    setFormError(null)
    setInnings(ball.innings === 2 ? 2 : 1)
    setStrikerId(ball.batsman_id ?? "")
    setBowlerId(ball.bowler_id ?? "")
    setRuns(String(ball.runs ?? 0))
    setExtras(String(ball.extras ?? 0))
    setExtraType(ball.extra_type ?? NO_SELECTION)
    setWicketType(ball.wicket_type ?? NO_SELECTION)
    setWicketPlayerId(ball.wicket_player_id ?? "")
  }

  const handleDelete = async (ball: any) => {
    if (deletingBallId) return
    const confirmed = typeof window !== "undefined" ? window.confirm("Delete this delivery?") : true
    if (!confirmed) return

    setDeletingBallId(ball.id)
    setFormError(null)

    try {
      const response = await fetch(`/api/admin/matches/${match.id}/balls/${ball.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error || "Unable to delete delivery")
      }

      toast({ title: "Delivery removed", description: "The scoreboard has been refreshed." })

      if (editingBall?.id === ball.id) {
        resetForm()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete delivery"
      setFormError(message)
      toast({ title: "Delete failed", description: message })
    } finally {
      setDeletingBallId(null)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    if (!strikerId) {
      setFormError("Select the striker")
      return
    }

    if (!bowlerId) {
      setFormError("Select a bowler")
      return
    }

    const runsValue = Number(runs)
    const extrasValue = Number(extras)

    if (Number.isNaN(runsValue) || runsValue < 0) {
      setFormError("Runs must be zero or a positive number")
      return
    }

    if (Number.isNaN(extrasValue) || extrasValue < 0) {
      setFormError("Extras must be zero or a positive number")
      return
    }

    if (extrasValue > 0 && extraType === NO_SELECTION) {
      setFormError("Select the extra type")
      return
    }

    if (extrasValue === 0 && extraType !== NO_SELECTION) {
      setFormError("Extras should be greater than zero for the selected extra type")
      return
    }

    if (wicketType !== NO_SELECTION && !wicketPlayerId) {
      setFormError("Select the player dismissed for the wicket")
      return
    }

    setIsSubmitting(true)

    const isEditingExisting = Boolean(editingBall && editingBall.id)

    try {
      const endpoint = isEditingExisting
        ? `/api/admin/matches/${match.id}/balls/${editingBall.id}`
        : `/api/admin/matches/${match.id}/balls`
      const method = isEditingExisting ? "PUT" : "POST"

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          innings,
          batsman_id: strikerId,
          bowler_id: bowlerId,
          runs: runsValue,
          extras: extrasValue,
          extra_type: extraType === NO_SELECTION ? null : extraType,
          wicket_type: wicketType === NO_SELECTION ? null : wicketType,
          wicket_player_id: wicketType === NO_SELECTION ? null : wicketPlayerId || null,
          is_free_hit: isEditingExisting ? !!editingBall?.is_free_hit : isFreeHitDelivery,
        }),
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        throw new Error(errorBody?.error || "Unable to record ball")
      }

      toast({
        title: isEditingExisting ? "Delivery updated" : "Ball recorded",
        description: isEditingExisting
          ? "Saved changes to the selected delivery."
          : "Scoreboard updated successfully.",
      })

      if (isEditingExisting || (editingBall && editingBall.id === null)) {
        resetForm()
      } else {
        setRuns("0")
        setExtras("0")
        setExtraType(NO_SELECTION)
        setWicketType(NO_SELECTION)
        setWicketPlayerId("")

        if (wicketType !== NO_SELECTION) {
          setStrikerId("")
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message)
      } else {
        setFormError("Unable to record ball")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatOvers = (value: number | string | null) => {
    const numeric = parseMetric(value)
    return numeric.toFixed(1)
  }

  const formatRunRate = (value: number | string | null) => {
    const numeric = parseMetric(value, 2)
    return numeric.toFixed(2)
  }

  const formatBallSummary = (ball: any) => {
    const components: string[] = []
    if (ball.is_free_hit) {
      components.push("Free Hit")
    }
    components.push(`${ball.runs} run${ball.runs === 1 ? "" : "s"}`)
    if (ball.extras && ball.extras > 0) {
      components.push(`${ball.extras} ${ball.extra_type?.replace("-", " ")}`)
    }
    if (ball.wicket_type) {
      components.push(`Wicket (${ball.wicket_type.replace("-", " ")})`)
    }
    return components.join(" | ")
  }

  const formatOverSlot = (ball: any | null) => {
    if (!ball) return ""
    if (ball.wicket_type) {
      return "W"
    }

    if (ball.extra_type === "no-ball") {
      const runsPortion = ball.runs ? `+${ball.runs}` : ""
      return `NB${runsPortion}`
    }

    if (ball.extra_type === "wide") {
      const extraRuns = ball.extras && ball.extras > 1 ? ball.extras : ""
      return `WD${extraRuns}`
    }

    if (ball.extra_type === "bye") {
      return `B${ball.extras}`
    }

    if (ball.extra_type === "leg-bye") {
      return `LB${ball.extras}`
    }

    if (ball.runs === 0) return "•"
    if (ball.runs === 4) return "4"
    if (ball.runs === 6) return "6"
    return String(ball.runs)
  }

  const matchDate = match.match_date ? format(new Date(match.match_date), "dd MMM yyyy, HH:mm") : null

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Score Entry
          </h1>
          <p className="text-muted-foreground mt-1">
            {match.team1.name} vs {match.team2.name} @ {match.venue || "TBD"}
          </p>
          {matchDate && <p className="text-sm text-muted-foreground">{matchDate}</p>}
        </div>
        <div className="flex gap-3 items-center">
          <Button variant="outline" className="glass bg-transparent" asChild>
            <Link href="/admin/score-entry">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to matches
            </Link>
          </Button>
          <Badge variant={match.status === "ongoing" ? "default" : match.status === "completed" ? "secondary" : "outline"}>
            {match.status.toUpperCase()}
          </Badge>
        </div>
      </div>

      <ScoreEntryActions
        matchId={match.id}
        status={match.status}
        teams={[match.team1, match.team2]}
        currentWinnerId={match.winner_id ?? null}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass glass-hover border-primary/40 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" /> Scoreboard
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Limited to {oversPerInnings} overs per innings ({ballsPerInnings} legal deliveries).
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 glass rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" /> {match.team1.name}
                  </h3>
                  <span className="text-sm text-muted-foreground">Innings 1</span>
                </div>
                <div className="text-3xl font-bold text-primary">
                  {parseMetric(team1Score.runs, 0)}/{parseMetric(team1Score.wickets, 0)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Overs: {formatOvers(team1Score.overs)} • RR: {formatRunRate(team1Score.runRate)}
                </p>
              </div>
              <div className="p-4 glass rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Shield className="h-4 w-4 text-secondary" /> {match.team2.name}
                  </h3>
                  <span className="text-sm text-muted-foreground">Innings 2</span>
                </div>
                <div className="text-3xl font-bold text-secondary">
                  {parseMetric(team2Score.runs, 0)}/{parseMetric(team2Score.wickets, 0)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Overs: {formatOvers(team2Score.overs)} • RR: {formatRunRate(team2Score.runRate)}
                </p>
                {team2Score.requiredRunRate !== null && (
                  <p className="text-xs text-secondary mt-2">
                    Req RR: {formatRunRate(team2Score.requiredRunRate)}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-secondary" /> Current Over (Innings {innings})
              </h3>
              <div className="grid grid-cols-6 gap-2">
                {currentOverSlots.map((slot, index) => {
                  const latestDelivery = slot[slot.length - 1]
                  const isTargetSlot =
                    editingBall &&
                    editingBall.id === null &&
                    editingBall.over_number === currentOverNumber &&
                    editingBall.ball_number === index + 1

                  return (
                    <div
                      key={index}
                      className={`glass rounded-md text-center py-2 text-sm font-semibold ${
                        slot.length > 0 || isTargetSlot
                          ? "border border-primary/30"
                          : "border border-dashed border-border/40 text-muted-foreground"
                      }`}
                    >
                      {slot.length > 0 ? (
                        <div className="flex flex-col gap-2 items-stretch">
                          {slot.map((delivery) => {
                            const busy =
                              deletingBallId === delivery.id ||
                              (editingBall?.id === delivery.id && isSubmitting)

                            return (
                              <div
                                key={delivery.id ?? `new-${index}`}
                                className={`glass rounded-md px-2 py-2 text-sm transition-colors ${
                                  editingBall?.id === delivery.id
                                    ? "border border-secondary text-secondary"
                                    : "border border-transparent"
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => beginEditing(delivery)}
                                  disabled={busy}
                                  className="w-full text-center font-semibold"
                                >
                                  {formatOverSlot(delivery)}
                                </button>
                                <div className="flex justify-center gap-1 mt-1">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => beginEditing(delivery)}
                                    disabled={busy}
                                    className="px-2"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(delivery)}
                                    disabled={busy}
                                    className="px-2 text-destructive border-destructive/40"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                                {delivery.is_free_hit && (
                                  <div className="text-[10px] text-secondary mt-1">Free Hit</div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => beginEditing(null, { over_number: currentOverNumber, ball_number: index + 1 })}
                            disabled={isSubmitting || deletingBallId !== null}
                            className={isTargetSlot ? "border-secondary text-secondary" : ""}
                          >
                            Add Ball
                          </Button>
                          <span className="text-xs text-muted-foreground">Empty slot</span>
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        {currentOverNumber}.{index + 1}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" /> Latest Deliveries
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {balls.length === 0 && (
                  <Card className="glass">
                    <CardContent className="p-6 text-center text-muted-foreground">
                      No deliveries recorded yet.
                    </CardContent>
                  </Card>
                )}
                {balls.map((ball) => (
                  <Card
                    key={ball.id}
                    className={`glass ${editingBall?.id === ball.id ? "border border-secondary" : ""}`}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>
                          Over {ball.over_number}.{ball.ball_number}
                        </span>
                        <span>Innings {ball.innings}</span>
                      </div>
                      <div className="text-base font-semibold">
                        {ball.batsman?.name || "Batsman"} vs {ball.bowler?.name || "Bowler"}
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm items-center">
                        {ball.is_free_hit && (
                          <Badge variant="outline" className="border-secondary text-secondary">
                            Free Hit
                          </Badge>
                        )}
                        <span>{formatBallSummary(ball)}</span>
                      </div>
                      {ball.wicket_type && (
                        <div className="text-xs text-destructive">
                          Wicket: {ball.wicket_type.replace("-", " ")}
                          {ball.wicket_player?.name ? ` - ${ball.wicket_player.name}` : ""}
                        </div>
                      )}
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => beginEditing(ball)}
                          disabled={deletingBallId === ball.id || (isSubmitting && editingBall?.id === ball.id)}
                        >
                          <Edit className="h-3 w-3 mr-1" /> Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(ball)}
                          disabled={deletingBallId === ball.id}
                          className="text-destructive border-destructive/40"
                        >
                          <Trash2 className="h-3 w-3 mr-1" /> Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> {editingBall ? "Edit Delivery" : "Record Delivery"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold">Current Batsmen</Label>
                  {currentBallIsFreeHit && (
                    <Badge className="bg-secondary/10 text-secondary border-secondary/30">Free Hit</Badge>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Striker</Label>
                    <Select value={strikerId} onValueChange={(value) => setStrikerId(value)}>
                      <SelectTrigger className="glass bg-input/50 border-border/50">
                        <SelectValue placeholder="Select striker" />
                      </SelectTrigger>
                      <SelectContent className="glass">
                        <SelectGroup>
                          <SelectLabel>{battingTeam.name}</SelectLabel>
                          {battingOptions.map((player) => (
                            <SelectItem key={player.id} value={player.id}>
                              {player.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Non-striker</Label>
                    <Select value={nonStrikerId} onValueChange={(value) => setNonStrikerId(value)}>
                      <SelectTrigger className="glass bg-input/50 border-border/50">
                        <SelectValue placeholder="Select non-striker" />
                      </SelectTrigger>
                      <SelectContent className="glass">
                        <SelectGroup>
                          <SelectLabel>{battingTeam.name}</SelectLabel>
                          {battingOptions
                            .filter((player) => player.id !== strikerId)
                            .map((player) => (
                              <SelectItem key={player.id} value={player.id}>
                                {player.name}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="sm:flex-1 glass bg-transparent"
                    onClick={() => {
                      if (!strikerId && nonStrikerId) {
                        setStrikerId(nonStrikerId)
                        setNonStrikerId("")
                        return
                      }

                      if (!nonStrikerId) return
                      setStrikerId(nonStrikerId)
                      setNonStrikerId(strikerId)
                    }}
                  >
                    Swap Strike
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="sm:flex-1"
                    onClick={() => setStrikerId("")}
                  >
                    New Striker
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Innings</Label>
                  <Select value={innings.toString()} onValueChange={(value) => setInnings(value === "1" ? 1 : 2)}>
                    <SelectTrigger className="glass bg-input/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass">
                      <SelectGroup>
                        <SelectLabel>Select Innings</SelectLabel>
                        <SelectItem value="1">Innings 1 - {match.team1.name}</SelectItem>
                        <SelectItem value="2">Innings 2 - {match.team2.name}</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Bowler</Label>
                  <Select value={bowlerId} onValueChange={setBowlerId}>
                    <SelectTrigger className="glass bg-input/50 border-border/50">
                      <SelectValue placeholder="Select bowler" />
                    </SelectTrigger>
                    <SelectContent className="glass">
                      <SelectGroup>
                        <SelectLabel>{bowlingTeam.name}</SelectLabel>
                        {bowlingOptions.map((player) => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Runs</Label>
                  <Input
                    value={runs}
                    onChange={(event) => setRuns(event.target.value)}
                    type="number"
                    min={0}
                    max={6}
                    className="glass bg-input/50 border-border/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Extras</Label>
                  <Input
                    value={extras}
                    onChange={(event) => setExtras(event.target.value)}
                    type="number"
                    min={0}
                    max={6}
                    className="glass bg-input/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Extra Type</Label>
                  <Select value={extraType} onValueChange={setExtraType}>
                    <SelectTrigger className="glass bg-input/50 border-border/50">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent className="glass">
                      <SelectGroup>
                        <SelectLabel>Extras</SelectLabel>
                        <SelectItem value={NO_SELECTION}>None</SelectItem>
                        {EXTRA_TYPES.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Wicket</Label>
                <Select value={wicketType} onValueChange={setWicketType}>
                  <SelectTrigger className="glass bg-input/50 border-border/50">
                    <SelectValue placeholder="No wicket" />
                  </SelectTrigger>
                  <SelectContent className="glass">
                    <SelectGroup>
                      <SelectLabel>Dismissal Type</SelectLabel>
                      <SelectItem value={NO_SELECTION}>No wicket</SelectItem>
                      {WICKET_TYPES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {wicketType !== NO_SELECTION && (
                <div className="space-y-2">
                  <Label>Dismissed Player</Label>
                  <Select value={wicketPlayerId} onValueChange={setWicketPlayerId}>
                    <SelectTrigger className="glass bg-input/50 border-border/50">
                      <SelectValue placeholder="Select player" />
                    </SelectTrigger>
                    <SelectContent className="glass">
                      <SelectGroup>
                        <SelectLabel>{battingTeam.name}</SelectLabel>
                        {wicketOptions.map((player) => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formError && (
                <div className="p-3 glass rounded-lg border border-destructive/40 bg-destructive/10 text-sm text-destructive flex gap-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button type="submit" className="sm:flex-1 neon-glow" disabled={isSubmitting}>
                  {isSubmitting
                    ? editingBall
                      ? "Saving..."
                      : "Recording..."
                    : editingBall
                      ? "Save Changes"
                      : "Record Ball"}
                </Button>
                {editingBall && (
                  <Button
                    type="button"
                    variant="outline"
                    className="sm:flex-1 glass bg-transparent"
                    onClick={resetForm}
                    disabled={isSubmitting}
                  >
                    Cancel Edit
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
