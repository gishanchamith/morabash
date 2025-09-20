"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal } from "lucide-react"
import { useRealtimeStandings } from "@/lib/realtime"

export function LiveStandings() {
  const { standings, loading } = useRealtimeStandings()

  if (loading) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <Trophy className="h-8 w-8 text-primary" />
            Tournament Standings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center p-4">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-3">
          <Trophy className="h-8 w-8 text-primary" />
          Live Standings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-2 font-semibold">Pos</th>
                <th className="text-left py-3 px-2 font-semibold">Team</th>
                <th className="text-center py-3 px-2 font-semibold">M</th>
                <th className="text-center py-3 px-2 font-semibold">W</th>
                <th className="text-center py-3 px-2 font-semibold">Pts</th>
                <th className="text-center py-3 px-2 font-semibold">NRR</th>
              </tr>
            </thead>
            <tbody>
              {standings.slice(0, 6).map((standing, index) => (
                <tr key={standing.team_id} className="border-b border-border/30 hover:bg-accent/20 transition-colors">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">#{index + 1}</span>
                      {index === 0 && <Medal className="h-4 w-4 text-primary" />}
                      {index === 1 && <Medal className="h-4 w-4 text-secondary" />}
                      {index === 2 && <Medal className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="font-semibold">{standing.team?.name}</div>
                  </td>
                  <td className="text-center py-3 px-2 font-semibold">{standing.matches_played}</td>
                  <td className="text-center py-3 px-2 font-semibold text-primary">{standing.wins}</td>
                  <td className="text-center py-3 px-2">
                    <Badge className="neon-glow bg-primary/20 text-primary border-primary/50">{standing.points}</Badge>
                  </td>
                  <td className="text-center py-3 px-2 font-semibold text-secondary">
                    {standing.nrr >= 0 ? "+" : ""}
                    {standing.nrr.toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
