import { notFound } from "next/navigation"

import { ScoreEntryClient } from "@/components/admin/score-entry-client"
import { getAdminSupabase } from "@/lib/supabase/admin"

export default async function MatchScoreEntryPage({ params }: { params: { matchId: string } }) {
  const { matchId } = params
  const { supabase } = await getAdminSupabase()

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select(`
      id,
      team1_id,
      team2_id,
      venue,
      status,
      winner_id,
      match_date,
      overs_per_innings,
      team1:teams!matches_team1_id_fkey(id, name),
      team2:teams!matches_team2_id_fkey(id, name)
    `)
    .eq("id", matchId)
    .maybeSingle()

  if (matchError) {
    console.error("Failed to load match for score entry", matchError)
  }

  if (!match) {
    notFound()
  }

  const { data: players, error: playersError } = await supabase
    .from("players")
    .select("id, name, team_id, role")
    .in("team_id", [match.team1_id, match.team2_id])
    .order("name")

  if (playersError) {
    console.error("Failed to load players for score entry", playersError)
  }

  const { data: scoreboard, error: scoreboardError } = await supabase
    .from("scoreboard")
    .select("*")
    .eq("match_id", matchId)
    .order("innings", { ascending: true })

  if (scoreboardError) {
    console.error("Failed to load scoreboard for score entry", scoreboardError)
  }

  const getTeamName = (team: any, fallback: string) => {
    if (!team) return fallback
    if (Array.isArray(team)) {
      return team[0]?.name ?? fallback
    }
    return team.name ?? fallback
  }

  const matchPayload = {
    id: match.id,
    venue: match.venue,
    status: match.status,
    winner_id: match.winner_id,
    match_date: match.match_date,
    overs_per_innings: match.overs_per_innings,
    team1: {
      id: match.team1_id,
      name: getTeamName(match.team1, "Team 1"),
    },
    team2: {
      id: match.team2_id,
      name: getTeamName(match.team2, "Team 2"),
    },
  }

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <ScoreEntryClient match={matchPayload} players={players ?? []} initialScoreboard={scoreboard ?? []} />
      </div>
    </div>
  )
}
