import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

type AdminProfile = {
  role: string | null
}

export async function getAdminSupabase() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<AdminProfile>()

  if (profileError) {
    console.error("Failed to load admin profile", profileError)
  }

  if (!profile || profile.role !== "admin") {
    redirect("/auth/error?error=not-authorized")
  }

  return { supabase, user, profile }
}

export async function ensureAdminAccess() {
  await getAdminSupabase()
}
