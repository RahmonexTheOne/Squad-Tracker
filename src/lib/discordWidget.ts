export async function getDiscordStatus(guildId: string, discordId: string) {
  try {
    // On interroge Discord (sans bot, via l'API publique)
    const res = await fetch(`https://discord.com/api/guilds/${guildId}/widget.json`, {
      next: { revalidate: 30 } // Rafraîchit les données toutes les 30 secondes
    });

    if (!res.ok) return null;

    const data = await res.json();

    // On cherche l'utilisateur dans la liste des membres connectés
    const member = data.members.find((m: any) => m.id === discordId);

    if (!member) return null; // Il n'est pas connecté ou pas dans le vocal

    return {
      status: member.status, // "online", "idle", "dnd"
      game: member.game ? member.game.name : null, // ex: "Valorant"
      channel_name: member.channel_id ? getChannelName(data.channels, member.channel_id) : null
    };

  } catch (error) {
    console.error("Erreur Widget:", error);
    return null;
  }
}

// Petite fonction pour retrouver le nom du salon vocal
function getChannelName(channels: any[], channelId: string) {
    const channel = channels.find((c: any) => c.id === channelId);
    return channel ? channel.name : null;
}