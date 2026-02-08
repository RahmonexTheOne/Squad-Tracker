"use client";

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link'; 
import { 
  Trophy, Swords, Shield, Crosshair, Skull, Activity, Star, Coins
} from 'lucide-react';

export default function LeaderboardUI({ squadName, players }: { squadName: string, players: any[] }) {
  const [activeTab, setActiveTab] = useState<'valorant' | 'lol'>('valorant');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedUser(expandedUser === id ? null : id);
  };

  // --- 1. LOGIQUE DE TRI INTELLIGENTE ---
  const sortedPlayers = [...players].sort((a, b) => {
      if (activeTab === 'valorant') {
          const getValoWeight = (rank: string) => {
              if (!rank) return 0;
              const tiers = [
                  'Unrated', 'Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant'
              ];
              const baseRank = rank.split(' ')[0]; 
              const index = tiers.indexOf(baseRank);
              return index === -1 ? 0 : index * 1000;
          };

          const scoreA = getValoWeight(a.valo_rank) + (a.valo_rr || 0);
          const scoreB = getValoWeight(b.valo_rank) + (b.valo_rr || 0);
          
          return scoreB - scoreA; 
      } else {
          const getLolWeight = (tier: string) => {
              if (!tier) return 0;
              const tiers = ['UNRANKED', 'IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER'];
              return tiers.indexOf(tier.toUpperCase()) * 1000;
          }
          
          const rankA = a.league_stats?.rank ? getLolWeight(a.league_stats.rank.tier) + a.league_stats.rank.lp : 0;
          const rankB = b.league_stats?.rank ? getLolWeight(b.league_stats.rank.tier) + b.league_stats.rank.lp : 0;
          
          return rankB - rankA;
      }
  });

  const activePlayers = sortedPlayers; 

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      <Sidebar />
      
      <main className="md:ml-20 lg:ml-64 min-h-screen pb-20 overflow-x-hidden relative">
        
        {/* --- HEADER HERO --- */}
        <div className="relative h-96 bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 flex flex-col items-center justify-center overflow-visible border-b border-white/5 shadow-2xl z-10">
            <div className="absolute inset-0 bg-[url('https://cdn.pixabay.com/photo/2017/08/30/01/05/milky-way-2695569_1280.jpg')] bg-cover bg-center opacity-20 mask-image-gradient"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
            
            <div className="z-10 text-center animate-in slide-in-from-top-4 duration-700">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20 backdrop-blur-md shadow-lg shadow-yellow-500/10">
                        <Trophy size={28} className="text-yellow-500 fill-yellow-500"/> 
                    </div>
                    <span className="text-yellow-500 font-black tracking-[0.2em] text-sm uppercase bg-yellow-500/5 px-3 py-1 rounded-full border border-yellow-500/10">
                        OFFICIAL RANKING
                    </span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    {squadName}
                </h1>
            </div>

            <div className="absolute -bottom-7 z-20 flex bg-slate-950/90 backdrop-blur-xl p-2 rounded-full border border-slate-800 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]">
                <button 
                    onClick={() => setActiveTab('valorant')}
                    className={`px-8 py-3 rounded-full font-black text-sm flex items-center gap-3 transition-all duration-300 ${activeTab === 'valorant' ? 'bg-[#FF4655] text-white shadow-lg shadow-[#FF4655]/30 scale-105' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                    <Swords size={18}/> VALORANT
                </button>
                <button 
                    onClick={() => setActiveTab('lol')}
                    className={`px-8 py-3 rounded-full font-black text-sm flex items-center gap-3 transition-all duration-300 ${activeTab === 'lol' ? 'bg-[#C8AA6E] text-black shadow-lg scale-105' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                    <Shield size={18}/> LEAGUE
                </button>
            </div>
        </div>

        <div className="p-6 lg:p-12 max-w-6xl mx-auto mt-16 relative z-0">
             <div className="space-y-8">
                {activePlayers.length === 0 ? (
                     <div className="text-center py-32 text-slate-500 border border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
                        {activeTab === 'valorant' ? <Swords size={48} className="mx-auto mb-4 opacity-50"/> : <Shield size={48} className="mx-auto mb-4 opacity-50"/>}
                        No active agents found.
                     </div>
                ) : (
                    activePlayers.map((player, index) => (
                        activeTab === 'valorant' ? (
                            <ValorantRow 
                                key={player.id} 
                                player={player} 
                                rank={index + 1} 
                                isExpanded={expandedUser === player.id} 
                                onToggle={() => toggleExpand(player.id)}
                            />
                        ) : (
                            <LeagueRow 
                                key={player.id} 
                                player={player} 
                                rank={index + 1} 
                                isExpanded={expandedUser === player.id} 
                                onToggle={() => toggleExpand(player.id)}
                            />
                        )
                    ))
                )}
            </div>
        </div>
      </main>
    </div>
  );
}

// ==========================================
// 🔴 COMPOSANT VALORANT (Fix Crash: Check if match.players exists)
// ==========================================
function ValorantRow({ player, rank, isExpanded, onToggle }: any) {
    
    const calculateStats = () => {
        const data = player.fullStats;
        if (!data || !data.matches || data.matches.length === 0) return null;

        let totalKills = 0, totalDeaths = 0, totalWins = 0, totalScore = 0;
        let totalShots = 0, totalHeadshots = 0;
        const lastGames: string[] = [];
        const agentsPlayed: Record<string, { count: number, img: string }> = {};
        
        const riotIdString = player.riot_id || player.username || "";
        const [myName] = riotIdString.split('#');

        data.matches.forEach((match: any) => {
            // 🛡️ SAFETY CHECK HERE
            if (!match || !match.players || !match.players.all_players) return;

            const p = match.players.all_players.find((pl: any) => 
                pl.name && pl.name.toLowerCase() === myName.toLowerCase()
            );

            if (p) {
                totalKills += p.stats.kills;
                totalDeaths += p.stats.deaths;
                totalScore += p.stats.score;
                const shots = p.stats.headshots + p.stats.bodyshots + p.stats.legshots;
                totalShots += shots;
                totalHeadshots += p.stats.headshots;

                const myTeam = p.team ? p.team.toLowerCase() : 'blue';
                let hasWon = false;

                if (match.metadata.mode === 'Deathmatch') {
                    hasWon = p.stats.rank === 1; 
                } else if (match.teams && match.teams[myTeam]) {
                    hasWon = match.teams[myTeam].has_won;
                }
                
                if (hasWon) totalWins++;
                lastGames.push(hasWon ? 'W' : 'L');

                if (p.assets.agent.small) {
                    const img = p.assets.agent.small;
                    if (!agentsPlayed[img]) agentsPlayed[img] = { count: 0, img };
                    agentsPlayed[img].count++;
                }
            }
        });

        if (lastGames.length === 0) return null;

        const matchesCount = lastGames.length;
        const sortedAgents = Object.values(agentsPlayed).sort((a, b) => b.count - a.count);

        return {
            kd: (totalDeaths > 0 ? (totalKills / totalDeaths) : totalKills).toFixed(2),
            winRate: Math.round((totalWins / matchesCount) * 100),
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
    
    const rankColor = rank === 1 ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 
                      rank === 2 ? 'text-slate-300 drop-shadow-[0_0_10px_rgba(203,213,225,0.5)]' : 
                      rank === 3 ? 'text-amber-600 drop-shadow-[0_0_10px_rgba(217,119,6,0.5)]' : 'text-slate-600';
    
    const characterImage = `/characters/${player.username}.png`; 

    return (
        <div onClick={onToggle} className={`group relative transition-all duration-300 ease-in-out cursor-pointer mb-6 ${isExpanded ? 'z-30 scale-[1.01]' : 'hover:scale-[1.01] z-10'}`}>
            <div className={`relative bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden ${rank === 1 ? 'border-yellow-500/30 bg-gradient-to-r from-yellow-900/10 to-slate-900' : ''} ${isExpanded ? 'ring-1 ring-indigo-500/50' : ''}`}>
                
                <div className={`relative z-20 transition-all duration-500 ${isExpanded ? 'lg:pr-32' : 'pr-0'}`}>
                    <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-8">
                            <div className={`text-6xl font-black ${rankColor} w-16 text-center italic`}>#{rank}</div>
                            <div className="flex items-center gap-5">
                                <div className="w-20 h-20 rounded-2xl bg-slate-950 border-2 border-slate-700 overflow-hidden relative shadow-lg group-hover:border-indigo-500 transition-colors">
                                    <img src={player.avatar_url || '/characters/default.png'} className="w-full h-full object-cover" alt={player.username}/>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                        {player.username}
                                        {rank === 1 && <Trophy size={24} className="text-yellow-500 fill-yellow-500 animate-bounce"/>}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-xs bg-black/40 text-slate-400 px-3 py-1 rounded-md border border-slate-800 font-mono tracking-wider">{player.riot_id || 'NO ID'}</span>
                                        {(stats?.peakRank || player.peak_rank) && (
                                            <span className="text-[10px] text-yellow-500 font-bold flex items-center gap-1 bg-yellow-500/5 px-2 py-1 rounded border border-yellow-500/20">
                                                <Star size={10} fill="currentColor"/> PEAK: {(stats?.peakRank || player.peak_rank || "Unknown").toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-8 relative z-30">
                            <div className="text-right hidden md:block">
                                <p className={`text-2xl font-black uppercase italic ${player.valo_rank?.includes('Radiant') ? 'text-yellow-400 drop-shadow-md' : player.valo_rank?.includes('Immortal') ? 'text-[#FF4655]' : 'text-white'}`}>
                                    {player.valo_rank || "Unranked"}
                                </p>
                                <p className="text-sm font-bold text-indigo-400">{player.valo_rr} RR</p>
                            </div>
                            {(player.rank_img || stats?.rankImg) && (
                                <img src={player.rank_img || stats?.rankImg} className="w-14 h-14 drop-shadow-lg"/>
                            )}
                        </div>
                    </div>

                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[600px] opacity-100 p-6 md:p-8 pt-0' : 'max-h-0 opacity-0 p-0'}`}>
                        {stats ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 relative z-20 border-t border-white/5 pt-6">
                                <StatBox label="K/D Ratio" value={stats.kd} color={parseFloat(stats.kd) >= 1 ? "text-green-400" : "text-red-400"} icon={<Crosshair size={18}/>} />
                                <StatBox label="Headshot %" value={`${stats.hs}%`} color="text-yellow-400" icon={<Skull size={18}/>} />
                                <StatBox label="Avg Score" value={stats.avgScore} color="text-white" icon={<Activity size={18}/>} />
                                <div className="col-span-2 md:col-span-3 bg-slate-900/60 p-4 rounded-2xl border border-white/5 flex flex-col justify-center items-center shadow-inner mt-2">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold mb-2">Recent Form</span>
                                    <div className="flex gap-1.5">
                                        {stats.lastGames.slice(0, 5).map((res: string, i: number) => (
                                            <div key={i} className={`w-2 h-8 rounded-full ${res === 'W' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500/30'}`}></div>
                                        ))}
                                    </div>
                                </div>
                                <div className="col-span-2 md:col-span-3 flex justify-start mt-4">
                                    <Link href={`/profile/${player.username}`}>
                                        <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40">
                                            View Full Profile
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-slate-500 py-4 border-t border-white/5 pt-6">
                                No match data available. <br/> <span className="text-xs opacity-50">(API Limit or No Games Played)</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className={`absolute right-[-20px] bottom-[-20px] h-[120%] w-auto z-10 pointer-events-none transition-all duration-500 ease-out ${isExpanded ? 'opacity-0 translate-x-20' : 'opacity-30 md:opacity-100 translate-x-0'} hidden md:block`}>
                    <img src={characterImage} className="h-full w-auto object-cover" onError={(e) => e.currentTarget.style.display = 'none'} alt=""/>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                </div>
            </div>
            
            <div className={`absolute -right-20 md:-right-24 bottom-0 z-40 pointer-events-none transition-all duration-500 ease-out ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0'} hidden lg:block`}>
                <img src={characterImage} className="h-72 w-auto object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]" onError={(e) => e.currentTarget.style.display = 'none'} alt=""/>
            </div>
        </div>
    );
}

// ==========================================
// 🟡 COMPOSANT LEAGUE (ROBUSTE)
// ==========================================
function LeagueRow({ player, rank, isExpanded, onToggle }: any) {
    
    // LOGIQUE DE CALCUL ROBUSTE
    const calculateLeagueStats = () => {
        // On cherche league_stats (si injecté)
        const data = player.league_stats;
        
        // Données par défaut si non trouvé
        if (!data || !data.matches || data.matches.length === 0) {
            return {
                kd: "0.00",
                winRate: 0,
                cs: "0",
                lastGames: [],
                rankImg: "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/unranked.png",
                rankTier: "UNRANKED",
                lp: 0,
                mainChampImg: null,
                matchesCount: 0
            };
        }

        let totalKills = 0, totalDeaths = 0, totalAssists = 0, totalWins = 0, totalCS = 0;
        const lastGames: string[] = [];
        const championsPlayed: Record<string, { count: number, img: string }> = {};

        data.matches.forEach((match: any) => {
            // Safety check for League matches too
            if (!match || !match.info || !match.info.participants) return;

            const participant = match.info.participants.find((p: any) => p.puuid === data.puuid);
            
            if (participant) {
                totalKills += participant.kills;
                totalDeaths += participant.deaths;
                totalAssists += participant.assists;
                totalCS += (participant.totalMinionsKilled + participant.neutralMinionsKilled);
                
                if (participant.win) totalWins++;
                lastGames.push(participant.win ? 'W' : 'L');

                const champImg = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${participant.championId}.png`;
                if (!championsPlayed[participant.championId]) championsPlayed[participant.championId] = { count: 0, img: champImg };
                championsPlayed[participant.championId].count++;
            }
        });

        const matchesCount = lastGames.length || 1;
        const sortedChamps = Object.values(championsPlayed).sort((a, b) => b.count - a.count);

        return {
            kd: (totalDeaths > 0 ? ((totalKills + totalAssists) / totalDeaths) : (totalKills + totalAssists)).toFixed(2),
            winRate: Math.round((totalWins / matchesCount) * 100),
            cs: (totalCS / matchesCount).toFixed(0),
            lastGames,
            rankImg: data.rank?.rankImg || "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/unranked.png",
            rankTier: data.rank && data.rank.tier !== "UNRANKED" ? `${data.rank.tier} ${data.rank.rank}` : "UNRANKED",
            lp: data.rank ? data.rank.lp : 0,
            mainChampImg: sortedChamps.length > 0 ? sortedChamps[0].img : null,
            matchesCount
        };
    };

    const stats = calculateLeagueStats();
    
    // Couleurs Dorées pour League
    const rankColor = rank === 1 ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 
                      rank === 2 ? 'text-slate-300 drop-shadow-[0_0_10px_rgba(203,213,225,0.5)]' : 
                      rank === 3 ? 'text-amber-600 drop-shadow-[0_0_10px_rgba(217,119,6,0.5)]' : 'text-slate-600';
    
    const characterImage = `/characters/${player.username}.png`; 

    return (
        <div onClick={onToggle} className={`group relative transition-all duration-300 ease-in-out cursor-pointer mb-6 ${isExpanded ? 'z-30 scale-[1.01]' : 'hover:scale-[1.01] z-10'}`}>
            <div className={`relative bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden ${rank === 1 ? 'border-yellow-500/30 bg-gradient-to-r from-yellow-900/10 to-slate-900' : ''} ${isExpanded ? 'ring-1 ring-yellow-600/50' : ''}`}>
                
                <div className={`relative z-20 transition-all duration-500 ${isExpanded ? 'lg:pr-32' : 'pr-0'}`}>
                    <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-8">
                            <div className={`text-6xl font-black ${rankColor} w-16 text-center italic`}>#{rank}</div>
                            <div className="flex items-center gap-5">
                                <div className="w-20 h-20 rounded-2xl bg-slate-950 border-2 border-slate-700 overflow-hidden relative shadow-lg group-hover:border-yellow-600 transition-colors">
                                    <img src={player.avatar_url || '/characters/default.png'} className="w-full h-full object-cover" alt={player.username}/>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                        {player.username}
                                        {rank === 1 && <Trophy size={24} className="text-yellow-500 fill-yellow-500 animate-bounce"/>}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-xs bg-black/40 text-slate-400 px-3 py-1 rounded-md border border-slate-800 font-mono tracking-wider">{player.riot_id || 'NO ID'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-8 relative z-30">
                            <div className="text-right hidden md:block">
                                <p className={`text-2xl font-black uppercase italic ${stats.rankTier?.includes('CHALLENGER') ? 'text-yellow-400 drop-shadow-md' : 'text-white'}`}>
                                    {stats.rankTier}
                                </p>
                                <p className="text-sm font-bold text-yellow-500">{stats.lp} LP</p>
                            </div>
                            <img src={stats.rankImg} className="w-14 h-14 drop-shadow-lg" onError={(e) => e.currentTarget.style.display = 'none'}/>
                        </div>
                    </div>

                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[600px] opacity-100 p-6 md:p-8 pt-0' : 'max-h-0 opacity-0 p-0'}`}>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 relative z-20 border-t border-white/5 pt-6">
                            <StatBox label="KDA Ratio" value={stats.kd} color={parseFloat(stats.kd) >= 3 ? "text-green-400" : "text-slate-300"} icon={<Crosshair size={18}/>} />
                            <StatBox label="Win Rate" value={`${stats.winRate}%`} color={stats.winRate >= 50 ? "text-blue-400" : "text-slate-400"} icon={<Trophy size={18}/>} />
                            <StatBox label="Avg CS" value={stats.cs} color="text-yellow-400" icon={<Coins size={18}/>} />
                            
                            <div className="col-span-2 md:col-span-3 bg-slate-900/60 p-4 rounded-2xl border border-white/5 flex flex-col justify-center items-center shadow-inner mt-2">
                                <div className="flex items-center gap-2 mb-2">
                                    {stats.mainChampImg && <img src={stats.mainChampImg} className="w-5 h-5 rounded-full border border-slate-600"/>}
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Recent Form</span>
                                </div>
                                <div className="flex gap-1.5">
                                    {stats.lastGames.length > 0 ? stats.lastGames.slice(0, 10).map((res: string, i: number) => (
                                        <div key={i} className={`w-2 h-8 rounded-full ${res === 'W' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-red-500/30'}`}></div>
                                    )) : (
                                        <span className="text-xs text-slate-500 italic">No matches recorded</span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="col-span-2 md:col-span-3 flex justify-start mt-4">
                                <Link href={`/profile/${player.username}`}>
                                    <button className="px-8 py-3 bg-yellow-700 hover:bg-yellow-600 text-white font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-yellow-900/20">
                                        View Full Profile
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`absolute right-[-20px] bottom-[-20px] h-[120%] w-auto z-10 pointer-events-none transition-all duration-500 ease-out ${isExpanded ? 'opacity-0 translate-x-20' : 'opacity-30 md:opacity-100 translate-x-0'} hidden md:block`}>
                    <img src={characterImage} className="h-full w-auto object-cover" onError={(e) => e.currentTarget.style.display = 'none'} alt=""/>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                </div>
            </div>
            
            <div className={`absolute -right-20 md:-right-24 bottom-0 z-40 pointer-events-none transition-all duration-500 ease-out ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0'} hidden lg:block`}>
                <img src={characterImage} className="h-72 w-auto object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]" onError={(e) => e.currentTarget.style.display = 'none'} alt=""/>
            </div>
        </div>
    );
}

function StatBox({ label, value, color, icon }: any) {
    return (
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-white/5 flex flex-col gap-1 shadow-inner hover:bg-slate-900/80 transition">
            <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-2 mb-1">
                {icon} {label}
            </div>
            <div className={`text-3xl font-black font-mono tracking-tight ${color}`}>
                {value}
            </div>
        </div>
    );
}