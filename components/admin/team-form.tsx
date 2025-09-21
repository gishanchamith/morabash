"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users } from "lucide-react"

type TeamFormProps = {
  team?: {
    id: string
    name: string | null
    captain: string | null
  }
  mode: "create" | "edit"
}

export function TeamForm({ team, mode }: TeamFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState(team?.name ?? "")
  const [captain, setCaptain] = useState(team?.captain ?? "")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const heading = mode === "create" ? "Create Team" : "Edit Team"
  const description =
    mode === "create"
      ? "Register a new team with its captain details."
      : "Update the team name or captain information."

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError("Team name is required")
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        name: name.trim(),
        captain: captain.trim() ? captain.trim() : null,
      }

      if (mode === "create") {
        const { error: insertError } = await supabase.from("teams").insert(payload)
        if (insertError) throw insertError
      } else if (team) {
        const { error: updateError } = await supabase.from("teams").update(payload).eq("id", team.id)
        if (updateError) throw updateError
      }

      router.push("/admin/teams")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save team")
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
