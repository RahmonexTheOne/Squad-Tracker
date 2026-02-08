'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Swords, Shield, Users, CheckCircle2, AlertCircle, Bug } from 'lucide-react';

const SQUAD_COLORS = [
  '#F87171', '#60A5FA', '#4ADE80', '#FACC15', 
  '#A78BFA', '#FB923C', '#2DD4BF', '#E879F9'
];

// Added UNRANKED at the start so index 0 = Unranked
const LEAGUE_TIERS = ['UNRANKED', 'IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER'];
const LEAGUE_DIVISIONS = ['IV', 'III', 'II', 'I'];

export default function PerformanceChart({ mmrData }: { mmrData: any[] }) {
  const [activeTab, setActiveTab] = useState<'valorant' | 'lol'>('valorant');
  const [isMounted, setIsMounted] = useState(false); // To fix hydration/width crash
  
  // Initialize Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
      setIsMounted(true);
      if (mmrData && mmrData.length > 0) {
          setSelectedIds(mmrData.slice(0, 8).map(p => p.riot_id || p.username));
      }
  }, [mmrData]);

  const togglePlayer = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) setSelectedIds(prev => prev.filter(pid => pid !== id));
    } else {
      if (selectedIds.length < 8) setSelectedIds(prev => [...prev, id]);
      else alert("Maximum 8 agents.");
    }
  };

  // ICONS
  const rankIconsMap = useMemo(() => {
    const icons: Record<number, string> = {};
    if (!mmrData) return icons;
    mmrData.forEach(player => {
      // Valo
      player.data?.forEach((m: any) => { if (m.currenttier && m.images?.small) icons[m.currenttier] = m.images.small; });
      // League
      player.league_data?.forEach((m: any) => {
          if (m.tier && m.rank_img) {
              const tIdx = LEAGUE_TIERS.indexOf(m.tier.toUpperCase());
              const rIdx = LEAGUE_DIVISIONS.indexOf(m.rank);
              const divOffset = rIdx > -1 ? rIdx : 0;
              const uid = (tIdx * 4) + divOffset;
              icons[uid] = m.rank_img;
          }
      });
    });
    return icons;
  }, [mmrData]);

  // CHART DATA
  const data = useMemo(() => {
    if (!mmrData || mmrData.length === 0) return [];
    const maxLength = 15;
    const chartData = [];

    for (let i = 0; i < maxLength; i++) {
      const point: any = { name: `Game ${i + 1}` };
      mmrData.forEach((player) => {
        const pid = player.riot_id || player.username;
        if (!selectedIds.includes(pid)) return;
        
        const history = activeTab === 'valorant' ? player.data : player.league_data;
        if (!history || history.length === 0) { point[pid] = null; return; }

        const idx = (Math.min(history.length, maxLength) - 1) - i;
        const game = idx >= 0 ? history[idx] : null;

        if (game) {
            if (activeTab === 'valorant') {
                if (game.currenttier > 2) {
                    point[pid] = (game.currenttier * 100) + game.ranking_in_tier;
                    point[`${pid}_rank`] = game.currenttierpatched;
                    point[`${pid}_rr`] = `${game.ranking_in_tier} RR`;
                } else point[pid] = null;
            } else {
                // LEAGUE
                const tIdx = LEAGUE_TIERS.indexOf(game.tier?.toUpperCase());
                // Handle Unranked safely
                if (tIdx === 0 || game.tier === "UNRANKED") {
                     point[pid] = 0; // Baseline for unranked
                     point[`${pid}_rank`] = "UNRANKED";
                     point[`${pid}_rr`] = "0 LP";
                } else if (tIdx > 0) {
                    const rIdx = LEAGUE_DIVISIONS.indexOf(game.rank);
                    const divOffset = rIdx > -1 ? rIdx : 0;
                    point[pid] = ((tIdx * 4) + divOffset) * 100 + (game.lp || 0);
                    point[`${pid}_rank`] = `${game.tier} ${game.rank}`;
                    point[`${pid}_rr`] = `${game.lp} LP`;
                } else point[pid] = null;
            }
        } else point[pid] = null;
      });
      chartData.push(point);
    }
    return chartData;
  }, [mmrData, selectedIds, activeTab]);

  const CustomYAxisTick = ({ x, y, payload }: any) => {
    const iconUrl = rankIconsMap[Math.floor(payload.value / 100)];
    if (!iconUrl) return null;
    return <image href={iconUrl} x={x - 35} y={y - 15} height="30" width="30" preserveAspectRatio="xMidYMid meet" />;
  };

  const isCurrentTabEmpty = useMemo(() => {
      return !mmrData.some(p => {
          const pid = p.riot_id || p.username;
          if (!selectedIds.includes(pid)) return false;
          const h = activeTab === 'valorant' ? p.data : p.league_data;
          return h && h.length > 0;
      });
  }, [mmrData, selectedIds, activeTab]);

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm shadow-xl flex flex-col gap-6">
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase">
            {activeTab === 'valorant' ? <Swords size={20} className="text-indigo-500"/> : <Shield size={20} className="text-yellow-500"/>}
            Squad Performance
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{activeTab === 'valorant' ? 'Competitive RR History' : 'Ranked LP History'}</p>
        </div>
        <div className="flex bg-slate-950/80 p-1 rounded-xl border border-white/5">
          <button onClick={() => setActiveTab('valorant')} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'valorant' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}>VALORANT</button>
          <button onClick={() => setActiveTab('lol')} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'lol' ? 'bg-yellow-600 text-black' : 'text-slate-500 hover:text-white'}`}>LEAGUE</button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* GRAPH */}
        <div className="flex-1 h-[350px] w-full min-w-0 bg-black/20 rounded-xl relative overflow-hidden" style={{ minHeight: '350px' }}>
            
            {/* Visual Debugger */}
            {isCurrentTabEmpty && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-50 text-center p-4">
                    <p className="font-bold text-red-400 mb-2">NO RANKED DATA</p>
                    <p className="text-xs text-slate-500">Try playing some Ranked Solo/Duo games.</p>
                </div>
            )}

            {/* Wait for mount to avoid width(-1) crash */}
            {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="0" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" hide />
                    <YAxis stroke="#475569" tick={<CustomYAxisTick />} domain={['auto', 'auto']} width={50} tickLine={false} axisLine={false} interval={0} allowDecimals={false}/>
                    <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff', zIndex: 100 }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    labelStyle={{ display: 'none' }}
                    formatter={(val, name, props) => [`${props.payload[`${name}_rank`]} (${props.payload[`${name}_rr`]})`, name]}
                    />
                    {mmrData.map((player, i) => {
                    const pid = player.riot_id || player.username;
                    if (!selectedIds.includes(pid)) return null;
                    return <Line key={pid} type="monotone" dataKey={pid} stroke={SQUAD_COLORS[i % SQUAD_COLORS.length]} strokeWidth={3} dot={false} connectNulls={true} activeDot={{ r: 6 }} />;
                    })}
                </LineChart>
                </ResponsiveContainer>
            )}
        </div>

        {/* SIDEBAR */}
        <div className="w-full lg:w-56 bg-slate-950/60 rounded-2xl p-4 border border-white/5 flex flex-col shrink-0">
            <h3 className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-2 mb-4"><Users size={12}/> Focus</h3>
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px] scrollbar-hide">
              {mmrData.map((player, i) => {
                const pid = player.riot_id || player.username;
                const hasData = activeTab === 'valorant' ? player.data?.length > 0 : player.league_data?.length > 0;
                return (
                  <button key={pid} onClick={() => togglePlayer(pid)} className={`flex items-center justify-between p-2.5 rounded-xl border transition-all text-left ${selectedIds.includes(pid) ? 'bg-slate-800/80 border-slate-700' : 'border-transparent opacity-60'}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SQUAD_COLORS[i % SQUAD_COLORS.length] }} />
                        <span className="text-xs font-bold truncate max-w-[100px]">{player.username}</span>
                    </div>
                    {selectedIds.includes(pid) ? <CheckCircle2 size={14} className="text-green-500"/> : !hasData && <AlertCircle size={14} className="text-red-900 opacity-50"/>}
                  </button>
                );
              })}
            </div>
        </div>
      </div>
    </div>
  );
}