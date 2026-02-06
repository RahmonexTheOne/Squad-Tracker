export async function getDiscordStatus(guildId: string, username: string) {
  try {
    // On appelle l'URL publique du widget Discord
    const res = await fetch(`https://discord.com/api/guilds/${guildId}/widget.json`, {
      next: { revalidate: 30 } // Cache de 30 secondes
    });

    if (!res.ok) return null;

    const data = await res.json();

    // 🔥 MODIFICATION ICI : On cherche par USERNAME (sensible à la casse)
    // On cherche le membre dont le username correspond exactement
    const member = data.members.find((m: any) => 
        m.username.toLowerCase() === username.toLowerCase()
    );

    if (!member) {
      return null;
    }

    return {
      status: member.status, // online, idle, dnd
      game: member.game ? member.game.name : null, // "Valorant", "League of Legends"...
      channel_name: member.channel_id ? getChannelName(data.channels, member.channel_id) : null
    };

  } catch (error) {
    console.error("Erreur Widget Discord:", error);
    return null;
  }
}

// Fonction pour retrouver le nom du salon vocal
function getChannelName(channels: any[], channelId: string) {
    const channel = channels.find((c: any) => c.id === channelId);
    return channel ? channel.name : null;
}