import { NextResponse } from 'next/server';
import { verifyKey } from 'discord-interactions';

// 🔥 LA LIGNE MAGIQUE : Force le mode "Edge" (Démarrage en 0.1s)
export const runtime = 'edge'; 

export async function POST(req: Request) {
  // 1. Récupération des données (API Web Standard pour le Edge)
  const signature = req.headers.get('X-Signature-Ed25519');
  const timestamp = req.headers.get('X-Signature-Timestamp');
  const body = await req.text();

  // 2. Vérification rapide
  if (!signature || !timestamp || !body) {
    return NextResponse.json({ error: 'Bad request' }, { status: 401 });
  }

  // 3. Vérification Crypto
  // Note: discord-interactions fonctionne très bien sur le Edge
  const isValidRequest = verifyKey(
    body,
    signature,
    timestamp,
    process.env.DISCORD_PUBLIC_KEY!
  );

  if (!isValidRequest) {
    return NextResponse.json({ error: 'Bad request signature' }, { status: 401 });
  }

  // 4. Traitement
  const interaction = JSON.parse(body);

  // --- PING (Validation URL) ---
  if (interaction.type === 1) {
    return NextResponse.json({ type: 1 });
  }

  // --- COMMANDES ---
  if (interaction.type === 2) {
    const { name } = interaction.data;
    
    if (name === 'profile') {
      const discordUser = interaction.member?.user || interaction.user;
      const baseUrl = 'https://squad-tracker-snowy.vercel.app'; 
      
      return NextResponse.json({
        type: 4,
        data: {
          content: `Hey <@${discordUser.id}> ! 🫡\nVoici ton dossier : ${baseUrl}/profile/${discordUser.username}`
        }
      });
    }
  }

  return NextResponse.json({ error: 'Unknown command' }, { status: 400 });
}