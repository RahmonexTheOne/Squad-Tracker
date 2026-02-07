'use client';

import { useState } from 'react';
import { Crosshair, ChevronDown, ChevronUp, Skull, Trophy, Star, Activity } from 'lucide-react';

interface ValorantCardProps {
  riotId: string | null;
  data: any; // Contient matches, mmr_history, account, mmr_life
}

export default function ValorantCard({ riotId, data }: ValorantCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  // --- CALCULS DES STATS ---
  const calculateStats = () => {
    if (!data || !data.matches || data.matches.length === 0) return null;

    let totalKills = 0, totalDeaths = 0, totalWins = 0, totalShots = 0, totalHeadshots = 0, totalScore = 0;
    const lastGames: string[] = [];
    const agentsPlayed: Record<string, { count: number, img: string }> = {};

    const [myName] = riotId?.split('#') || ["", ""];

    data.matches.forEach((match: any) => {
      const player = match.players.all_players.find((p: any) => 
        p.name.toLowerCase() === myName.toLowerCase()
      );

      if (player) {
        totalKills += player.stats.kills;
        totalDeaths += player.stats.deaths;
        totalScore += player.stats.score;
        
        const shots = player.stats.headshots + player.stats.bodyshots + player.stats.legshots;
        totalShots += shots;
        totalHeadshots += player.stats.headshots;

        const myTeam = player.team.toLowerCase();
        const hasWon = match.teams[myTeam].has_won;
        if (hasWon) totalWins++;
        lastGames.push(hasWon ? 'W' : 'L');

        if (player.assets.agent.small) {
          const img = player.assets.agent.small;
          if (!agentsPlayed[img]) agentsPlayed[img] = { count: 0, img };
          agentsPlayed[img].count++;
        }
      }
    });

    // Info Actuelle
    let rank = "Unranked";
    let rr = 0;
    let rankImg = "";
    if (data.mmr_history && data.mmr_history.length > 0) {
      rank = data.mmr_history[0].currenttierpatched;
      rr = data.mmr_history[0].ranking_in_tier;
      rankImg = data.mmr_history[0].images?.small;
    }

    // Info PEAK (Max Rank)
    let peakRank = "Unknown";
    let peakSeason = "";
    if (data.mmr_life && data.mmr_life.highest_rank) {
        peakRank = data.mmr_life.highest_rank.patched_tier;
        peakSeason = data.mmr_life.highest_rank.season; // ex: "e5a3"
    }

    // Account Level
    const accountLevel = data.account?.account_level || 0;
    const cardImg = data.account?.card?.small || null;

    // Main Agent
    const sortedAgents = Object.values(agentsPlayed).sort((a, b) => b.count - a.count);
    const mainAgentImg = sortedAgents.length > 0 ? sortedAgents[0].img : null;

    const matchesCount = data.matches.length;

    return {
      kd: (totalDeaths > 0 ? (totalKills / totalDeaths) : totalKills).toFixed(2),
      winRate: ((totalWins / matchesCount) * 100).toFixed(0),
      hs: (totalShots > 0 ? ((totalHeadshots / totalShots) * 100) : 0).toFixed(1),
      avgScore: (totalScore / matchesCount).toFixed(0), // ACS Moyen
      lastGames,
      rank,
      rr,
      rankImg,
      peakRank,
      peakSeason,
      accountLevel,
      cardImg,
      mainAgentImg
    };
  };

  const stats = calculateStats();
  const [myName] = riotId?.split('#') || ["", ""];

  if (!riotId || !data) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 text-center text-slate-500">
         <Crosshair size={32} className="mx-auto mb-2 opacity-50"/>
         <p>No Data Available</p>
      </div>
    );
  }

  // --- RENDER MATCH ---
  const renderMatchDetail = (match: any) => {
    const player = match.players.all_players.find((p: any) => p.name.toLowerCase() === myName.toLowerCase());
    if (!player) return null;

    const myTeam = player.team.toLowerCase();
    const isWin = match.teams[myTeam].has_won;
    const score = `${match.teams[myTeam].rounds_won} - ${match.teams[myTeam].rounds_lost}`;
    const kda = `${player.stats.kills} / ${player.stats.deaths} / ${player.stats.assists}`;
    
    // Précision
    const totalHits = player.stats.headshots + player.stats.bodyshots + player.stats.legshots;
    const hsP = totalHits > 0 ? Math.round((player.stats.headshots / totalHits) * 100) : 0;
    const bsP = totalHits > 0 ? Math.round((player.stats.bodyshots / totalHits) * 100) : 0;
    const lsP = totalHits > 0 ? Math.round((player.stats.legshots / totalHits) * 100) : 0;

    return (
      <div key={match.metadata.matchid} className="mb-3">
        {/* Résumé Match */}
        <div 
          onClick={() => setExpandedMatchId(expandedMatchId === match.metadata.matchid ? null : match.metadata.matchid)}
          className={`
            cursor-pointer rounded-xl p-3 border transition-all duration-300 relative overflow-hidden flex items-center justify-between
            ${isWin ? 'bg-green-500/5 border-green-500/20 hover:bg-green-500/10' : 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10'}
          `}
        >
          <div className="flex items-center gap-3">
            <img src={player.assets.agent.small} className="w-10 h-10 rounded-full border border-white/10" alt="Agent"/>
            <div>
              <p className={`font-bold text-sm ${isWin ? 'text-green-400' : 'text-red-400'}`}>
                {isWin ? 'VICTORY' : 'DEFEAT'} <span className="text-slate-500 text-xs ml-2">{score}</span>
              </p>
              <p className="text-xs text-slate-400">{match.metadata.map} • {match.metadata.mode}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-mono font-bold text-slate-200">{kda}</p>
              <p className="text-[10px] text-slate-500 font-bold">ACS: {player.stats.score}</p>
            </div>
            {expandedMatchId === match.metadata.matchid ? <ChevronUp size={16} className="text-slate-500"/> : <ChevronDown size={16} className="text-slate-500"/>}
          </div>
        </div>

        {/* Détails étendus */}
        {expandedMatchId === match.metadata.matchid && (
          <div className="mt-1 bg-black/40 rounded-xl p-4 border border-slate-800/50 animate-in slide-in-from-top-1">
            <div className="grid grid-cols-3 gap-2 mb-3 text-center">
               <StatBox label="Damage" value={player.damage_made || "N/A"} color="text-slate-200" />
               <StatBox label="Headshots" value={player.stats.headshots} color="text-yellow-400" />
               <StatBox label="KD Ratio" value={(player.stats.kills / (player.stats.deaths || 1)).toFixed(2)} color="text-indigo-300" />
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex opacity-80">
                <div style={{ width: `${hsP}%` }} className="h-full bg-yellow-500" title="Head"></div>
                <div style={{ width: `${bsP}%` }} className="h-full bg-indigo-500" title="Body"></div>
                <div style={{ width: `${lsP}%` }} className="h-full bg-slate-600" title="Legs"></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 px-1">
                <span>Head {hsP}%</span>
                <span>Body {bsP}%</span>
                <span>Legs {lsP}%</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`
      bg-gradient-to-b from-slate-900/90 to-black backdrop-blur-xl border border-slate-800/80 rounded-[2rem] relative overflow-hidden shadow-2xl transition-all duration-500 ease-in-out
      ${isExpanded ? 'col-span-1 md:col-span-2 lg:col-span-3 row-span-2 z-30' : ''}
    `}>
      
      {/* --- BANNER HEADER --- */}
      {stats!.cardImg && (
        <div className="absolute top-0 left-0 w-full h-32 opacity-20 z-0">
             <img src={stats!.cardImg} className="w-full h-full object-cover" alt="Player Card" />
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900"></div>
        </div>
      )}

      <div className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/20 rounded-2xl text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]"><Crosshair size={28} /></div>
            <div>
              <h2 className="text-2xl font-black text-white italic tracking-wide">VALORANT</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold px-2 py-0.5 bg-slate-800 text-slate-300 rounded uppercase">Level {stats!.accountLevel}</span>
                <span className="text-xs text-slate-500">{isExpanded ? 'Detailed Report' : 'Last 10 Matches'}</span>
              </div>
            </div>
          </div>
          
          {/* RANK DISPLAY */}
          <div className="text-right flex items-center gap-3">
            {stats!.rankImg && <img src={stats!.rankImg} className="w-12 h-12 drop-shadow-lg" alt="Rank"/>}
            <div>
              <span className="text-red-500 font-mono font-black text-2xl block leading-none">{stats!.rank.toUpperCase()}</span>
              <span className="text-xs text-slate-400 font-bold">{stats!.rr} RR</span>
            </div>
          </div>
        </div>

        {/* --- SECTION PEAK RANK (NOUVEAU) --- */}
        <div className="mb-6 bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500"><Trophy size={18}/></div>
                <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Peak Rank</p>
                    <p className="text-white font-bold">{stats!.peakRank}</p>
                </div>
            </div>
            <div className="text-right">
                 <p className="text-xs text-slate-500">Season</p>
                 <p className="text-slate-300 font-mono text-sm">{stats!.peakSeason.toUpperCase()}</p>
            </div>
        </div>

        {/* --- STATS GRID --- */}
        <div className={`grid gap-3 ${isExpanded ? 'grid-cols-2 md:grid-cols-4 mb-8' : 'grid-cols-2'}`}>
            <StatRow label="K/D Ratio" value={stats!.kd} good={parseFloat(stats!.kd) > 1} bad={parseFloat(stats!.kd) < 0.9} />
            <StatRow label="Win Rate" value={`${stats!.winRate}%`} good={parseInt(stats!.winRate) > 50} bad={parseInt(stats!.winRate) < 45} />
            <StatRow label="Headshot" value={`${stats!.hs}%`} icon={<Crosshair size={12}/>} />
            <StatRow label="Avg Score" value={stats!.avgScore} icon={<Activity size={12}/>} />
        </div>

        {/* --- LAST GAMES FORM --- */}
        {!isExpanded && (
            <div className="mt-4 flex items-center justify-between bg-black/20 p-2 rounded-xl">
                 <div className="flex items-center gap-2">
                    {stats!.mainAgentImg && <img src={stats!.mainAgentImg} className="w-6 h-6 rounded-full border border-slate-600" alt="Main"/>}
                    <span className="text-xs text-slate-500 font-bold">RECENT FORM</span>
                 </div>
                 <div className="flex gap-1">
                    {stats!.lastGames.slice(0, 10).map((res, i) => (
                        <div key={i} className={`w-1.5 h-6 rounded-full transition hover:scale-125 ${res === 'W' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500/40'}`}></div>
                    ))}
                 </div>
            </div>
        )}

        {/* --- EXPANDED HISTORY --- */}
        {isExpanded && (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 
                {/* Style de la Scrollbar */}
                [&::-webkit-scrollbar]:w-1.5
                [&::-webkit-scrollbar-track]:bg-transparent
                [&::-webkit-scrollbar-thumb]:bg-slate-700/50
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:hover:bg-slate-500
                {/* Support Firefox */}
                [scrollbar-width:thin]
                [scrollbar-color:theme('colors.slate.700')_transparent]
            ">
            {data.matches.map((match: any) => renderMatchDetail(match))}
            </div>
        )}

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
    if (good) color = 'text-green-400';
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

function StatBox({ label, value, color }: any) {
    return (
        <div className="bg-slate-900/40 p-2 rounded-lg border border-white/5">
            <p className="text-[10px] text-slate-500 mb-0.5">{label}</p>
            <p className={`font-mono font-bold text-sm ${color}`}>{value}</p>
        </div>
    )
}