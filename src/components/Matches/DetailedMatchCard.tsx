'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Map, Swords, Skull } from 'lucide-react';
import KillMap from './KillMap';

interface DetailedMatchCardProps {
  match: any;
  squadMembers: any[]; // La liste des membres pour savoir qui highlight
}

export default function DetailedMatchCard({ match, squadMembers }: DetailedMatchCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  // 1. Trouver QUI de la squad a joué cette game
  const playersInGame = match.players.all_players.filter((p: any) => 
    squadMembers.some(member => 
        member.riotId && 
        p.name.toLowerCase() === member.riotId.split('#')[0].toLowerCase() && 
        p.tag.toLowerCase() === member.riotId.split('#')[1].toLowerCase()
    )
  );

  // Info générale
  const metadata = match.metadata;
  const isWin = match.teams[playersInGame[0]?.team.toLowerCase() || 'blue'].has_won;
  const score = `${match.teams.blue.rounds_won} : ${match.teams.red.rounds_won}`;
  const mapName = metadata.map;
  const date = new Date(metadata.game_start * 1000).toLocaleDateString();

  // Pour la Kill Map (On prend les morts du 1er joueur de la squad trouvé pour l'exemple)
  // L'API V3 donne les 'kills' array avec location x,y
  // On va extraire TOUTES les positions de mort de la squad
  const squadDeaths: any[] = [];
  
  // NOTE: L'API HenrikDev standard ne donne pas les coords X/Y dans le résumé match
  // Il faut souvent analyser le "round_results" pour avoir les locations.
  // Si locations pas dispo, on affiche juste un message.
  if (match.kills) {
      match.kills.forEach((kill: any) => {
         // Si la victime est dans notre squad -> C'est une mort
         const victimIsSquad = playersInGame.some((p: any) => p.puuid === kill.victim_puuid);
         if (victimIsSquad && kill.victim_death_location) {
             squadDeaths.push(kill.victim_death_location);
         }
      });
  }

  return (
    <div className={`
      w-full bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden transition-all duration-300
      ${isOpen ? 'ring-1 ring-slate-600' : 'hover:bg-slate-900/80'}
    `}>
      
      {/* --- HEADER --- */}
      <div 
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Gauche : Résultat & Map */}
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

        {/* Centre : Les Joueurs de la Squad */}
        <div className="flex -space-x-3">
            {playersInGame.map((p: any) => (
                <div key={p.puuid} className="relative group">
                    <img 
                        src={p.assets.agent.small} 
                        alt={p.name} 
                        className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 object-cover relative z-10"
                    />
                    {/* Tooltip au survol */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-20">
                        {p.name} ({p.stats.kills}/{p.stats.deaths})
                    </div>
                </div>
            ))}
        </div>

        {/* Droite : Toggle */}
        <div className="text-slate-500">
            {isOpen ? <ChevronUp/> : <ChevronDown/>}
        </div>
      </div>

      {/* --- DETAILS (ACCORDION) --- */}
      {isOpen && (
        <div className="border-t border-slate-800 bg-black/20 p-6 animate-in slide-in-from-top-2">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* COLONNE 1 & 2 : Tableau des Scores Squad */}
                <div className="lg:col-span-2 space-y-4">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Swords size={16}/> Squad Performance
                    </h4>
                    
                    {playersInGame.map((p: any) => {
                        const kd = (p.stats.kills / (p.stats.deaths || 1)).toFixed(2);
                        return (
                            <div key={p.puuid} className="bg-slate-800/40 rounded-lg p-3 flex items-center justify-between border border-white/5">
                                <div className="flex items-center gap-3">
                                    <img src={p.assets.agent.small} className="w-12 h-12 rounded-lg" alt="Agent"/>
                                    <div>
                                        <p className="font-bold text-white text-lg">{p.name}</p>
                                        <p className="text-xs text-slate-400">{p.character} • ACS: {p.stats.score}</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-8 text-center">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase">K/D/A</p>
                                        <p className="font-mono font-bold text-white">{p.stats.kills}/{p.stats.deaths}/{p.stats.assists}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase">Ratio</p>
                                        <p className={`font-mono font-bold ${parseFloat(kd) > 1 ? 'text-green-400' : 'text-red-400'}`}>{kd}</p>
                                    </div>
                                    <div className="hidden sm:block">
                                        <p className="text-xs text-slate-500 uppercase">HS%</p>
                                        <p className="font-mono font-bold text-yellow-500">
                                            {Math.round((p.stats.headshots / (p.stats.headshots + p.stats.bodyshots + p.stats.legshots)) * 100)}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* ROUND HISTORY (Simplifié) */}
                    <div className="mt-6">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Round History</h4>
                        <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
                            {match.rounds.map((round: any, i: number) => {
                                // Qui a gagné le round ?
                                const winningTeam = round.winning_team.toLowerCase();
                                const myTeam = playersInGame[0].team.toLowerCase();
                                const won = winningTeam === myTeam;
                                return (
                                    <div 
                                        key={i} 
                                        className={`w-6 h-10 flex-shrink-0 rounded flex items-center justify-center text-[10px] font-bold ${won ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}
                                        title={`Round ${i+1}: ${round.end_type}`}
                                    >
                                        {i+1}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* COLONNE 3 : Kill Map */}
                <div className="lg:col-span-1">
                     <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Skull size={16}/> Death Locations
                    </h4>
                    {/* On passe les données au composant Map */}
                    <KillMap mapName={metadata.map} deaths={squadDeaths} />
                    <p className="text-xs text-slate-500 mt-2 text-center italic">
                        * Locations where squad members died.
                    </p>
                </div>

            </div>
        </div>
      )}
    </div>
  );
}