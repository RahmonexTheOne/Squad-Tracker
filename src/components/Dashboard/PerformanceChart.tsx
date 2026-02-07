'use client';

import { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { Swords, Shield, Users } from 'lucide-react';

// Extended palette for up to 8 members
const SQUAD_COLORS = [
  '#F87171', '#60A5FA', '#4ADE80', '#FACC15', 
  '#A78BFA', '#FB923C', '#2DD4BF', '#E879F9'
];

const getRankIcon = (tier: number) => {
  if (tier <= 0) return null;
  // Official Valorant API CDN for competitive tier icons
  return `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-935083977d17/${tier}/smallicon.png`;
};

export default function PerformanceChart({ mmrData }: { mmrData: any[] }) {
  const [activeTab, setActiveTab] = useState<'valorant' | 'lol'>('valorant');
  
  // Track which players are selected (Limit of 8)
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(
    mmrData.slice(0, 8).map(p => p.username)
  );

  const togglePlayer = (name: string) => {
    if (selectedPlayers.includes(name)) {
      setSelectedPlayers(selectedPlayers.filter(p => p !== name));
    } else if (selectedPlayers.length < 8) {
      setSelectedPlayers([...selectedPlayers, name]);
    }
  };

  // Data formatting logic remains identical but filtered by selectedPlayers
  const data = useMemo(() => {
    if (!mmrData || mmrData.length === 0) return [];
    const maxLength = 15;
    const chartData = [];

    for (let i = 0; i < maxLength; i++) {
      const point: any = { name: `Game ${i + 1}` };
      mmrData.forEach((player) => {
        if (!selectedPlayers.includes(player.username)) return;
        
        const historyIndex = (maxLength - 1) - i;
        const gameData = player.data[historyIndex];

        if (gameData && gameData.currenttier > 0) {
          point[player.username] = (gameData.currenttier * 100) + gameData.ranking_in_tier;
          point[`${player.username}_rank`] = gameData.currenttierpatched;
        } else {
          point[player.username] = null;
        }
      });
      chartData.push(point);
    }
    return chartData;
  }, [mmrData, selectedPlayers]);

  const CustomYAxisTick = ({ x, y, payload }: any) => {
    const tier = Math.floor(payload.value / 100);
    const iconUrl = getRankIcon(tier);
    if (!iconUrl) return null;
    return (
      <g transform={`translate(${x - 35},${y - 12})`}>
        <image href={iconUrl} x="0" y="0" height="24" width="24" preserveAspectRatio="xMidYMid meet" />
      </g>
    );
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm shadow-xl">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* --- MAIN CHART AREA --- */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase">
                <Swords size={20} className="text-indigo-500"/> Squad Evolution
              </h2>
            </div>
            <div className="flex bg-slate-950/80 p-1 rounded-xl border border-white/5">
              <button onClick={() => setActiveTab('valorant')} className={`px-4 py-2 rounded-lg text-xs font-black transition ${activeTab === 'valorant' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>VALO</button>
              <button onClick={() => setActiveTab('lol')} className={`px-4 py-2 rounded-lg text-xs font-black transition ${activeTab === 'lol' ? 'bg-yellow-600 text-black' : 'text-slate-500'}`}>LOL</button>
            </div>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ left: 25, right: 10 }}>
                <CartesianGrid strokeDasharray="0" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis 
                  stroke="#475569" 
                  tick={<CustomYAxisTick />} 
                  domain={['auto', 'auto']} 
                  width={45} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155' }}
                   itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                {mmrData.map((player, index) => (
                  selectedPlayers.includes(player.username) && (
                    <Line 
                      key={player.username}
                      type="monotone" 
                      dataKey={player.username} 
                      stroke={SQUAD_COLORS[index % SQUAD_COLORS.length]} 
                      strokeWidth={3}
                      dot={false}
                      connectNulls={true}
                      activeDot={{ r: 6, stroke: '#0f172a', strokeWidth: 2 }}
                    />
                  )
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- SQUAD SELECTOR (SIDEBAR) --- */}
        {mmrData.length > 1 && (
          <div className="w-full lg:w-48 bg-slate-950/50 rounded-2xl p-4 border border-white/5">
            <h3 className="text-[10px] text-slate-500 font-bold uppercase mb-4 flex items-center gap-2">
              <Users size={12}/> Focus ({selectedPlayers.length}/8)
            </h3>
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto max-h-[300px] no-scrollbar">
              {mmrData.map((player, index) => {
                const isSelected = selectedPlayers.includes(player.username);
                return (
                  <button
                    key={player.username}
                    onClick={() => togglePlayer(player.username)}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left whitespace-nowrap ${
                      isSelected 
                        ? 'bg-slate-800 border-indigo-500/50' 
                        : 'bg-transparent border-transparent opacity-40 grayscale hover:opacity-100'
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SQUAD_COLORS[index % SQUAD_COLORS.length] }} />
                    <span className="text-xs font-bold text-slate-200 truncate">{player.username}</span>
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