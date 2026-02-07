import { verifyKey } from 'discord-interactions';

export async function POST(req: Request) {
  // 1. On récupère les headers et le body
  const signature = req.headers.get('X-Signature-Ed25519');
  const timestamp = req.headers.get('X-Signature-Timestamp');
  const body = await req.text();

  // 2. Validation basique des inputs
  if (!signature || !timestamp || !body || !process.env.DISCORD_PUBLIC_KEY) {
    return new Response('Missing request data', { status: 401 });
  }

  // 3. Vérification cryptographique
  const isValidRequest = verifyKey(
    body,
    signature,
    timestamp,
    process.env.DISCORD_PUBLIC_KEY
  );

  if (!isValidRequest) {
    return new Response('Bad request signature', { status: 401 });
  }

  // 4. Parsing JSON
  const interaction = JSON.parse(body);

  // --- LE PING (Validation URL) ---
  if (interaction.type === 1) {
    console.log('✅ PING reçu. Réponse immédiate.');
    
    // On utilise "Response" (standard Web) et non "NextResponse"
    return new Response(JSON.stringify({ type: 1 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
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

      return new Response(JSON.stringify({
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

  return new Response(JSON.stringify({ error: 'Unknown command' }), { 
    status: 400,
    headers: { 'Content-Type': 'application/json' }
  });
}