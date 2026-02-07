// src/types/valorant.ts

export interface ValorantPlayerStats {
  rank: string;
  rank_img: string;
  elo: number;
  mmr_change_to_last_game: number;
  kda: string;
  hs_percent: number;
  win_rate: number;
  matches_played: number;
}

export interface ValorantMatch {
  metadata: {
    map: string;
    game_start: number; // Unix timestamp
    game_length: number; // ms
    mode: string;
    matchid: string;
    queue: string; // "Competitive", "Unrated"
  };
  players: {
    all_players: Array<{
      name: string;
      tag: string;
      team: string;
      character: string;
      currenttier_patched: string; // "Diamond 1"
      assets: {
        agent: {
          small: string; // Image URL
        };
      };
      stats: {
        score: number;
        kills: number;
        deaths: number;
        assists: number;
        headshots: number;
        bodyshots: number;
        legshots: number;
      };
    }>;
  };
  teams: {
    red: { has_won: boolean; rounds_won: number; rounds_lost: number };
    blue: { has_won: boolean; rounds_won: number; rounds_lost: number };
  };
}