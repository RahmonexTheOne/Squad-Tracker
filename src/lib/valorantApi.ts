// src/lib/valorantApi.ts

const BASE_URL = 'https://api.henrikdev.xyz/valorant';

// Fonction pour récupérer le compte et le MMR (Rank)
export async function getPlayerStats(name: string, tag: string) {
  try {
    // 1. Récupérer le MMR (Rank actuel)
    const mmrResponse = await fetch(`${BASE_URL}/v1/mmr/eu/${name}/${tag}`);
    const mmrData = await mmrResponse.json();

    // 2. Récupérer les 5 derniers matchs pour calculer les stats récentes
    const matchesResponse = await fetch(`${BASE_URL}/v3/matches/eu/${name}/${tag}?size=5`);
    const matchesData = await matchesResponse.json();

    if (mmrData.status !== 200 || matchesData.status !== 200) {
      throw new Error("Joueur introuvable ou API down");
    }

    // On retourne un objet propre pour ton site
    return {
      rank: mmrData.data.currenttierpatched, // Ex: "Gold 2"
      rankImage: mmrData.data.images.small,  // Icône du rank
      elo: mmrData.data.ranking_in_tier,     // RR points
      matches: matchesData.data              // Historique complet
    };

  } catch (error) {
    console.error("Erreur fetch Valorant:", error);
    return null;
  }
}