import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import LeaderboardUI from '@/components/LeaderboardUI';
import { getSquadMMRHistory, SquadMember } from '@/lib/valorant';

// HELPER : SCORE DES RANGS (Pour trier côté serveur)
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
  console.log("\n--- 🔍 LEADERBOARD SERVER DEBUG ---");
  
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  // 1. Qui suis-je ?
  const { data: { user } } = await supabase.auth.getUser();
  console.log("1. User:", user?.id);

  let squadProfiles: any[] = [];
  let squadName = "Loading...";

  if (user) {
    // 2. Mon Profil
    const { data: myProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (myProfile) {
        // 3. Squad Logic (Identique Dashboard)
        if (myProfile.squad_id) {
            console.log("3. Mode Squad:", myProfile.squad_id);
            // Nom Squad
            const { data: squadData } = await supabase
                .from('squads')
                .select('name')
                .eq('id', myProfile.squad_id)
                .single();
            squadName = squadData?.name || "My Squad";

            // Membres
            const { data: members } = await supabase
                .from('profiles')
                .select('*')
                .eq('squad_id', myProfile.squad_id);
            squadProfiles = members || [myProfile];
        } else {
            console.log("3. Mode Solo");
            squadName = "Solo Agent";
            squadProfiles = [myProfile];
        }
    }
  }

  // 4. Récupérer les Live Ranks via API Valorant (pour avoir le vrai Rank actuel)
  const squadMembers: SquadMember[] = squadProfiles
    .filter(p => p.riot_id)
    .map(p => ({
        profileId: p.id,
        username: p.username,
        riotId: p.riot_id,
        avatarUrl: p.avatar_url
    }));

  const squadMMR = await getSquadMMRHistory(squadMembers);

  // 5. Fusionner les données (Profile DB + Live Rank API)
  const leaderboardData = squadProfiles.map(profile => {
      // On cherche si on a des données live
      const liveData = squadMMR.find(m => m.username === profile.username);
      const latestMatch = liveData?.data?.[0];

      // On utilise les données live en priorité, sinon la DB
      const currentRank = latestMatch?.currenttierpatched || profile.valo_rank || "Unranked";
      const currentRR = latestMatch?.ranking_in_tier || profile.valo_rr || 0;

      return {
          ...profile,
          valo_rank: currentRank,
          valo_rr: currentRR,
          // On garde les autres stats de la DB (KD, Role, etc)
      };
  });

  // 6. Trier
  const sortedLeaderboard = leaderboardData.sort((a, b) => {
      const scoreA = getRankScore(a.valo_rank, a.valo_rr);
      const scoreB = getRankScore(b.valo_rank, b.valo_rr);
      return scoreB - scoreA;
  });

  console.log(`4. Leaderboard prêt: ${sortedLeaderboard.length} joueurs.`);
  console.log("--- END DEBUG ---\n");

  // On passe tout au Client Component
  return <LeaderboardUI squadName={squadName} players={sortedLeaderboard} />;
}