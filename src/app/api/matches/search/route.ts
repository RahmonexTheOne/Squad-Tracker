import { NextResponse } from 'next/server';
import { getSquadMatches, SquadMember } from '@/lib/valorant';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { members } = body; // On récupère la liste des membres envoyée par le client

    if (!members || !Array.isArray(members) || members.length === 0) {
      return NextResponse.json({ error: 'No members provided' }, { status: 400 });
    }

    // On appelle ta fonction existante (qui est sécurisée côté serveur)
    const matches = await getSquadMatches(members as SquadMember[]);

    return NextResponse.json(matches);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}