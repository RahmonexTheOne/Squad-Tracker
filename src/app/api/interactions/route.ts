import { NextRequest, NextResponse } from 'next/server';
import { verifyKey } from 'discord-interactions';

export async function POST(req: NextRequest) {
  // 1. Récupération rapide des données
  const signature = req.headers.get('X-Signature-Ed25519');
  const timestamp = req.headers.get('X-Signature-Timestamp');
  
  // Important : Clone le body pour ne pas le "consommer" deux fois si besoin
  const bodyText = await req.text();

  // 2. Vérification d'urgence (si headers manquants)
  if (!signature || !timestamp || !bodyText) {
    return NextResponse.json({ error: 'Missing headers' }, { status: 401 });
  }

  // 3. Vérification Crypto
  const isValidRequest = verifyKey(
    bodyText,
    signature,
    timestamp,
    process.env.DISCORD_PUBLIC_KEY!
  );

  if (!isValidRequest) {
    console.error('❌ Signature invalide');
    return NextResponse.json({ error: 'Bad request signature' }, { status: 401 });
  }

  // 4. Lecture du JSON
  const interaction = JSON.parse(bodyText);

  // --- LE PING (Le moment critique) ---
  if (interaction.type === 1) {
    console.log('✅ PING reçu. Envoi PONG JSON.');
    
    // Utilisation de NextResponse.json pour forcer une réponse rapide et propre
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