'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Map, Swords, Skull, Coins } from 'lucide-react';

interface DetailedLeagueCardProps {
  match: any;
  squadMembers: any[];
}

export default function DetailedLeagueCard({ match, squadMembers }: DetailedLeagueCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Filter participants to find squad members
  const playersInGame = match.info.participants.filter((p: any) => {
    // League API uses riotIdGameName and riotIdTagline
    const playerRiotId = `${p.riotIdGameName}#${p.riotIdTagline}`.toLowerCase();
    return squadMembers.some(member => member.riotId && member.riotId.toLowerCase() === playerRiotId);
  });

  if (playersInGame.length === 0) return null;

  // Match Info
  const durationMinutes = Math.floor(match.info.gameDuration / 60);
  const mode = match.info.gameMode;
  const isWin = playersInGame[0].win; // Assuming squad plays together or based on first player
  const date = new Date(match.info.gameCreation).toLocaleDateString();

  return (
    <div className={`
      w-full bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden transition-all duration-300
      ${isOpen ? 'ring-1 ring-yellow-600 bg-slate-900' : 'hover:bg-slate-900/80'}
    `}>
      
      {/* HEADER */}
      <div 
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Left: Result & Info */}
        <div className="flex items-center gap-4">
            <div className={`w-1.5 h-12 rounded-full ${isWin ? 'bg-blue-500' : 'bg-red-500'}`}></div>
            <div>
                <h3 className={`font-bold text-lg ${isWin ? 'text-blue-400' : 'text-red-400'}`}>
                    {isWin ? 'VICTORY' : 'DEFEAT'} <span className="text-white ml-2 text-sm font-normal">{mode}</span>
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Clock size={12}/> {durationMinutes}m</span>
                    <span>• {date}</span>
                </div>
            </div>
        </div>

        {/* Center: Squad Players */}
        <div className="flex -space-x-3">
            {playersInGame.map((p: any) => (
                <div key={p.puuid} className="relative group">
                    <img 
                        src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${p.championId}.png`} 
                        alt={p.championName} 
                        className="w-10 h-10 rounded-full border-2 border-slate-800 bg-slate-800 object-cover relative z-10"
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-20 border border-slate-700">
                        {p.riotIdGameName} ({p.championName})
                    </div>
                </div>
            ))}
        </div>

        {/* Right: Toggle */}
        <div className="text-slate-500">
            {isOpen ? <ChevronUp/> : <ChevronDown/>}
        </div>
      </div>

      {/* DETAILS (ACCORDION) */}
      {isOpen && (
        <div className="border-t border-slate-800 bg-black/20 p-4 animate-in slide-in-from-top-2">
            <div className="space-y-3">
                {playersInGame.map((p: any) => (
                    <div key={p.puuid} className="flex items-center justify-between bg-slate-800/40 p-3 rounded-lg border border-white/5">
                        
                        <div className="flex items-center gap-3">
                            <img 
                                src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${p.championId}.png`} 
                                className="w-10 h-10 rounded-full" 
                                alt={p.championName}
                            />
                            <div>
                                <p className="font-bold text-white text-sm">{p.riotIdGameName}</p>
                                <p className="text-xs text-slate-400">{p.championName} • Lvl {p.champLevel}</p>
                            </div>
                        </div>

                        <div className="flex gap-6 text-center">
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-bold">KDA</p>
                                <p className="font-mono font-bold text-white text-sm">{p.kills}/{p.deaths}/{p.assists}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-bold">CS</p>
                                <p className="font-mono font-bold text-yellow-500 text-sm">{p.totalMinionsKilled + p.neutralMinionsKilled}</p>
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-[10px] text-slate-500 uppercase font-bold">Gold</p>
                                <p className="font-mono font-bold text-slate-300 text-sm">{(p.goldEarned / 1000).toFixed(1)}k</p>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="flex gap-1">
                            {[0,1,2,3,4,5].map(i => {
                                const itemId = p[`item${i}`];
                                return itemId > 0 ? (
                                    <img key={i} src={`https://ddragon.leagueoflegends.com/cdn/14.3.1/img/item/${itemId}.png`} className="w-6 h-6 rounded border border-slate-700" alt="item"/>
                                ) : (
                                    <div key={i} className="w-6 h-6 rounded bg-slate-800/50 border border-slate-700/30"></div>
                                );
                            })}
                        </div>

                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}