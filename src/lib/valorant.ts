const BASE_URL = 'https://api.henrikdev.xyz/valorant';
const REGION = 'eu';

// --- 1. FONCTION PROFIL JOUEUR (Reste inchangée) ---
export async function getValorantStats(name: string, tag: string) {
  const apiKey = process.env.HENRIK_API_KEY;

  if (!apiKey) {
    console.error("❌ ERREUR: HENRIK_API_KEY manquante.");
    return null;
  }

  const headers = {
    'Authorization': apiKey,
    'User-Agent': 'SquadTracker/1.0'
  };

  try {
    const [matchesRes, mmrRes, accountRes, mmrLifeRes] = await Promise.all([
      fetch(`${BASE_URL}/v3/matches/${REGION}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?size=10`, { headers, next: { revalidate: 300 } }),
      fetch(`${BASE_URL}/v1/mmr-history/${REGION}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`, { headers, next: { revalidate: 300 } }),
      fetch(`${BASE_URL}/v1/account/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`, { headers, next: { revalidate: 3600 } }), 
      fetch(`${BASE_URL}/v2/mmr/${REGION}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`, { headers, next: { revalidate: 3600 } })
    ]);

    const matchesData = await matchesRes.json();
    const mmrData = await mmrRes.json();
    const accountData = await accountRes.json();
    const mmrLifeData = await mmrLifeRes.json();

    if (matchesData.status === 404) return null;

    return {
      matches: matchesData.data || [],
      mmr_history: mmrData.data || [],
      account: accountData.data || null,
      mmr_life: mmrLifeData.data || null, 
    };
  } catch (error) {
    console.error("Erreur critique Valorant:", error);
    return null;
  }
}

// --- 2. GESTION DE LA SQUAD (C'est ici qu'on augmente la limite) ---

export interface SquadMember {
  profileId: string;
  username: string;
  riotId: string; 
  avatarUrl: string;
}

export async function getSquadMatches(members: SquadMember[]) {
  const apiKey = process.env.HENRIK_API_KEY;
  
  if (!apiKey) return [];

  const headers = { 
    'Authorization': apiKey, 
    'User-Agent': 'SquadTracker/1.0' 
  };

  const promises = members.map(async (member) => {
    if (!member.riotId || !member.riotId.includes('#')) return [];
    
    const [name, tag] = member.riotId.split('#');
    
    try {
      // 🔥 MODIFICATION ICI : on passe de size=5 à size=15
      // Cela va récupérer les 15 derniers matchs de chaque membre
      const res = await fetch(`${BASE_URL}/v3/matches/${REGION}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?size=15`, { 
        headers, 
        next: { revalidate: 300 } // Cache de 5 minutes
      });
      const data = await res.json();
      return data.data || [];
    } catch (e) {
      console.error(`Erreur fetch squad pour ${member.username}`, e);
      return [];
    }
  });

  const results = await Promise.all(promises);

  const allMatches: any[] = [];
  const processedMatchIds = new Set();

  results.flat().forEach((match) => {
    if (match && match.metadata && match.metadata.matchid) {
      if (!processedMatchIds.has(match.metadata.matchid)) {
        processedMatchIds.add(match.metadata.matchid);
        allMatches.push(match);
      }
    }
  });

  // Tri par date (du plus récent au plus vieux)
  return allMatches.sort((a, b) => b.metadata.game_start - a.metadata.game_start);
}