'use client';

import { useState, useMemo } from 'react';
import { Shield, Trophy, Activity, ChevronDown, ChevronUp, Swords, Clock, Coins, Eye, Crosshair } from 'lucide-react';

export default function LeagueCard({ data }: { data: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
    if (!data || !data.account) return null;

    // 1. RANK INFO & IMAGES FIX
    // URL fonctionnelle pour l'emblème Unranked
    const unrankedImg = "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/unranked.png";
    
    const rankInfo = data.rank && data.rank.tier !== "UNRANKED" ? {
        tier: data.rank.tier,
        rank: data.rank.rank,
        lp: data.rank.lp,
        // URL CDN standard pour les emblèmes classés
        rankImg: `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${data.rank.tier.toLowerCase()}.png`
    } : {
        tier: "UNRANKED",
        rank: "",
        lp: 0,
        rankImg: unrankedImg
    };

    // 2. MATCH HISTORY STATS (Sur 10 matchs maintenant)
    let totalKills = 0, totalDeaths = 0, totalAssists = 0, totalWins = 0, totalCS = 0, totalDurationMinutes = 0;
    const matchesCount = data.matches ? data.matches.length : 0;
    const lastGames: string[] = [];
    const championsPlayed: Record<string, { count: number, img: string }> = {};

    if (data.matches && data.matches.length > 0) {
        data.matches.forEach((match: any) => {
            const participant = match.info.participants.find((p: any) => p.puuid === data.puuid);

            if (participant) {
                totalKills += participant.kills;
                totalDeaths += participant.deaths;
                totalAssists += participant.assists;
                totalCS += (participant.totalMinionsKilled + participant.neutralMinionsKilled);
                totalDurationMinutes += (match.info.gameDuration / 60);
                
                if (participant.win) totalWins++;
                lastGames.push(participant.win ? 'W' : 'L');

                // Main Champion logic
                const champImg = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${participant.championId}.png`;
                if (!championsPlayed[participant.championId]) championsPlayed[participant.championId] = { count: 0, img: champImg };
                championsPlayed[participant.championId].count++;
            }
        });
    }

    // Averages
    const avgKills = matchesCount > 0 ? (totalKills / matchesCount).toFixed(1) : 0;
    const avgDeaths = matchesCount > 0 ? (totalDeaths / matchesCount).toFixed(1) : 0;
    const avgAssists = matchesCount > 0 ? (totalAssists / matchesCount).toFixed(1) : 0;
    const kdaRatio = totalDeaths > 0 ? ((totalKills + totalAssists) / totalDeaths).toFixed(2) : (totalKills + totalAssists).toFixed(2);
    const winRate = matchesCount > 0 ? Math.round((totalWins / matchesCount) * 100) : 0;
    const avgCS = matchesCount > 0 ? (totalCS / matchesCount).toFixed(0) : 0;
    const avgCSPerMin = totalDurationMinutes > 0 ? (totalCS / totalDurationMinutes).toFixed(1) : 0;

    // Main Champion
    const sortedChamps = Object.values(championsPlayed).sort((a, b) => b.count - a.count);
    const mainChampImg = sortedChamps.length > 0 ? sortedChamps[0].img : null;

    return {
        ...rankInfo,
        level: data.account.level,
        iconUrl: data.account.iconUrl,
        kda: `${avgKills} / ${avgDeaths} / ${avgAssists}`,
        kdaRatio,
        winRate,
        avgCS,
        avgCSPerMin,
        matchesCount,
        lastGames,
        mainChampImg
    };
  }, [data]);

  if (!stats) {
    return (
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-6 flex items-center justify-center min-h-[200px]">
            <div className="text-center opacity-50">
                <Shield size={32} className="mx-auto mb-2"/>
                <p>No League data found.</p>
            </div>
        </div>
    );
  }

  // --- RENDER SINGLE MATCH ---
  const renderMatchDetail = (match: any) => {
      const participant = match.info.participants.find((p: any) => p.puuid === data.puuid);
      if (!participant) return null;

      const isWin = participant.win;
      const championName = participant.championName;
      const championIcon = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${participant.championId}.png`;
      
      const kda = `${participant.kills} / ${participant.deaths} / ${participant.assists}`;
      const cs = participant.totalMinionsKilled + participant.neutralMinionsKilled;
      const durationMinutes = match.info.gameDuration / 60;
      const csPerMin = (cs / durationMinutes).toFixed(1);
      
      // Formatage de la durée (ex: 24m 30s)
      const durationFormatted = `${Math.floor(durationMinutes)}m ${Math.round((durationMinutes % 1) * 60)}s`;
      const gameMode = match.info.gameMode.replace('_', ' '); // ex: CLASSIC, ARAM

      return (
        <div key={match.metadata.matchId} className="mb-3">
            <div 
                onClick={() => setExpandedMatchId(expandedMatchId === match.metadata.matchId ? null : match.metadata.matchId)}
                className={`
                    cursor-pointer rounded-xl p-3 border transition-all duration-300 relative overflow-hidden flex items-center justify-between
                    ${isWin ? 'bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/10' : 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10'}
                `}
            >
                <div className="flex items-center gap-3">
                    <img src={championIcon} className="w-10 h-10 rounded-full border border-white/10" alt={championName} onError={(e) => e.currentTarget.style.opacity = '0.5'}/>
                    <div>
                        <p className={`font-bold text-sm ${isWin ? 'text-blue-400' : 'text-red-400'}`}>
                            {isWin ? 'VICTORY' : 'DEFEAT'} <span className="text-slate-500 text-xs ml-2 uppercase">{gameMode}</span>
                        </p>
                        <p className="text-xs text-slate-400 font-bold flex items-center gap-1">
                            {championName} • <Clock size={10}/> {durationFormatted}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="font-mono font-bold text-slate-200">{kda}</p>
                        <p className="text-[10px] text-slate-500 font-bold">{cs} CS ({csPerMin}/m)</p>
                    </div>
                    {expandedMatchId === match.metadata.matchId ? <ChevronUp size={16} className="text-slate-500"/> : <ChevronDown size={16} className="text-slate-500"/>}
                </div>
            </div>

            {/* EXPANDED DETAILS */}
            {expandedMatchId === match.metadata.matchId && (
                <div className="mt-1 bg-black/40 rounded-xl p-4 border border-slate-800/50 animate-in slide-in-from-top-1">
                    <div className="grid grid-cols-3 gap-2 text-center mb-4">
                        <StatBox label="Gold" value={(participant.goldEarned / 1000).toFixed(1) + 'k'} color="text-yellow-400" icon={<Coins size={10}/>} />
                        <StatBox label="Vision" value={participant.visionScore} color="text-indigo-300" icon={<Eye size={10}/>} />
                        <StatBox label="Damage" value={(participant.totalDamageDealtToChampions / 1000).toFixed(1) + 'k'} color="text-red-400" icon={<Swords size={10}/>} />
                    </div>
                    
                    {/* Items Grid */}
                    <div className="flex gap-1.5 justify-center bg-slate-900/30 p-2 rounded-lg">
                        {[0,1,2,3,4,5].map(i => { // Items 0 à 5 (le 6 est le trinket, souvent séparé)
                            const itemId = participant[`item${i}`];
                            return itemId > 0 ? (
                                <img key={i} src={`https://ddragon.leagueoflegends.com/cdn/14.3.1/img/item/${itemId}.png`} className="w-7 h-7 rounded border border-slate-700/50" alt="Item" onError={(e) => e.currentTarget.style.display = 'none'}/>
                            ) : (
                                <div key={i} className="w-7 h-7 rounded bg-slate-800/50 border border-slate-700/30"></div>
                            );
                        })}
                        {/* Trinket (Item 6) */}
                         {participant.item6 > 0 && (
                             <div className="ml-2 pl-2 border-l border-slate-700/50">
                                <img src={`https://ddragon.leagueoflegends.com/cdn/14.3.1/img/item/${participant.item6}.png`} className="w-7 h-7 rounded border border-slate-700/50" alt="Trinket" onError={(e) => e.currentTarget.style.display = 'none'}/>
                             </div>
                         )}
                    </div>
                </div>
            )}
        </div>
      );
  }

  return (
    <div className={`
        bg-gradient-to-b from-slate-900/90 to-black backdrop-blur-xl border border-slate-800/80 rounded-[2rem] relative overflow-hidden shadow-2xl transition-all duration-500 ease-in-out
        ${isExpanded ? 'col-span-1 md:col-span-2 lg:col-span-3 row-span-2 z-30' : ''}
    `}>
        
        {/* HEADER */}
        <div className="p-6 relative z-10">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                        <Shield size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white italic tracking-wide flex items-center gap-2">
                            LEAGUE
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                             <span className="text-xs font-bold px-2 py-0.5 bg-slate-800 text-slate-300 rounded uppercase">Level {stats.level}</span>
                             <span className="text-xs text-slate-500">{isExpanded ? 'Detailed Report' : `Last ${stats.matchesCount} Matches`}</span>
                        </div>
                    </div>
                </div>

                {/* RANK EMBLEM & TEXT */}
                <div className="text-right flex items-center gap-3">
                     {/* Ajout de onError pour cacher l'image si le lien est cassé */}
                     <img 
                        src={stats.rankImg} 
                        className="w-14 h-14 drop-shadow-lg" 
                        alt={stats.tier}
                        onError={(e) => {
                            e.currentTarget.style.display = 'none'; // Cache l'image cassée
                            e.currentTarget.nextElementSibling?.classList.remove('hidden'); // Affiche le texte de secours si besoin
                        }}
                     />
                     <div>
                        <span className="text-blue-400 font-mono font-black text-2xl block leading-none">{stats.tier} {stats.rank}</span>
                        <span className="text-xs text-slate-400 font-bold">{stats.lp} LP</span>
                     </div>
                </div>
            </div>

            {/* STATS GRID */}
            <div className={`grid gap-3 ${isExpanded ? 'grid-cols-2 md:grid-cols-4 mb-8' : 'grid-cols-2'}`}>
                <StatRow label="KDA Ratio" value={stats.kdaRatio} good={parseFloat(stats.kdaRatio) >= 3} bad={parseFloat(stats.kdaRatio) < 2} icon={<Crosshair size={12}/>} />
                <StatRow label="Win Rate" value={`${stats.winRate}%`} good={stats.winRate >= 50} bad={stats.winRate < 48} icon={<Trophy size={12}/>} />
                <StatRow label="Avg CS/M" value={stats.avgCSPerMin} icon={<Swords size={12}/>} />
                <StatRow label="Games" value={stats.matchesCount} icon={<Activity size={12}/>} />
            </div>

            {/* RECENT FORM */}
            {!isExpanded && (
                <div className="mt-4 flex items-center justify-between bg-black/20 p-2 rounded-xl">
                    <div className="flex items-center gap-2">
                        {stats.mainChampImg && <img src={stats.mainChampImg} className="w-6 h-6 rounded-full border border-slate-600" alt="Main Icon" onError={(e) => e.currentTarget.style.display='none'}/>}
                        <span className="text-xs text-slate-500 font-bold">RECENT FORM</span>
                    </div>
                    <div className="flex gap-1">
                        {stats.lastGames.map((res, i) => (
                            <div key={i} className={`w-1.5 h-6 rounded-full transition hover:scale-125 ${res === 'W' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-red-500/40'}`}></div>
                        ))}
                    </div>
                </div>
            )}

            {/* EXPANDED MATCH HISTORY */}
            {isExpanded && (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    {data.matches && data.matches.map((match: any) => renderMatchDetail(match))}
                </div>
            )}

            {/* TOGGLE BUTTON */}
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full mt-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-bold transition-all flex items-center justify-center gap-2 border border-white/5 group"
            >
                {isExpanded ? (
                    <>Close Report <ChevronUp size={16} className="group-hover:-translate-y-1 transition"/></>
                ) : (
                    <>View Full Analysis <ChevronDown size={16} className="group-hover:translate-y-1 transition"/></>
                )}
            </button>
        </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

function StatRow({ label, value, good, bad, icon }: any) {
    let color = 'text-white';
    if (good) color = 'text-blue-400';
    if (bad) color = 'text-red-400';
    return (
        <div className="flex flex-col p-3 bg-slate-950/40 rounded-xl border border-white/5 hover:border-white/10 transition">
            <span className="text-slate-500 text-[10px] font-bold uppercase flex items-center gap-1 mb-1">
                {icon} {label}
            </span>
            <span className={`font-mono font-bold text-lg ${color}`}>{value}</span>
        </div>
    )
}

function StatBox({ label, value, color, icon }: any) {
    return (
        <div className="bg-slate-900/40 p-2 rounded-lg border border-white/5 flex flex-col items-center">
            <p className="text-[10px] text-slate-500 mb-0.5 flex items-center gap-1">{icon} {label}</p>
            <p className={`font-mono font-bold text-sm ${color}`}>{value}</p>
        </div>
    )
}