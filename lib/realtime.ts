"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useMemo, useState } from "react"

export function useRealtimeMatches() {
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let isMounted = true

    const fetchMatches = async () => {
      const { data } = await supabase
        .from("matches")
        .select(`
          *,
          team1:teams!matches_team1_id_fkey(name),
          team2:teams!matches_team2_id_fkey(name),
          winner:teams!matches_winner_id_fkey(name),
          scoreboard(*)
        `)
        .order("match_date", { ascending: false })

      if (!isMounted) return

      if (data) {
        setMatches(data)
      }
      setLoading(false)
    }

    fetchMatches()

    // Set up real-time subscription
    const matchesSubscription = supabase
      .channel("matches-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, (payload) => {
        console.log("[v0] Match update received:", payload)
        fetchMatches() // Refetch all matches when any match changes
      })
      .subscribe()

    const scoreboardSubscription = supabase
      .channel("scoreboard-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "scoreboard" }, (payload) => {
        console.log("[v0] Scoreboard update received:", payload)
        fetchMatches() // Refetch matches when scoreboard changes
      })
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(matchesSubscription)
      supabase.removeChannel(scoreboardSubscription)
    }
  }, [supabase])

  return { matches, loading }
}

export function useRealtimeStandings() {
  const [standings, setStandings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let isMounted = true

    const fetchStandings = async () => {
      const { data } = await supabase
        .from("tournament_standings")
        .select(`
          *,
          team:teams(name, captain_name)
        `)
        .order("points", { ascending: false })
        .order("nrr", { ascending: false })

      if (!isMounted) return

      if (data) {
        setStandings(data)
      }
      setLoading(false)
    }

    fetchStandings()

    // Set up real-time subscription
    const standingsSubscription = supabase
      .channel("standings-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "tournament_standings" }, (payload) => {
        console.log("[v0] Standings update received:", payload)
        fetchStandings() // Refetch standings when they change
      })
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(standingsSubscription)
    }
  }, [supabase])

  return { standings, loading }
}

export function useRealtimeBalls(matchId: string) {
  const [balls, setBalls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!matchId) return

    let isMounted = true

    const fetchBalls = async () => {
      const { data } = await supabase
        .from("balls")
        .select(`
          *,
          batsman:players!balls_batsman_id_fkey(name),
          bowler:players!balls_bowler_id_fkey(name),
          wicket_player:players!balls_wicket_player_id_fkey(name)
        `)
        .eq("match_id", matchId)
        .order("created_at", { ascending: false })

      if (!isMounted) return

      if (data) {
        setBalls(data)
      }
      setLoading(false)
    }

    fetchBalls()

    // Set up real-time subscription for this specific match
    const ballsSubscription = supabase
      .channel(`balls-${matchId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "balls", filter: `match_id=eq.${matchId}` },
        (payload) => {
          console.log("[v0] Ball update received:", payload)
          fetchBalls() // Refetch balls when new ball is added
        },
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(ballsSubscription)
    }
  }, [matchId, supabase])

  return { balls, loading }
}
