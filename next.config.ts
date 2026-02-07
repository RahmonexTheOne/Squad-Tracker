import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the default behavior (no trailing slash),
  // but ensure the slash-variant of the Discord endpoint does NOT redirect.
  async rewrites() {
    return [{ source: "/api/interactions/", destination: "/api/interactions" }];
  },


  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.contentstack.io", // Pour l'image 3D de Jett
      },
      {
        protocol: "https",
        hostname: "media.valorant-api.com", // Pour les agents Valorant
      },
      {
        protocol: "https",
        hostname: "ddragon.leagueoflegends.com", // Pour les champions LoL
      },
      {
        protocol: "https",
        hostname: "cdn.pixabay.com", // Pour le fond d'écran
      },
      {
        protocol: "https",
        hostname: "wallpapers.com", // Pour la bannière
      },
    ],
  },
};

export default nextConfig;
