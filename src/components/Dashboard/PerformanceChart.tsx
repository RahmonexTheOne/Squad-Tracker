'use client';

import { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Swords, Shield, Users, CheckCircle2 } from 'lucide-react';

// Palette étendue pour 8 joueurs
const SQUAD_COLORS = [
  '#F87171', '#60A5FA', '#4ADE80', '#FACC15', 
  '#A78BFA', '#FB923C', '#2DD4BF', '#E879F9'
];

export default function PerformanceChart({ mmrData }: { mmrData: any[] }) {
  const [activeTab, setActiveTab] = useState<'valorant' | 'lol'>('valorant');
  
  // 1. GESTION DE LA SÉLECTION (Max 8)
  // On sélectionne par défaut les 8 premiers joueurs
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(
    mmrData.slice(0, 8).map(p => p.username)
  );

  const togglePlayer = (name: string) => {
    if (selectedPlayers.includes(name)) {
      // On ne peut pas désélectionner s'il ne reste qu'un seul joueur (pour éviter un graph vide)
      if (selectedPlayers.length > 1) {
        setSelectedPlayers(selectedPlayers.filter(p => p !== name));
      }
    } else {
      if (selectedPlayers.length < 8) {
        setSelectedPlayers([...selectedPlayers, name]);
      } else {
        alert("Maximum 8 agents displayed simultaneously.");
      }
    }
  };

  // 2. EXTRACTION INTELLIGENTE DES IMAGES DE RANG 🧠
  // On parcourt tout l'historique pour créer un dictionnaire { TierID: ImageURL }
  // C'est ça qui va réparer tes images cassées !
  const rankIconsMap = useMemo(() => {
    const icons: Record<number, string> = {};
    mmrData.forEach(player => {
      if (player.data) {
        player.data.forEach((match: any) => {
          // On chope l'image si elle existe et qu'on ne l'a pas encore
          if (match.currenttier && match.images?.small && !icons[match.currenttier]) {
            icons[match.currenttier] = match.images.small;
          }
        });
      }
    });
    return icons;
  }, [mmrData]);

  // 3. PRÉPARATION DES DONNÉES DU GRAPHIQUE
  const data = useMemo(() => {
    if (!mmrData || mmrData.length === 0) return [];
    
    // On veut afficher les 15 derniers matchs
    const maxLength = 15;
    const chartData = [];

    for (let i = 0; i < maxLength; i++) {
      const point: any = { name: `Game ${i + 1}` };
      
      mmrData.forEach((player) => {
        // Si le joueur n'est pas sélectionné, on l'ignore
        if (!selectedPlayers.includes(player.username)) return;
        
        // L'API renvoie du plus récent au plus vieux, on inverse pour le graphe
        const historyIndex = (maxLength - 1) - i;
        const gameData = player.data && player.data[historyIndex];

        if (gameData && gameData.currenttier > 2) { // On ignore Unrated (0-2)
          // Score Global = (Tier * 100) + RR
          // Ex: Gold 1 (Tier 15) avec 50 RR = 1550
          point[player.username] = (gameData.currenttier * 100) + gameData.ranking_in_tier;
          
          // On garde les infos pour le tooltip
          point[`${player.username}_rank`] = gameData.currenttierpatched;
          point[`${player.username}_tier`] = gameData.currenttier;
        } else {
          // Point null pour que "connectNulls" fasse le lien
          point[player.username] = null;
        }
      });
      chartData.push(point);
    }
    return chartData;
  }, [mmrData, selectedPlayers]);

  // 4. RENDU PERSONNALISÉ DE L'AXE Y (ICÔNES)
  const CustomYAxisTick = ({ x, y, payload }: any) => {
    // On récupère le Tier ID depuis la valeur (ex: 1550 -> 15)
    const tier = Math.floor(payload.value / 100);
    // On cherche l'image correspondante dans notre map
    const iconUrl = rankIconsMap[tier];
    
    if (!iconUrl) return null;

    return (
      <g transform={`translate(${x - 35},${y - 15})`}>
        <image href={iconUrl} x="0" y="0" height="30" width="30" preserveAspectRatio="xMidYMid meet" />
      </g>
    );
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm shadow-xl flex flex-col gap-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase">
            <Swords size={20} className="text-indigo-500"/> Squad Performance
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            {activeTab === 'valorant' ? 'Competitive RR History' : 'LP History'}
          </p>
        </div>

        {/* ONGLETS JEUX */}
        <div className="flex bg-slate-950/80 p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setActiveTab('valorant')} 
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'valorant' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            VALORANT
          </button>
          <button 
            onClick={() => setActiveTab('lol')} 
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'lol' ? 'bg-yellow-600 text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            LEAGUE
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full">
        
        {/* --- GRAPHIQUE --- */}
        <div className="flex-1 h-[350px] w-full min-w-0">
          {activeTab === 'valorant' ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="0" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" hide />
                
                {/* AXE Y AVEC ICÔNES */}
                <YAxis 
                  stroke="#475569" 
                  tick={<CustomYAxisTick />} 
                  domain={['auto', 'auto']} // Zoom automatique sur les rangs actifs
                  width={50} 
                  tickLine={false} 
                  axisLine={false}
                  interval={0} // Force l'affichage de tous les paliers calculés
                  allowDecimals={false}
                />
                
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                   itemStyle={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}
                   labelStyle={{ display: 'none' }}
                   formatter={(value: any, name: any, props: any) => {
                      // Affiche "Gold 1" au lieu de "1550"
                      const rankName = props.payload[`${name}_rank`] || "Unknown";
                      const rr = value % 100;
                      return [`${rankName} (${rr} RR)`, name];
                   }}
                />
                
                {/* LIGNES DES JOUEURS */}
                {mmrData.map((player, index) => (
                  selectedPlayers.includes(player.username) && (
                    <Line 
                      key={player.username}
                      type="monotone" 
                      dataKey={player.username} 
                      stroke={SQUAD_COLORS[index % SQUAD_COLORS.length]} 
                      strokeWidth={3}
                      dot={false}
                      connectNulls={true} // Relie les points même s'il y a des trous (Unrated)
                      activeDot={{ r: 6, stroke: '#0f172a', strokeWidth: 2 }}
                      animationDuration={1500}
                    />
                  )
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-slate-950/30 rounded-2xl border border-dashed border-slate-800">
               <Shield size={48} className="mb-4 opacity-10 text-yellow-500"/>
               <p className="text-sm font-black text-slate-500 tracking-widest uppercase">Summoner's Rift Offline</p>
            </div>
          )}
        </div>

        {/* --- SÉLECTEUR DE SQUAD (SIDEBAR) --- */}
        {mmrData.length > 0 && (
          <div className="w-full lg:w-56 bg-slate-950/60 rounded-2xl p-4 border border-white/5 flex flex-col shrink-0">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-2">
                <Users size={12}/> Focus ({selectedPlayers.length}/8)
                </h3>
            </div>
            
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto max-h-[300px] scrollbar-hide">
              {mmrData.map((player, index) => {
                const isSelected = selectedPlayers.includes(player.username);
                const color = SQUAD_COLORS[index % SQUAD_COLORS.length];
                
                return (
                  <button
                    key={player.username}
                    onClick={() => togglePlayer(player.username)}
                    className={`
                        group flex items-center justify-between p-2.5 rounded-xl border transition-all text-left whitespace-nowrap min-w-[140px]
                        ${isSelected 
                            ? 'bg-slate-800/80 border-slate-700 shadow-md' 
                            : 'bg-transparent border-transparent hover:bg-slate-800/40 opacity-60 hover:opacity-100'
                        }
                    `}
                  >
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full shadow-sm transition-transform ${isSelected ? 'scale-110' : 'scale-100'}`} style={{ backgroundColor: color }} />
                        <span className={`text-xs font-bold truncate max-w-[100px] ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                            {player.username}
                        </span>
                    </div>
                    {isSelected && <CheckCircle2 size={14} className="text-indigo-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}