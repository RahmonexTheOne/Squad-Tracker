import { NextRequest, NextResponse } from 'next/server';
import { 
  verifyKey, 
  InteractionType, 
  InteractionResponseType 
} from 'discord-interactions';

export async function POST(req: NextRequest) {
  // 1. VÉRIFICATION DE SÉCURITÉ (Obligatoire)
  const signature = req.headers.get('X-Signature-Ed25519') ?? '';
  const timestamp = req.headers.get('X-Signature-Timestamp') ?? '';
  const body = await req.text(); // On a besoin du body brut pour la verif

  const isValidRequest = verifyKey(
    body,
    signature,
    timestamp,
    process.env.DISCORD_PUBLIC_KEY!
  );

  if (!isValidRequest) {
    return new NextResponse('Bad request signature', { status: 401 });
  }

  // 2. TRAITEMENT DE LA REQUÊTE
  const interaction = JSON.parse(body);

  // A. PING (Discord vérifie que tu es en vie)
  if (interaction.type === InteractionType.PING) {
    return NextResponse.json({ type: InteractionResponseType.PONG });
  }

  // B. SLASH COMMANDS (ex: /profile)
  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    const { name } = interaction.data;

    if (name === 'profile') {
    const discordUser = interaction.member.user;
    const username = discordUser.username;
    const userId = discordUser.id;

    // TON VRAI LIEN EST ICI
    const baseUrl = 'https://squad-tracker-snowy.vercel.app'; 

    return NextResponse.json({
      type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
      data: {
        content: `Hey <@${userId}> ! 🫡\nVoici ton dossier d'agent : ${baseUrl}/profile/${username}`
      },
    });
  }
}
}