export interface TeamInfo {
  name: string;
}

export interface ScoreboardEntry {
  id: string;
  runs: number;
  overs: number;
  innings: 1 | 2;
  team_id: string;
  wickets: number;
  match_id: string;
  current_rr: number;
  updated_at: string;
  required_rr: number | null;
}

export interface Match {
  id: string;
  team1_id: string;
  team2_id: string;
  venue: string;
  match_date: string;
  status: "completed" | "ongoing" | "upcoming"; // expanded based on possible values
  winner_id: string | null;
  toss_winner_id: string;
  elected_to: "bat" | "bowl";
  created_at: string;
  overs_per_innings: number;
  team1: TeamInfo;
  team2: TeamInfo;
  winner: TeamInfo | null;
  scoreboard: ScoreboardEntry[];
}

export type Matches = Match[];