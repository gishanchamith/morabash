"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

async function updateMatchStatus(
  matchId: string,
  payload: { status: string; innings_complete?: boolean; innings?: number; winner_id?: string | null },
) {
  const response = await fetch(`/api/admin/matches/${matchId}/status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error || "Unable to update match status")
  }
}

type ScoreEntryActionsProps = {
  matchId: string
  status: string
  teams: Array<{ id: string; name: string }>
  currentWinnerId?: string | null
}

export function ScoreEntryActions({ matchId, status, teams, currentWinnerId }: ScoreEntryActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const NO_WINNER_VALUE = "__none__"
  const [selectedWinner, setSelectedWinner] = useState<string>(currentWinnerId ?? NO_WINNER_VALUE)

  useEffect(() => {
    setSelectedWinner(currentWinnerId ?? NO_WINNER_VALUE)
  }, [currentWinnerId])

  const teamOptions = useMemo(() => teams, [teams])

  const handleFinishInnings = () => {
    startTransition(async () => {
      try {
        await updateMatchStatus(matchId, { status: "ongoing", innings_complete: true, innings: 1 })
        toast({ title: "First innings marked complete" })
        router.refresh()
      } catch (error) {
        toast({ title: "Unable to finish innings", description: error instanceof Error ? error.message : "Try again" })
      }
    })
  }

  const handleFinishMatch = () => {
    startTransition(async () => {
      try {
        const winnerId = selectedWinner === NO_WINNER_VALUE ? null : selectedWinner
        await updateMatchStatus(matchId, { status: "completed", winner_id: winnerId })
        toast({ title: "Match completed", description: winnerId ? "Winner saved." : "No winner recorded." })
        router.refresh()
      } catch (error) {
        toast({ title: "Unable to finish match", description: error instanceof Error ? error.message : "Try again" })
      }
    })
  }

  return (
    <div className="flex flex-col md:flex-row md:items-end gap-3">
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold">Winner</span>
          <Select value={selectedWinner} onValueChange={setSelectedWinner}>
            <SelectTrigger className="glass bg-input/50 border-border/50">
              <SelectValue placeholder="Select winner" />
            </SelectTrigger>
            <SelectContent className="glass">
              <SelectItem value={NO_WINNER_VALUE}>No winner yet</SelectItem>
              {teamOptions.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold">Actions</span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={handleFinishInnings}
              disabled={isPending || status !== "ongoing"}
              className="flex-1"
            >
              Finish Innings
            </Button>
            <Button
              variant="destructive"
              onClick={handleFinishMatch}
              disabled={isPending}
              className="flex-1"
            >
              Finish Match
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
