import { getAdminSupabase } from "@/lib/supabase/admin"
import { TeamForm } from "@/components/admin/team-form"

export default async function NewTeamPage() {
  await getAdminSupabase()

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Register New Team
          </h1>
          <p className="text-muted-foreground">
            Fill out the form below to add a new team to the tournament roster.
          </p>
        </div>
        <TeamForm mode="create" />
      </div>
    </div>
  )
}
