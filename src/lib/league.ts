const API_KEY = process.env.RIOT_API_KEY;

// ⚠️ Configuration Région (EUW)
const PLATFORM_URL = 'https://euw1.api.riotgames.com'; 
const REGIONAL_URL = 'https://europe.api.riotgames.com';

export async function getLeagueStats(gameName: string, tagLine: string) {
  // console.log(`🔍 [League] Start: ${gameName} #${tagLine}`);

  if (!API_KEY) {
    console.error("❌ [League] API Key Missing");
    return null;
  }

  const headers = { 'X-Riot-Token': API_KEY };

  try {
    // 1. ACCOUNT-V1 (Riot ID -> PUUID)
    const accountRes = await fetch(
      `${REGIONAL_URL}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
      { headers, next: { revalidate: 3600 } }
    );
    
    if (!accountRes.ok) return null; // Compte introuvable
    const accountData = await accountRes.json();
    const puuid = accountData.puuid;

    // 2. SUMMONER-V4 (PUUID -> Summoner ID)
    const summonerRes = await fetch(
      `${PLATFORM_URL}/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      { headers, next: { revalidate: 3600 } }
    );

    // Si le joueur n'a pas de profil LoL sur EUW (jamais connecté au jeu), on arrête là proprement
    if (!summonerRes.ok) {
        console.warn(`⚠️ [League] Summoner not found for ${gameName} (Never played LoL?)`);
        return null;
    }
    
    const summonerData = await summonerRes.json();

    // 3. LEAGUE-V4 (Summoner ID -> Rank)
    const rankRes = await fetch(
      `${PLATFORM_URL}/lol/league/v4/entries/by-summoner/${summonerData.id}`,
      { headers, next: { revalidate: 300 } }
    );
    
    let soloQueue = null;

    if (rankRes.ok) {
        const rankData = await rankRes.json();
        // C'est ICI que ça plantait : on vérifie que c'est bien un tableau
        if (Array.isArray(rankData)) {
            soloQueue = rankData.find((q: any) => q.queueType === 'RANKED_SOLO_5x5') || null;
        }
    }

    // 4. MATCH-V5 (Historique)
    const historyRes = await fetch(
      // 👇 Changement ici : count=10 au lieu de 5
      `${REGIONAL_URL}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=10`,
      { headers, cache: 'no-store' }
    );
    
    let matchesData: any[] = [];
    
    if (historyRes.ok) {
        const matchIds = await historyRes.json();
        if (Array.isArray(matchIds)) {
            const matchesPromises = matchIds.map(async (matchId: string) => {
                const res = await fetch(`${REGIONAL_URL}/lol/match/v5/matches/${matchId}`, { headers });
                return res.ok ? await res.json() : null;
            });
            const results = await Promise.all(matchesPromises);
            matchesData = results.filter(m => m && m.info); // Filtre les erreurs
        }
    }

    // --- RETOUR DES DONNÉES ---
    return {
      account: {
        name: accountData.gameName,
        tag: accountData.tagLine,
        level: summonerData.summonerLevel,
        iconId: summonerData.profileIconId,
        iconUrl: `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${summonerData.profileIconId}.jpg`
      },
      rank: soloQueue ? {
        tier: soloQueue.tier,
        rank: soloQueue.rank,
        lp: soloQueue.leaguePoints,
        wins: soloQueue.wins,
        losses: soloQueue.losses,
        winRate: Math.round((soloQueue.wins / (soloQueue.wins + soloQueue.losses)) * 100)
      } : {
        tier: "UNRANKED",
        rank: "",
        lp: 0,
        wins: 0,
        losses: 0,
        winRate: 0
      },
      matches: matchesData,
      puuid: puuid
    };

  } catch (error) {
    console.error("❌ [League] API Error:", error);
    return null;
  }
}