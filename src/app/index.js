require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');

// 1. Connexion Supabase (Mode Admin)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 2. Configuration du Bot Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildPresences,  // Pour voir les jeux
        GatewayIntentBits.GuildVoiceStates // Pour voir les canaux vocaux
    ]
});

client.once('ready', () => {
    console.log(`📡 Surveillance active : Connecté en tant que ${client.user.tag}`);
});

// --- TRACKING : CHANGEMENT DE JEU (PRESENCE) ---
client.on('presenceUpdate', async (oldPresence, newPresence) => {
    if (!newPresence || !newPresence.user) return;

    // On cherche l'utilisateur dans Supabase via son ID Discord (stocké dans raw_user_meta_data si login discord)
    // Mais pour simplifier ici, on va supposer qu'on a stocké l'ID discord quelque part.
    // L'astuce : Le login Discord via Supabase ne donne pas facilement l'ID Discord dans la table profile direct.
    
    const activities = newPresence.activities;
    const game = activities.find(act => act.type === 0); // Type 0 = Playing a game
    const gameName = game ? game.name : null;
    const status = newPresence.status;

    console.log(`[INFO] ${newPresence.user.username} est ${status} et joue à : ${gameName || 'Rien'}`);

    // MISE A JOUR SUPABASE
    // Note: Pour que ça marche parfaitement, il faudra qu'on lie l'ID Discord à l'ID Supabase.
    // Pour l'instant, on va chercher par le username (c'est risqué si homonyme mais ok pour test)
    
    // On essaie de trouver le profil qui a ce pseudo Discord
    // (Dans l'idéal il faudrait une colonne 'discord_uid' dans la table profiles)
    
    /* ⚠️ IMPORTANT : Ce code suppose que le 'username' dans ta table profiles 
       est EXACTEMENT le même que sur Discord. Sinon il faut ajouter une colonne discord_id.
    */
});

// --- TRACKING : VOCAL (VOICE STATE) ---
client.on('voiceStateUpdate', async (oldState, newState) => {
    const user = newState.member.user;
    const isMuted = newState.selfMute;
    
    // Si l'utilisateur rejoint un canal
    if (!oldState.channelId && newState.channelId) {
        console.log(`🎙️ ${user.username} a rejoint le vocal : ${newState.channel.name}`);
        // Update Supabase: is_in_voice = true
    }

    // Si l'utilisateur quitte un canal
    if (oldState.channelId && !newState.channelId) {
        console.log(`🔇 ${user.username} a quitté le vocal.`);
        // Update Supabase: is_in_voice = false
    }
});

client.login(process.env.DISCORD_TOKEN);