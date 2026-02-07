'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Map, Swords, Skull } from 'lucide-react';
import KillMap from './KillMap';

interface DetailedMatchCardProps {
  match: any;
  squadMembers: any[];
}

const SQUAD_COLORS = ['#F87171', '#60A5FA', '#4ADE80', '#FACC15', '#A78BFA'];

export default function DetailedMatchCard({ match, squadMembers }: DetailedMatchCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  // 1. FILTRAGE ET SÉCURISATION
  const playersInGame = match.players.all_players.filter((p: any) => {
    // Sécurité : on vérifie que p.name et p.tag existent
    if (!p.name || !p.tag) return false;
    const playerRiotId = `${p.name}#${p.tag}`.toLowerCase();
    
    return squadMembers.some(member => 
        member.riotId && member.riotId.toLowerCase() === playerRiotId
    );
  }).map((p: any, index: number) => ({
      ...p,
      uiColor: SQUAD_COLORS[index % SQUAD_COLORS.length] 
  }));

  if (playersInGame.length === 0) return null;

  const metadata = match.metadata;
  const firstPlayer = playersInGame[0];
  
  // --- 🔴 CORRECTION DE L'ERREUR ICI ---
  // On gère les cas où "team" ou "teams" n'existent pas (ex: Deathmatch)
  const isDeathmatch = metadata.mode === 'Deathmatch';
  const myTeamColor = firstPlayer.team ? firstPlayer.team.toLowerCase() : 'blue';
  
  let isWin = false;
  let score = "0 : 0";

  if (isDeathmatch) {
      // En Deathmatch, pas de "teams". Win si rang 1.
      const rank = firstPlayer.stats?.rank || 0;
      isWin = rank === 1;
      score = `Rank #${rank}`;
  } else {
      // Mode Normal : On vérifie que les équipes existent avant de lire
      if (match.teams && match.teams[myTeamColor]) {
          isWin = match.teams[myTeamColor].has_won;
          // Sécurité sur les scores
          const blueScore = match.teams.blue?.rounds_won ?? 0;
          const redScore = match.teams.red?.rounds_won ?? 0;
          score = `${blueScore} : ${redScore}`;
      } else {
          // Fallback si l'API renvoie de la donnée corrompue
          isWin = false;
          score = "N/A";
      }
  }
  // -------------------------------------

  const mapName = metadata.map;
  const date = new Date(metadata.game_start * 1000).toLocaleDateString();

  // 2. RECUPERATION DES MORTS
  const squadDeaths: any[] = [];
  if (match.kills) {
      match.kills.forEach((kill: any) => {
         const victim = playersInGame.find((p: any) => p.puuid === kill.victim_puuid);
         if (victim && kill.victim_death_location) {
             squadDeaths.push({
                 x: kill.victim_death_location.x,
                 y: kill.victim_death_location.y,
                 color: victim.uiColor,
                 victimName: victim.name
             });
         }
      });
  }

  return (
    <div className={`
      w-full bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden transition-all duration-300
      ${isOpen ? 'ring-1 ring-slate-600 bg-slate-900' : 'hover:bg-slate-900/80'}
    `}>
      
      {/* HEADER */}
      <div 
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
            <div className={`w-1.5 h-12 rounded-full ${isWin ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div>
                <h3 className={`font-bold text-lg ${isWin ? 'text-green-400' : 'text-red-400'}`}>
                    {isWin ? 'VICTORY' : 'DEFEAT'} <span className="text-white ml-2">{score}</span>
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Map size={12}/> {mapName}</span>
                    <span className="flex items-center gap-1"><Clock size={12}/> {metadata.mode}</span>
                    <span>• {date}</span>
                </div>
            </div>
        </div>

        <div className="flex -space-x-3">
            {playersInGame.map((p: any) => (
                <div key={p.puuid} className="relative group">
                    <img 
                        src={p.assets.agent.small} 
                        alt={p.name} 
                        className="w-10 h-10 rounded-full border-2 bg-slate-800 object-cover relative z-10"
                        style={{ borderColor: p.uiColor }}
                    />
                </div>
            ))}
        </div>

        <div className="text-slate-500">
            {isOpen ? <ChevronUp/> : <ChevronDown/>}
        </div>
      </div>

      {/* DETAILS */}
      {isOpen && (
        <div className="border-t border-slate-800 bg-black/20 p-6 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* TABLEAU SCORES */}
                <div className="lg:col-span-2 space-y-4">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Swords size={16}/> Squad Performance
                    </h4>
                    
                    {playersInGame.map((p: any) => {
                        const kd = (p.stats.kills / (p.stats.deaths || 1)).toFixed(2);
                        const totalShots = p.stats.headshots + p.stats.bodyshots + p.stats.legshots;
                        const hsPercent = totalShots > 0 ? Math.round((p.stats.headshots / totalShots) * 100) : 0;

                        return (
                            <div key={p.puuid} className="bg-slate-800/40 rounded-lg p-3 flex items-center justify-between border border-white/5 relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: p.uiColor }}></div>
                                <div className="flex items-center gap-3 pl-2">
                                    <img src={p.assets.agent.small} className="w-12 h-12 rounded-lg" alt="Agent"/>
                                    <div>
                                        <p className="font-bold text-lg" style={{ color: p.uiColor }}>{p.name}</p>
                                        <p className="text-xs text-slate-400">{p.character} • ACS: {p.stats.score}</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 sm:gap-12 text-center">
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">K/D/A</p>
                                        <p className="font-mono font-bold text-white text-lg">{p.stats.kills}/{p.stats.deaths}/{p.stats.assists}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Ratio</p>
                                        <p className={`font-mono font-bold text-lg ${parseFloat(kd) > 1 ? 'text-green-400' : 'text-red-400'}`}>{kd}</p>
                                    </div>
                                    <div className="hidden sm:block">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">HS%</p>
                                        <p className="font-mono font-bold text-yellow-500 text-lg">{hsPercent}%</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* ROUND HISTORY - Caché en Deathmatch */}
                    {!isDeathmatch && match.rounds && (
                        <div className="mt-6 pt-4 border-t border-slate-800/50">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Round History</h4>
                            <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
                                {match.rounds.map((round: any, i: number) => {
                                    const winningTeam = round.winning_team ? round.winning_team.toLowerCase() : '';
                                    const won = winningTeam === myTeamColor;
                                    return (
                                        <div 
                                            key={i} 
                                            className={`
                                                w-6 h-8 flex-shrink-0 rounded flex items-center justify-center text-[10px] font-bold border
                                                ${won ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}
                                            `}
                                        >
                                            {i+1}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* KILL MAP */}
                <div className="lg:col-span-1">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Skull size={16}/> Death Locations
                    </h4>
                    <KillMap mapName={metadata.map} deaths={squadDeaths} />
                    <p className="text-[10px] text-slate-500 mt-3 text-center italic">
                        * Locations where squad members died.
                    </p>
                </div>

            </div>
        </div>
      )}
    </div>
  );
}