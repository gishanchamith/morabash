import { notFound } from "next/navigation"

import { getAdminSupabase } from "@/lib/supabase/admin"
import { TeamForm } from "@/components/admin/team-form"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditTeamPage({ params }: PageProps) {
  const { id } = await params
  const { supabase } = await getAdminSupabase()
  const { data: team } = await supabase
    .from("teams")
    .select(
      `
      id,
      name,
      captain,
      players:players(id, name)
    `,
    )
    .eq("id", id)
    .maybeSingle()

  if (!team) {
    notFound()
  }

  const enrichedTeam = {
    id: team.id,
    name: team.name,
    captain: team.captain,
    players: Array.isArray((team as any).players)
      ? (team as any).players.map((player: any) => ({
          id: player.id as string,
          name: player.name as string | null,
        }))
      : [],
  }

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Update Team
          </h1>
          <p className="text-muted-foreground">
            Modify the team name or captain and save your changes.
          </p>
        </div>
        <TeamForm mode="edit" team={enrichedTeam} />
      </div>
    </div>
  )
}
