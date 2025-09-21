"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Trash2, Users } from "lucide-react"

type TeamFormProps = {
  team?: {
    id: string
    name: string | null
    captain: string | null
    players?: Array<{ id: string; name: string | null }>
  }
  mode: "create" | "edit"
}

type PlayerInput = {
  id?: string
  name: string
}

const MAX_PLAYERS = 20

export function TeamForm({ team, mode }: TeamFormProps) {
  const router = useRouter()
  const [name, setName] = useState(team?.name ?? "")
  const [captain, setCaptain] = useState(team?.captain ?? "")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [players, setPlayers] = useState<PlayerInput[]>(() => {
    if (team?.players && team.players.length > 0) {
      return team.players.map((player) => ({ id: player.id, name: player.name ?? "" }))
    }

    return Array.from({ length: Math.min(11, MAX_PLAYERS) }, () => ({ name: "" }))
  })

  const filledPlayerCount = useMemo(
    () => players.filter((player) => player.name.trim().length > 0).length,
    [players],
  )

  const heading = mode === "create" ? "Create Team" : "Edit Team"
  const description =
    mode === "create"
      ? "Register a new team with its captain details."
      : "Update the team name or captain information."

  const updatePlayerName = (index: number, value: string) => {
    setPlayers((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], name: value }
      return next
    })
  }

  const addPlayerField = () => {
    setPlayers((prev) => {
      if (prev.length >= MAX_PLAYERS) return prev
      return [...prev, { name: "" }]
    })
  }

  const removePlayerField = (index: number) => {
    setPlayers((prev) => {
      if (prev.length === 1) {
        return [{ ...prev[0], name: "" }]
      }
      const next = [...prev]
      next.splice(index, 1)
      return next.length > 0 ? next : [{ name: "" }]
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError("Team name is required")
      return
    }

    const trimmedPlayers = players
      .map((player) => ({
        id: player.id,
        name: player.name.trim(),
      }))
      .filter((player) => player.name.length > 0)

    if (trimmedPlayers.length > MAX_PLAYERS) {
      setError(`Teams can have up to ${MAX_PLAYERS} players`)
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        name: name.trim(),
        captain: captain.trim() ? captain.trim() : null,
        players: trimmedPlayers,
      }

      const endpoint = mode === "create" ? "/api/admin/teams" : `/api/admin/teams/${team?.id}`
      const method = mode === "create" ? "POST" : "PUT"

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        if (result?.code === "23505") {
          setError("A team with this name already exists. Please choose a different name.")
          return
        }

        throw new Error(result?.error || "Unable to save team")
      }

      router.push("/admin/teams")
      router.refresh()
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else if (err && typeof err === "object" && "message" in err && typeof err.message === "string") {
        setError(err.message)
      } else {
        setError("Unable to save team")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          {heading}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="team-name">Team Name</Label>
            <Input
              id="team-name"
              name="name"
              placeholder="Enter team name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="glass bg-input/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-captain">Captain</Label>
            <Input
              id="team-captain"
              name="captain"
              placeholder="Enter captain name"
              value={captain}
              onChange={(event) => setCaptain(event.target.value)}
              className="glass bg-input/50 border-border/50 focus:border-secondary/50 focus:ring-secondary/20"
            />
            <p className="text-xs text-muted-foreground">Leave blank if the captain is not decided yet.</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Players</Label>
              <span className="text-xs text-muted-foreground">
                {filledPlayerCount}/{MAX_PLAYERS} players added
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Add up to {MAX_PLAYERS} players. You can update this list at any time.
            </p>

            <div className="space-y-3">
              {players.map((player, index) => (
                <div key={player.id ?? index} className="flex items-center gap-2">
                  <Input
                    value={player.name}
                    onChange={(event) => updatePlayerName(index, event.target.value)}
                    placeholder={`Player ${index + 1} name`}
                    className="glass bg-input/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={() => removePlayerField(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={addPlayerField}
              disabled={players.length >= MAX_PLAYERS}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Player
            </Button>
          </div>

          {error && (
            <div className="p-3 glass rounded-lg border border-destructive/40 bg-destructive/10">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="submit" className="sm:flex-1 neon-glow" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : mode === "create" ? "Create Team" : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="sm:flex-1 glass bg-transparent"
              asChild
              disabled={isSubmitting}
            >
              <Link href="/admin/teams">Cancel</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
