import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import LeaderboardUI from '@/components/LeaderboardUI';
import { getValorantStats } from '@/lib/valorant';

// Helper pour le tri
const RANK_VALUES: Record<string, number> = {
  'Radiant': 25, 'Immortal 3': 24, 'Immortal 2': 23, 'Immortal 1': 22,
  'Ascendant 3': 21, 'Ascendant 2': 20, 'Ascendant 1': 19,
  'Diamond 3': 18, 'Diamond 2': 17, 'Diamond 1': 16,
  'Platinum 3': 15, 'Platinum 2': 14, 'Platinum 1': 13,
  'Gold 3': 12, 'Gold 2': 11, 'Gold 1': 10,
  'Silver 3': 9, 'Silver 2': 8, 'Silver 1': 7,
  'Bronze 3': 6, 'Bronze 2': 5, 'Bronze 1': 4,
  'Iron 3': 3, 'Iron 2': 2, 'Iron 1': 1, 'Unranked': 0
};

const getRankScore = (tier: string, rr: number) => {
  const tierValue = RANK_VALUES[tier] || 0;
  return (tierValue * 1000) + (rr || 0);
};

export default async function LeaderboardPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  
  let squadProfiles: any[] = [];
  let squadName = "Loading...";

  if (user) {
    const { data: myProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (myProfile) {
        if (myProfile.squad_id) {
            const { data: squadData } = await supabase.from('squads').select('name').eq('id', myProfile.squad_id).single();
            squadName = squadData?.name || "My Squad";

            const { data: members } = await supabase.from('profiles').select('*').eq('squad_id', myProfile.squad_id);
            squadProfiles = members || [myProfile];
        } else {
            squadName = "Solo Agent";
            squadProfiles = [myProfile];
        }
    }
  }

  // 🔥 RÉCUPÉRATION MASSIVE DES DONNÉES (Stats complètes pour chaque joueur)
  // On utilise Promise.all pour charger tout le monde en parallèle
  const leaderboardData = await Promise.all(
    squadProfiles.map(async (profile) => {
        let valoData = null;
        
        // Si le joueur a un Riot ID, on va chercher ses vrais matchs
        if (profile.riot_id && profile.riot_id.includes('#')) {
            const [name, tag] = profile.riot_id.split('#');
            try {
                // On utilise ta fonction getValorantStats qui ramène Matchs + MMR + Account
                valoData = await getValorantStats(name, tag);
            } catch (e) {
                console.error(`Erreur stats pour ${profile.username}`, e);
            }
        }

        // On détermine le rang actuel (Live > DB)
        let currentRank = profile.valo_rank || "Unranked";
        let currentRR = profile.valo_rr || 0;

        if (valoData && valoData.mmr_history && valoData.mmr_history.length > 0) {
            currentRank = valoData.mmr_history[0].currenttierpatched;
            currentRR = valoData.mmr_history[0].ranking_in_tier;
        }

        return {
            ...profile,
            valo_rank: currentRank,
            valo_rr: currentRR,
            fullStats: valoData, // On passe TOUTES les données (matchs inclus) au composant Client
        };
    })
  );

  // Tri par rang
  const sortedLeaderboard = leaderboardData.sort((a, b) => {
      const scoreA = getRankScore(a.valo_rank, a.valo_rr);
      const scoreB = getRankScore(b.valo_rank, b.valo_rr);
      return scoreB - scoreA;
  });

  return <LeaderboardUI squadName={squadName} players={sortedLeaderboard} />;
}