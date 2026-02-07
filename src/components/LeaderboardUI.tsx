"use client";

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link'; 
import { 
  Trophy, Swords, Shield, Crosshair, ChevronDown, ChevronUp, Skull, Activity, Star
} from 'lucide-react';

export default function LeaderboardUI({ squadName, players }: { squadName: string, players: any[] }) {
  const [activeTab, setActiveTab] = useState<'valorant' | 'lol'>('valorant');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedUser(expandedUser === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      <Sidebar />
      
      <main className="md:ml-20 lg:ml-64 min-h-screen pb-20 overflow-x-hidden relative">
        
        {/* --- HEADER --- */}
        <div className="relative h-64 bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 flex flex-col items-center justify-center overflow-hidden border-b border-white/5">
            <div className="absolute inset-0 bg-[url('https://cdn.pixabay.com/photo/2017/08/30/01/05/milky-way-2695569_1280.jpg')] bg-cover bg-center opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
            
            <div className="z-10 text-center animate-in slide-in-from-top-4 duration-700">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <Trophy size={24} className="text-yellow-500 fill-yellow-500"/> 
                    </div>
                    <span className="text-yellow-500 font-bold tracking-widest text-sm uppercase">Squad Ranking</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase drop-shadow-2xl">
                    {squadName}
                </h1>
            </div>

            <div className="absolute -bottom-6 z-20 flex bg-slate-950/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-2xl">
                <button 
                    onClick={() => setActiveTab('valorant')}
                    className={`px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all duration-300 ${activeTab === 'valorant' ? 'bg-[#FF4655] text-white shadow-lg shadow-red-500/20' : 'text-slate-400 hover:text-white'}`}
                >
                    <Swords size={16}/> VALORANT
                </button>
                <button 
                    onClick={() => setActiveTab('lol')}
                    className={`px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all duration-300 ${activeTab === 'lol' ? 'bg-[#C8AA6E] text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    <Shield size={16}/> LEAGUE
                </button>
            </div>
        </div>

        <div className="p-6 lg:p-12 max-w-5xl mx-auto mt-12 relative z-20">
            
            {activeTab === 'lol' ? (
                <div className="bg-slate-900/30 border border-slate-800 border-dashed rounded-3xl p-20 text-center">
                    <Shield size={64} className="mx-auto mb-6 text-slate-700"/>
                    <h2 className="text-2xl font-bold text-white mb-2">Summoner's Rift Offline</h2>
                    <span className="inline-block bg-[#C8AA6E]/10 text-[#C8AA6E] border border-[#C8AA6E]/20 px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                        Coming Soon
                    </span>
                </div>
            ) : players.length === 0 ? (
                <div className="text-center py-20 text-slate-500">No active agents found in this squad.</div>
            ) : (
                <div className="space-y-6">
                    {/* --- LISTE DES JOUEURS --- */}
                    {players.map((player, index) => (
                        <LeaderboardCard 
                            key={player.id} 
                            player={player} 
                            rank={index + 1} 
                            isExpanded={expandedUser === player.id} 
                            onToggle={() => toggleExpand(player.id)}
                        />
                    ))}
                </div>
            )}
        </div>
      </main>
    </div>
  );
}

// --- COMPOSANT CARTE INDIVIDUELLE (AVEC LOGIQUE DE CALCUL) ---
function LeaderboardCard({ player, rank, isExpanded, onToggle }: any) {
    
    // 1. CALCUL DES STATS (Identique à ValorantCard)
    const calculateStats = () => {
        const data = player.fullStats;
        if (!data || !data.matches || data.matches.length === 0) return null;

        let totalKills = 0, totalDeaths = 0, totalWins = 0, totalShots = 0, totalHeadshots = 0, totalScore = 0;
        const lastGames: string[] = [];
        const agentsPlayed: Record<string, { count: number, img: string }> = {};
        
        // Nettoyage du Riot ID pour comparaison
        const [myName] = player.riot_id?.split('#') || ["", ""];

        data.matches.forEach((match: any) => {
            const p = match.players.all_players.find((pl: any) => pl.name.toLowerCase() === myName.toLowerCase());
            if (p) {
                totalKills += p.stats.kills;
                totalDeaths += p.stats.deaths;
                totalScore += p.stats.score;
                const shots = p.stats.headshots + p.stats.bodyshots + p.stats.legshots;
                totalShots += shots;
                totalHeadshots += p.stats.headshots;

                const myTeam = p.team.toLowerCase();
                const hasWon = match.teams[myTeam].has_won;
                if (hasWon) totalWins++;
                lastGames.push(hasWon ? 'W' : 'L');

                if (p.assets.agent.small) {
                    const img = p.assets.agent.small;
                    if (!agentsPlayed[img]) agentsPlayed[img] = { count: 0, img };
                    agentsPlayed[img].count++;
                }
            }
        });

        const matchesCount = data.matches.length;
        const sortedAgents = Object.values(agentsPlayed).sort((a, b) => b.count - a.count);

        return {
            kd: (totalDeaths > 0 ? (totalKills / totalDeaths) : totalKills).toFixed(2),
            winRate: ((totalWins / matchesCount) * 100).toFixed(0),
            hs: (totalShots > 0 ? ((totalHeadshots / totalShots) * 100) : 0).toFixed(1),
            avgScore: (totalScore / matchesCount).toFixed(0),
            lastGames,
            mainAgentImg: sortedAgents.length > 0 ? sortedAgents[0].img : null,
            rankImg: data.mmr_history?.[0]?.images?.small,
            peakRank: data.mmr_life?.highest_rank?.patched_tier || "Unknown",
            peakSeason: data.mmr_life?.highest_rank?.season || ""
        };
    };

    const stats = calculateStats();
    
    // Couleur du rang
    const rankColor = rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-slate-300' : rank === 3 ? 'text-amber-600' : 'text-slate-600';
    const borderColor = rank === 1 ? 'border-yellow-500/30' : 'border-slate-800';

    return (
        <div 
            onClick={onToggle}
            className={`
                relative bg-slate-900/60 backdrop-blur-md border ${borderColor} rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 group
                ${isExpanded ? 'bg-slate-900 ring-1 ring-indigo-500/50 shadow-2xl scale-[1.01]' : 'hover:bg-slate-900/80'}
            `}
        >
            {/* --- HEADER --- */}
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                
                <div className="flex items-center gap-6">
                    {/* RANG # */}
                    <div className={`text-4xl md:text-5xl font-black ${rankColor} w-12 text-center opacity-80`}>
                        #{rank}
                    </div>

                    {/* AVATAR + INFO */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-slate-700 overflow-hidden relative shadow-lg">
                            <img 
                                src={player.avatar_url || '/characters/default.png'} 
                                className="w-full h-full object-cover"
                                alt={player.username}
                            />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white group-hover:text-indigo-400 transition flex items-center gap-2">
                                {player.username}
                                {rank === 1 && <Trophy size={18} className="text-yellow-500 fill-yellow-500"/>}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-800 font-mono">
                                    {player.riot_id || 'NO ID'}
                                </span>
                                {stats?.peakRank && stats.peakRank !== "Unknown" && (
                                    <span className="text-[10px] text-yellow-500 flex items-center gap-1 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                                        <Star size={8} fill="currentColor"/> Peak: {stats.peakRank}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* STATS RAPIDES (Visible fermé) */}
                <div className="flex items-center justify-between md:justify-end gap-8 flex-1">
                    {stats ? (
                        <div className="flex gap-6 text-center">
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-bold">K/D</p>
                                <p className={`font-mono font-bold text-lg ${parseFloat(stats.kd) >= 1 ? 'text-green-400' : 'text-red-400'}`}>{stats.kd}</p>
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-[10px] text-slate-500 uppercase font-bold">Win %</p>
                                <p className="font-mono font-bold text-lg text-white">{stats.winRate}%</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-xs text-slate-600 italic">No Match Data</div>
                    )}

                    {/* RANG OFFICIEL */}
                    <div className="flex items-center gap-4 text-right">
                        <div>
                            <p className={`text-xl font-black uppercase ${
                                player.valo_rank.includes('Radiant') ? 'text-yellow-400 drop-shadow-md' : 
                                player.valo_rank.includes('Immortal') ? 'text-[#FF4655]' : 'text-white'
                            }`}>
                                {player.valo_rank}
                            </p>
                            <p className="text-sm font-bold text-indigo-400">{player.valo_rr} RR</p>
                        </div>
                        {stats?.rankImg && <img src={stats.rankImg} className="w-10 h-10"/>}
                        
                        <div className={`p-2 rounded-full transition ${isExpanded ? 'bg-indigo-500 text-white rotate-180' : 'bg-slate-800 text-slate-500'}`}>
                            <ChevronDown size={20}/>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- IMAGE 3D DE FOND --- */}
            <div className="absolute -right-6 -bottom-6 h-[160%] w-72 hidden lg:block opacity-10 group-hover:opacity-30 transition-opacity pointer-events-none mix-blend-overlay">
                <img 
                    src={`/characters/${player.username}.png`}
                    className="w-full h-full object-contain"
                    onError={(e) => e.currentTarget.style.display = 'none'}
                />
            </div>

            {/* --- DETAILS (EXPANDED) --- */}
            {isExpanded && stats && (
                <div className="border-t border-white/5 bg-black/30 p-6 md:p-8 animate-in slide-in-from-top-2 relative z-20">
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <StatBox label="Headshot %" value={`${stats.hs}%`} color="text-yellow-400" icon={<Skull size={16}/>} />
                        <StatBox label="Avg Score" value={stats.avgScore} color="text-white" icon={<Activity size={16}/>} />
                        <StatBox label="Peak Season" value={stats.peakSeason.toUpperCase()} color="text-slate-400" icon={<Trophy size={16}/>} />
                        <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 flex flex-col justify-center items-center">
                            <span className="text-[10px] text-slate-500 uppercase font-bold mb-1">Recent Form</span>
                            <div className="flex gap-1">
                                {stats.lastGames.slice(0, 5).map((res, i) => (
                                    <div key={i} className={`w-2 h-8 rounded-full ${res === 'W' ? 'bg-green-500' : 'bg-red-500/50'}`}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end">
                        <Link href={`/profile/${player.username}`}>
                            <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                                View Full Analysis
                            </button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- PETIT COMPOSANT HELPER ---
function StatBox({ label, value, color, icon }: any) {
    return (
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 flex flex-col gap-1 shadow-inner">
            <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-2 mb-1">
                {icon} {label}
            </div>
            <div className={`text-xl md:text-2xl font-black font-mono tracking-tight ${color}`}>
                {value}
            </div>
        </div>
    );
}