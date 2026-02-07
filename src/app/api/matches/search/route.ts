import { NextResponse } from 'next/server';
import { getSquadMatches, SquadMember } from '@/lib/valorant';
import { getSquadLeagueMatches } from '@/lib/league'; // 👈 Import de la fonction LoL

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // On récupère 'members' ET 'game' (qui vaut 'valorant' ou 'lol')
    const { members, game } = body; 

    if (!members || !Array.isArray(members) || members.length === 0) {
      return NextResponse.json({ error: 'No members provided' }, { status: 400 });
    }

    let matches = [];

    // 👇 Logique conditionnelle
    if (game === 'lol') {
        // Si le jeu est League of Legends
        matches = await getSquadLeagueMatches(members);
    } else {
        // Sinon par défaut (Valorant)
        matches = await getSquadMatches(members as SquadMember[]);
    }

    return NextResponse.json(matches);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}