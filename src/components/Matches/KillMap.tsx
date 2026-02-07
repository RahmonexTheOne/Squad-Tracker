'use client';

interface KillMapProps {
  mapName: string; // "Bind", "Haven"...
  deaths: Array<{ x: number; y: number; time: number }>; // Coordonnées des morts
}

export default function KillMap({ mapName, deaths }: KillMapProps) {
  // URL générique pour les minimaps (HenrikDev ou une autre source stable)
  // Astuce : On utilise les noms en minuscule pour l'URL
  const mapUrl = `https://media.valorant-api.com/maps/${getMapUuid(mapName)}/displayicon.png`;

  return (
    <div className="relative w-full aspect-square bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
      {/* Image de la Map */}
      <img src={mapUrl} alt={mapName} className="w-full h-full object-contain opacity-60" />

      {/* Les Morts (X rouges) */}
      {deaths.map((death, i) => {
        // Conversion approximative des coordonnées jeu -> CSS (0-100%)
        // Note: C'est complexe d'être pixel perfect sans les données de calibration de chaque map
        // Ici on suppose un mapping normalisé standard
        const cssX = mapXToCss(death.x, mapName); 
        const cssY = mapYToCss(death.y, mapName);

        if(!cssX || !cssY) return null;

        return (
          <div 
            key={i}
            className="absolute text-red-500 font-bold text-xs transform -translate-x-1/2 -translate-y-1/2 drop-shadow-md select-none"
            style={{ left: cssX, top: cssY }}
            title={`Death at ${death.time}ms`}
          >
            x
          </div>
        );
      })}
      
      <div className="absolute bottom-2 right-2 text-[10px] text-slate-500 bg-black/50 px-2 rounded">
        Death Locations (Approx.)
      </div>
    </div>
  );
}

// --- HELPERS (Simplifiés pour l'exemple) ---
// Idéalement, il faut une liste de UUIDs, mais voici une astuce pour l'image
function getMapUuid(mapName: string) {
    // Mapping manuel des ID de map (Valorant-API)
    const maps: Record<string, string> = {
        "Ascent": "7eaecc1b-4337-bbf6-6ab9-04b8f06b3319",
        "Split": "d960549e-485c-e861-8d71-aa9d1aed12a2",
        "Fracture": "b529448b-4d84-4342-b050-56367e432a68",
        "Bind": "2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba",
        "Breeze": "2fb9a4fd-47b8-4e7d-a969-74b4046ebd53",
        "Lotus": "2fe4ed3a-450a-948b-6d6b-e89a78e680a9",
        "Pearl": "fd267378-4d1d-484f-44a7-b9db8135b537",
        "Icebox": "e2ad5c54-4114-a870-9641-8ea21279579a",
        "Haven": "2bee0dc9-4ffe-519b-1cbd-7fbe763a6047",
        "Sunset": "92584fbe-486a-b1b2-9faa-39b0f486b498"
    };
    return maps[mapName] || maps["Ascent"]; // Fallback
}

// Fonction de conversion (Nécessite calibration par map en théorie)
// On utilise une formule générique ici qui marche "à peu près" pour la démo
function mapXToCss(gameX: number, mapName: string) {
    // Les coordonnées vont généralement de -X à +X. On normalise.
    // C'est très approximatif sans les multipliers JSON de Riot.
    return `${((gameX + 15000) / 30000) * 100}%`; 
}
function mapYToCss(gameY: number, mapName: string) {
    // L'axe Y est inversé dans le jeu vs CSS
    return `${((15000 - gameY) / 30000) * 100}%`;
}