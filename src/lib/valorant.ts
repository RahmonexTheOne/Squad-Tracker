const BASE_URL = 'https://api.henrikdev.xyz/valorant';
const REGION = 'eu';

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