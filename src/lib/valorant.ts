// src/lib/valorant.ts

const BASE_URL = 'https://api.henrikdev.xyz/valorant';
const REGION = 'eu';

// --- 1. FONCTION EXISTANTE (PROFIL JOUEUR) ---
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
    // On lance TOUTES les requêtes en parallèle pour la vitesse ⚡
    const [matchesRes, mmrRes, accountRes, mmrLifeRes] = await Promise.all([
      // 1. Les 10 derniers matchs
      fetch(`${BASE_URL}/v3/matches/${REGION}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?size=10`, { headers, next: { revalidate: 300 } }),
      // 2. Historique MMR (Actuel)
      fetch(`${BASE_URL}/v1/mmr-history/${REGION}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`, { headers, next: { revalidate: 300 } }),
      // 3. Infos Compte (Niveau, Carte)
      fetch(`${BASE_URL}/v1/account/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`, { headers, next: { revalidate: 3600 } }), // Cache 1h
      // 4. MMR V2 (Pour avoir le PEAK RANK)
      fetch(`${BASE_URL}/v2/mmr/${REGION}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`, { headers, next: { revalidate: 3600 } })
    ]);

    const matchesData = await matchesRes.json();
    const mmrData = await mmrRes.json();
    const accountData = await accountRes.json();
    const mmrLifeData = await mmrLifeRes.json();

    // Vérification basique
    if (matchesData.status === 404) return null;

    return {
      matches: matchesData.data || [],
      mmr_history: mmrData.data || [],
      account: accountData.data || null,
      mmr_life: mmrLifeData.data || null, // Contient le highest_rank
    };
  } catch (error) {
    console.error("Erreur critique Valorant:", error);
    return null;
  }
}

// --- 2. NOUVEAU : GESTION DE LA SQUAD (MATCHES PAGE) ---

// Structure pour identifier un membre de la squad
export interface SquadMember {
  profileId: string;
  username: string;
  riotId: string; // "Rahmonex#EUW"
  avatarUrl: string;
}

// Fonction pour récupérer et fusionner les matchs de toute la squad
export async function getSquadMatches(members: SquadMember[]) {
  const apiKey = process.env.HENRIK_API_KEY;
  
  if (!apiKey) {
    console.error("❌ ERREUR: HENRIK_API_KEY manquante pour getSquadMatches.");
    return [];
  }

  const headers = { 
    'Authorization': apiKey, 
    'User-Agent': 'SquadTracker/1.0' 
  };

  // 1. On récupère les matchs de chaque membre en parallèle
  const promises = members.map(async (member) => {
    if (!member.riotId || !member.riotId.includes('#')) return [];
    
    const [name, tag] = member.riotId.split('#');
    
    try {
      // On récupère les 5 derniers matchs de chacun (size=5 pour éviter de spammer l'API si la squad est grande)
      const res = await fetch(`${BASE_URL}/v3/matches/${REGION}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?size=5`, { 
        headers, 
        next: { revalidate: 300 } // Cache 5 min
      });
      const data = await res.json();
      return data.data || [];
    } catch (e) {
      console.error(`Erreur fetch squad pour ${member.username}`, e);
      return [];
    }
  });

  const results = await Promise.all(promises);

  // 2. Fusion et Dé-duplication
  // Si vous avez joué ensemble, HenrikDev renvoie le même match ID pour chacun.
  // On utilise un Set pour ne garder qu'une seule copie du match.
  const allMatches: any[] = [];
  const processedMatchIds = new Set();

  // On met tout à plat
  results.flat().forEach((match) => {
    if (match && match.metadata && match.metadata.matchid) {
      if (!processedMatchIds.has(match.metadata.matchid)) {
        processedMatchIds.add(match.metadata.matchid);
        allMatches.push(match);
      }
    }
  });

  // 3. Tri final par date (du plus récent au plus vieux)
  return allMatches.sort((a, b) => b.metadata.game_start - a.metadata.game_start);
}