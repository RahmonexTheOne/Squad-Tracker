import { NextRequest, NextResponse } from 'next/server';
import { verifyKey } from 'discord-interactions';

export async function POST(req: NextRequest) {
  // 1. Récupération des données brutes
  const signature = req.headers.get('X-Signature-Ed25519') ?? '';
  const timestamp = req.headers.get('X-Signature-Timestamp') ?? '';
  const body = await req.text();

  // 2. Vérification de la clé (Log pour être sûr)
  // Si la clé est fausse, verifyKey renvoie false
  const isValidRequest = verifyKey(
    body,
    signature,
    timestamp,
    process.env.DISCORD_PUBLIC_KEY!
  );

  if (!isValidRequest) {
    console.error('❌ Signature Invalide ! Vérifie ta DISCORD_PUBLIC_KEY sur Vercel.');
    return new NextResponse('Bad request signature', { status: 401 });
  }

  // 3. Parsing du JSON
  const interaction = JSON.parse(body);

  // --- LE PING (Validation URL) ---
  if (interaction.type === 1) {
    console.log('✅ PING reçu de Discord. Envoi du PONG (type: 1)...');
    
    // METHODE EXPLICITE : On force le JSON et le status 200
    return new NextResponse(JSON.stringify({ type: 1 }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // --- COMMANDES SLASH ---
  if (interaction.type === 2) {
    const { name } = interaction.data;

    if (name === 'profile') {
      const discordUser = interaction.member?.user || interaction.user;
      const username = discordUser.username;
      const userId = discordUser.id;
      const baseUrl = 'https://squad-tracker-snowy.vercel.app'; 

      // Réponse explicite aussi ici
      return new NextResponse(JSON.stringify({
        type: 4,
        data: {
          content: `Hey <@${userId}> ! 🫡\nVoici ton dossier d'agent : ${baseUrl}/profile/${username}`
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Catch-all
  return new NextResponse(JSON.stringify({ error: 'Unknown command' }), { 
    status: 400,
    headers: { 'Content-Type': 'application/json' }
  });
}