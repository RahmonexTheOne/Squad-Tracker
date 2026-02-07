require('dotenv').config({ path: '.env.local' }); // On charge tes clés
const clientId = process.env.DISCORD_CLIENT_ID; // IL NOUS FAUT CET ID (voir plus bas)
const token = process.env.DISCORD_BOT_TOKEN; // Ton token de bot

const commands = [
  {
    name: 'profile',
    description: 'Affiche le lien vers ton profil Squad Tracker',
    type: 1, // CHAT_INPUT
  },
];

async function registerCommands() {
  if (!clientId || !token) {
      console.error("ERREUR : Il manque DISCORD_CLIENT_ID ou DISCORD_BOT_TOKEN dans ton .env.local !");
      return;
  }

  console.log('Enregistrement de la commande /profile...');

  const url = `https://discord.com/api/v10/applications/${clientId}/commands`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${token}`,
    },
    method: 'PUT',
    body: JSON.stringify(commands),
  });

  if (response.ok) {
    console.log('✅ Succès ! La commande /profile est enregistrée.');
  } else {
    const data = await response.json();
    console.error('❌ Erreur :', JSON.stringify(data, null, 2));
  }
}

registerCommands();