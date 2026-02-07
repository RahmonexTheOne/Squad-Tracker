'use client';

import { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { Swords, Shield } from 'lucide-react';

const SQUAD_COLORS = ['#F87171', '#60A5FA', '#4ADE80', '#FACC15', '#A78BFA'];

export default function PerformanceChart({ mmrData }: { mmrData: any[] }) {
  const [activeTab, setActiveTab] = useState<'valorant' | 'lol'>('valorant');

  // --- LOGIQUE DE CALCUL DU SCORE GLOBAL ---
  const formatData = () => {
    if (!mmrData || mmrData.length === 0) return [];
    
    const maxLength = 15;
    const chartData = [];

    for (let i = 0; i < maxLength; i++) {
      const point: any = { name: `Game ${i + 1}` };
      
      mmrData.forEach((player) => {
        const historyIndex = (maxLength - 1) - i;
        const gameData = player.data[historyIndex];

        if (gameData) {
          // Calcul: (Tier ID * 100) + RR actuel
          // Cela permet d'avoir une courbe qui monte continuellement même en changeant de rang
          point[player.username] = (gameData.currenttier * 100) + gameData.ranking_in_tier;
          
          // On stocke le nom du rang pour l'afficher dans le Tooltip
          point[`${player.username}_rank`] = gameData.currenttierpatched;
        }
      });
      chartData.push(point);
    }
    return chartData;
  };

  const data = formatData();

  // --- PERSONNALISATION DU TOOLTIP ---
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase tracking-widest text-center border-b border-white/5 pb-1">
            Squad Intel
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex flex-col mb-2 last:mb-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-white font-bold text-sm">{entry.name}</span>
              </div>
              {/* On récupère le nom du rang stocké dans les données */}
              <span className="text-[11px] text-slate-400 ml-4 font-mono uppercase">
                {entry.payload[`${entry.name}_rank`]} • {entry.value % 100} RR
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 relative overflow-hidden backdrop-blur-sm shadow-xl">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
           <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tighter">
             <Swords size={20} className="text-indigo-500"/> Squad Progress
           </h2>
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global Rank Evolution</p>
        </div>

        <div className="flex bg-slate-950/80 p-1 rounded-xl border border-white/5">
           <button 
             onClick={() => setActiveTab('valorant')}
             className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'valorant' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
           >
             VALORANT
           </button>
           <button 
             onClick={() => setActiveTab('lol')}
             className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'lol' ? 'bg-yellow-500 text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}
           >
             LEAGUE
           </button>
        </div>
      </div>

      <div className="h-[300px] w-full pr-4">
         {activeTab === 'valorant' ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="0" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis 
                  stroke="#475569" 
                  fontSize={10} 
                  fontWeight="bold"
                  tickLine={false}
                  axisLine={false}
                  domain={['auto', 'auto']} // S'adapte automatiquement aux rangs de la squad
                  tickFormatter={(value) => `${Math.floor(value / 100)}`} // Affiche l'ID de palier simplifié
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  iconType="diamond"
                  wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }} 
                />
                
                {mmrData.map((player, index) => (
                   <Line 
                     key={player.username}
                     type="stepAfter" // Utilise stepAfter pour bien voir les paliers de rang
                     dataKey={player.username} 
                     stroke={SQUAD_COLORS[index % SQUAD_COLORS.length]} 
                     strokeWidth={3}
                     dot={false} // Clean up look
                     activeDot={{ r: 6, stroke: '#0f172a', strokeWidth: 2 }}
                     animationDuration={1500}
                   />
                ))}
              </LineChart>
            </ResponsiveContainer>
         ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-slate-950/30 rounded-2xl border border-dashed border-slate-800">
               <Shield size={48} className="mb-4 opacity-10 text-yellow-500"/>
               <p className="text-sm font-black text-slate-500 tracking-widest">SUMMONER'S RIFT OFFLINE</p>
               <span className="text-[10px] text-yellow-500/50 mt-1 uppercase">Riot Games API Connection Pending</span>
            </div>
         )}
      </div>
    </div>
  );
}