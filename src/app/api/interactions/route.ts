import { NextRequest, NextResponse } from 'next/server';
import { verifyKey } from 'discord-interactions';

export async function POST(req: NextRequest) {
  // 1. SÉCURITÉ
  const signature = req.headers.get('X-Signature-Ed25519') ?? '';
  const timestamp = req.headers.get('X-Signature-Timestamp') ?? '';
  const body = await req.text();

  if (!process.env.DISCORD_PUBLIC_KEY) {
    console.error('ERREUR: DISCORD_PUBLIC_KEY manquante');
    return new NextResponse('Internal Server Error', { status: 500 });
  }

  const isValidRequest = verifyKey(
    body,
    signature,
    timestamp,
    process.env.DISCORD_PUBLIC_KEY
  );

  if (!isValidRequest) {
    return new NextResponse('Bad request signature', { status: 401 });
  }

  // 2. ANALYSE
  const interaction = JSON.parse(body);

  // --- LE PING (Validation URL) ---
  // On utilise "1" directement (c'est le code universel pour PING)
  if (interaction.type === 1) {
    console.log('PING reçu, envoi du PONG...');
    return NextResponse.json({ type: 1 }); // 1 = PONG
  }

  // --- COMMANDES SLASH ---
  // 2 = APPLICATION_COMMAND
  if (interaction.type === 2) {
    const { name } = interaction.data;

    if (name === 'profile') {
      const discordUser = interaction.member?.user || interaction.user;
      const username = discordUser.username;
      const userId = discordUser.id;
      const baseUrl = 'https://squad-tracker-snowy.vercel.app'; 

      return NextResponse.json({
        type: 4, // 4 = MESSAGE_CHANNEL
        data: {
          content: `Hey <@${userId}> ! 🫡\nVoici ton dossier d'agent : ${baseUrl}/profile/${username}`
        },
      });
    }
  }

  // 3. CATCH-ALL (Indispensable !)
  // Si on arrive ici, on doit quand même répondre quelque chose
  return NextResponse.json({ error: 'Unknown command' }, { status: 400 });
}