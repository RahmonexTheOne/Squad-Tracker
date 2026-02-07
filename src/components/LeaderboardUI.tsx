"use client";

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import PodiumCharacter from '@/components/PodiumCharacter';
import Link from 'next/link'; 
import { 
  Trophy, Crown, ChevronDown, ChevronUp, 
  Swords, Shield, User, Skull, Crosshair, Activity, X 
} from 'lucide-react';

export default function LeaderboardUI({ squadName, players }: { squadName: string, players: any[] }) {
  const [activeTab, setActiveTab] = useState<'valorant' | 'lol'>('valorant');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Séparation du Top 3
  const top3 = players.slice(0, 3);
  const restOfList = players.slice(3);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      <Sidebar />
      
      <main className="md:ml-20 lg:ml-64 min-h-screen pb-20 overflow-x-hidden relative">
        
        {/* HEADER */}
        <div className="relative h-72 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
            <div className="absolute top-0 w-full h-full bg-gradient-to-t from-slate-950 to-transparent"></div>
            
            <div className="z-10 text-center animate-in slide-in-from-top-4 duration-700">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <Trophy size={32} className="text-yellow-500 fill-yellow-500"/> 
                    <span className="text-yellow-500 font-bold tracking-widest text-sm uppercase">Leaderboard</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase drop-shadow-2xl">
                    {squadName}
                </h1>
                <p className="text-slate-400 mt-2">Who is the real carry?</p>
            </div>

            <div className="absolute bottom-8 z-20 flex bg-slate-900/50 backdrop-blur-md p-1 rounded-2xl border border-white/10">
                <button onClick={() => setActiveTab('valorant')} className={`px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'valorant' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                    <Swords size={16}/> VALORANT
                </button>
                <button onClick={() => setActiveTab('lol')} className={`px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'lol' ? 'bg-yellow-500 text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                    <Shield size={16}/> LEAGUE
                </button>
            </div>
        </div>

        <div className="p-6 lg:p-12 max-w-7xl mx-auto -mt-4 relative z-20">
            {activeTab === 'lol' ? (
                <div className="bg-slate-900/30 border border-slate-800 border-dashed rounded-3xl p-20 text-center">
                    <Shield size={64} className="mx-auto mb-6 text-slate-700"/>
                    <h2 className="text-2xl font-bold text-white mb-2">Summoner's Rift Offline</h2>
                    <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-4 py-1 rounded-full text-xs font-bold uppercase">Coming Soon</span>
                </div>
            ) : players.length === 0 ? (
                <div className="text-center py-20 text-slate-500">No active agents found in this squad.</div>
            ) : (
                <>
                    {/* PODIUM */}
                    <div className="flex flex-col md:flex-row items-end justify-center gap-6 md:gap-16 mb-24 min-h-[300px]">
                        {/* 2ND */}
                        {top3[1] && <PodiumStep player={top3[1]} rank={2} onClick={setSelectedUser} />}
                        {/* 1ST */}
                        {top3[0] && <PodiumStep player={top3[0]} rank={1} onClick={setSelectedUser} />}
                        {/* 3RD */}
                        {top3[2] && <PodiumStep player={top3[2]} rank={3} onClick={setSelectedUser} />}
                    </div>

                    {/* LISTE */}
                    <div className="space-y-4 max-w-5xl mx-auto">
                        {restOfList.map((player, index) => {
                            const rank = index + 4;
                            const isExpanded = expandedUser === player.id;
                            return (
                                <div key={player.id} onClick={() => setExpandedUser(isExpanded ? null : player.id)}
                                    className={`bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${isExpanded ? 'ring-1 ring-indigo-500 bg-slate-900 shadow-2xl' : 'hover:bg-slate-800/80'}`}>
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="w-10 text-center font-black text-xl text-slate-600">#{rank}</div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-xl bg-slate-800 overflow-hidden border border-slate-700">
                                                    <img src={player.avatar_url || '/characters/default.png'} className="w-full h-full object-cover"/>
                                                </div>
                                                <div>
                                                    <h3 className={`font-bold text-lg ${isExpanded ? 'text-indigo-400' : 'text-white'}`}>{player.username}</h3>
                                                    <p className="text-xs text-slate-500">{player.riot_id || 'No ID'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right hidden sm:block">
                                                <p className="font-bold text-white">{player.valo_rank}</p>
                                                <p className="text-xs text-slate-500">{player.valo_rr} RR</p>
                                            </div>
                                            <div className={`p-2 rounded-full transition ${isExpanded ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                                {isExpanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                                            </div>
                                        </div>
                                    </div>
                                    {isExpanded && <PlayerDetails player={player} />}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>

        {/* MODAL */}
        {selectedUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedUser(null)}>
                <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-md w-full relative shadow-2xl" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={24}/></button>
                    <div className="text-center mb-8">
                        <div className="w-24 h-24 mx-auto bg-slate-800 rounded-full border-4 border-indigo-500 overflow-hidden mb-4 shadow-lg">
                            <img src={selectedUser.avatar_url || '/characters/default.png'} className="w-full h-full object-cover"/>
                        </div>
                        <h2 className="text-2xl font-black text-white">{selectedUser.username}</h2>
                        <p className="text-indigo-400 font-bold text-sm">{selectedUser.valo_rank} • {selectedUser.valo_rr} RR</p>
                    </div>
                    <PlayerDetails player={selectedUser} modal={true} />
                </div>
            </div>
        )}
      </main>
    </div>
  );
}

function PodiumStep({ player, rank, onClick }: any) {
    const isFirst = rank === 1;
    return (
        <div className={`flex flex-col items-center group cursor-pointer ${isFirst ? 'order-1 z-10' : rank === 2 ? 'order-2' : 'order-3'}`} onClick={() => onClick(player)}>
            <div className="relative transition-transform duration-300 group-hover:-translate-y-4">
                {isFirst && <Crown size={48} className="absolute -top-16 left-1/2 -translate-x-1/2 text-yellow-500 fill-yellow-500 animate-bounce"/>}
                <div className={`${isFirst ? 'w-56 h-56' : 'w-40 h-40'} relative z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]`}>
                    <PodiumCharacter path={`/characters/${player.username}.png`} alt={player.username} />
                </div>
            </div>
            <div className={`bg-gradient-to-t from-slate-900 ${isFirst ? 'to-slate-800 border-yellow-500 h-56' : rank === 2 ? 'to-slate-800 border-slate-500 h-40' : 'to-slate-800 border-amber-700 h-32'} border-t-4 w-40 md:w-52 rounded-t-2xl flex flex-col items-center pt-4 relative mt-[-20px]`}>
                <span className={`text-6xl font-black select-none ${isFirst ? 'text-yellow-500/20' : 'text-slate-600/30'}`}>{rank}</span>
                <div className="absolute bottom-4 flex flex-col items-center">
                    <span className={`font-bold ${isFirst ? 'text-yellow-400' : 'text-white'}`}>{player.username}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">{player.valo_rank}</span>
                </div>
            </div>
        </div>
    );
}

function PlayerDetails({ player, modal = false }: any) {
    return (
        <div className={`${modal ? '' : 'border-t border-white/5 bg-black/20 p-6'}`}>
            <div className="grid grid-cols-2 gap-4">
                <StatBox label="K/D Ratio" value={player.valo_kd} color="text-green-400" />
                <StatBox label="HS %" value={`${player.valo_hs_percent || 0}%`} color="text-yellow-400" />
                <StatBox label="Role" value={player.valo_main_role || 'Flex'} color="text-white" />
                <StatBox label="Agent" value={player.valo_main_agent || '?'} color="text-indigo-400" />
            </div>
            <div className="mt-6 text-center">
                <Link href={`/profile/${player.username}`} className="w-full block">
                    <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2">
                        <User size={18}/> View Profile
                    </button>
                </Link>
            </div>
        </div>
    );
}

function StatBox({ label, value, color }: any) {
    return (
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col items-center justify-center gap-1">
            <div className="text-[10px] text-slate-500 uppercase font-bold">{label}</div>
            <div className={`text-lg font-bold font-mono ${color}`}>{value}</div>
        </div>
    );
}