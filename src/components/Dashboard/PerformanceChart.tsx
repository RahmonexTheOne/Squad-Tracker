'use client';

import { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { Swords, Shield, AlertCircle } from 'lucide-react';

// Palette de couleurs (Même que pour les matchs)
const SQUAD_COLORS = ['#F87171', '#60A5FA', '#4ADE80', '#FACC15', '#A78BFA'];

export default function PerformanceChart({ mmrData }: { mmrData: any[] }) {
  const [activeTab, setActiveTab] = useState<'valorant' | 'lol'>('valorant');

  // --- TRANSFORMATION DES DONNÉES POUR RECHARTS ---
  // On doit transformer les données pour qu'elles aient cette forme :
  // [ { index: 1, Rahmonex: 240, Lallou: 150 }, { index: 2, ... } ]
  
  const formatData = () => {
    if (!mmrData || mmrData.length === 0) return [];
    
    // On prend les 15 derniers matchs max
    const maxLength = 15;
    const chartData = [];

    for (let i = 0; i < maxLength; i++) {
      const point: any = { name: `Game ${i + 1}` };
      
      mmrData.forEach((player) => {
        // L'API donne l'historique du plus récent au plus vieux.
        // On inverse l'index pour le graph (0 = plus vieux match affiché)
        const historyIndex = (maxLength - 1) - i;
        if (player.data[historyIndex]) {
           // ranking_in_tier = RR (ex: 50/100)
           point[player.username] = player.data[historyIndex].ranking_in_tier;
        }
      });
      chartData.push(point);
    }
    return chartData;
  };

  const data = formatData();

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 relative overflow-hidden backdrop-blur-sm">
      
      {/* --- HEADER & TABS --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
           <h2 className="text-xl font-bold text-white flex items-center gap-2">
             <Swords size={20} className="text-indigo-500"/> Performance Trends
           </h2>
           <p className="text-xs text-slate-400">RR Evolution (Last 15 Games)</p>
        </div>

        {/* TABS */}
        <div className="flex bg-slate-950/50 p-1 rounded-xl border border-white/5">
           <button 
             onClick={() => setActiveTab('valorant')}
             className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'valorant' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
           >
             <Swords size={14}/> VALORANT
           </button>
           <button 
             onClick={() => setActiveTab('lol')}
             className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'lol' ? 'bg-yellow-500 text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}
           >
             <Shield size={14}/> LEAGUE
           </button>
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="h-[300px] w-full">
         {activeTab === 'valorant' ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="name" hide />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" />
                
                {/* Génération dynamique des lignes pour chaque joueur */}
                {mmrData.map((player, index) => (
                   <Line 
                     key={player.username}
                     type="monotone" 
                     dataKey={player.username} 
                     stroke={SQUAD_COLORS[index % SQUAD_COLORS.length]} 
                     strokeWidth={3}
                     dot={{ r: 4, fill: '#0f172a', strokeWidth: 2 }}
                     activeDot={{ r: 6 }}
                   />
                ))}
              </LineChart>
            </ResponsiveContainer>
         ) : (
            // --- LOL PLACEHOLDER ---
            <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-slate-950/30 rounded-2xl border border-dashed border-slate-800">
               <Shield size={48} className="mb-4 opacity-20 text-yellow-500"/>
               <p className="text-lg font-bold text-slate-400">Summoner's Rift Offline</p>
               <p className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded mt-2 border border-yellow-500/20">
                 COMING SOON
               </p>
            </div>
         )}
      </div>

    </div>
  );
}