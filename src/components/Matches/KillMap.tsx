'use client';

import { useEffect, useState } from 'react';

interface KillMapProps {
  mapName: string; // "Bind", "Haven"...
  deaths: Array<{ x: number; y: number; color: string; victimName: string }>; 
}

interface MapData {
  uuid: string;
  displayName: string;
  xMultiplier: number;
  yMultiplier: number;
  xScalarToAdd: number;
  yScalarToAdd: number;
  displayIcon: string;
}

export default function KillMap({ mapName, deaths }: KillMapProps) {
  const [mapData, setMapData] = useState<MapData | null>(null);

  // 1. On récupère les données EXACTES de la map (Multipliers) depuis l'API officielle
  useEffect(() => {
    async function fetchMapData() {
      try {
        const res = await fetch('https://valorant-api.com/v1/maps');
        const json = await res.json();
        // On cherche la map par son nom
        const found = json.data.find((m: any) => m.displayName.toLowerCase() === mapName.toLowerCase());
        
        if (found) {
          setMapData({
            uuid: found.uuid,
            displayName: found.displayName,
            xMultiplier: found.xMultiplier,
            yMultiplier: found.yMultiplier,
            xScalarToAdd: found.xScalarToAdd,
            yScalarToAdd: found.yScalarToAdd,
            displayIcon: found.displayIcon
          });
        }
      } catch (e) {
        console.error("Erreur chargement map", e);
      }
    }
    fetchMapData();
  }, [mapName]);

  if (!mapData) return <div className="w-full aspect-square bg-slate-900 rounded-xl animate-pulse"></div>;

  return (
    <div className="relative w-full aspect-square bg-slate-900 rounded-xl overflow-hidden border border-slate-700 group">
      {/* Image de la Map */}
      <img 
        src={mapData.displayIcon} 
        alt={mapName} 
        className="w-full h-full object-contain opacity-60 group-hover:opacity-40 transition duration-300" 
      />

      {/* Les Morts */}
      {deaths.map((death, i) => {
        // --- FORMULE MAGIQUE DE RIOT ---
        // C'est la seule façon d'avoir les points au bon endroit
        // Note: Sur la minimap, X et Y sont souvent inversés ou pivotés
        const xRaw = death.y * mapData.xMultiplier + mapData.xScalarToAdd;
        const yRaw = death.x * mapData.yMultiplier + mapData.yScalarToAdd;

        // On convertit en pourcentage CSS (0 to 1) -> (0% to 100%)
        // On clamp entre 2% et 98% pour ne pas que ça sorte du cadre
        const cssLeft = Math.min(Math.max(xRaw * 100, 2), 98); 
        const cssTop = Math.min(Math.max(yRaw * 100, 2), 98);

        return (
          <div 
            key={i}
            className={`
                absolute w-2.5 h-2.5 transform -translate-x-1/2 -translate-y-1/2 
                font-bold text-[10px] flex items-center justify-center cursor-help z-10
                hover:scale-150 transition
            `}
            style={{ 
                left: `${cssLeft}%`, 
                top: `${cssTop}%`,
                color: death.color // Couleur spécifique du joueur
            }}
            title={`Dead: ${death.victimName}`}
          >
            x
          </div>
        );
      })}
      
      <div className="absolute bottom-2 right-2 text-[10px] text-slate-500 bg-black/50 px-2 rounded backdrop-blur-sm">
        {mapName}
      </div>
    </div>
  );
}