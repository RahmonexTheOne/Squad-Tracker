'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr'; // 👈 Utilisation de la nouvelle librairie
import Sidebar from '@/components/Sidebar';
import DetailedMatchCard from '@/components/Matches/DetailedMatchCard';
import { Swords, Filter, Search, Loader2 } from 'lucide-react';

// On définit le type pour éviter les erreurs "implicit any"
interface SquadProfile {
  id: string;
  username: string;
  riot_id: string;
  avatar_url: string;
  squad_id: string;
}

export default function MatchesPage() {
  // 1. Initialisation correcte pour @supabase/ssr côté client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // --- ÉTATS ---
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [squadMembers, setSquadMembers] = useState<SquadProfile[]>([]); // 👈 On applique le type ici
  const [matches, setMatches] = useState<any[]>([]);
  
  // Filtres
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [resultFilter, setResultFilter] = useState<'ALL' | 'WIN' | 'LOSS'>('ALL');

  // 1. Chargement initial
  useEffect(() => {
    const fetchMembers = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('squad_id')
            .eq('id', user.id)
            .single();

        if (profile?.squad_id) {
          const { data: members } = await supabase
            .from('profiles')
            .select('*')
            .eq('squad_id', profile.squad_id);
            
          if (members) {
            // On force le typage ici pour rassurer TypeScript
            const validMembers = (members as SquadProfile[]).filter(m => m.riot_id);
            setSquadMembers(validMembers);
            
            // Auto-sélection de moi-même
            const me = validMembers.find((m) => m.id === user.id);
            if (me && me.riot_id) setSelectedMembers([me.riot_id]);
          }
        }
      }
      setLoading(false);
    };
    fetchMembers();
  }, [supabase]);

  // 2. Gestion de la sélection
  const toggleMember = (riotId: string) => {
    if (selectedMembers.includes(riotId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== riotId));
    } else {
      if (selectedMembers.length < 8) {
        setSelectedMembers([...selectedMembers, riotId]);
      } else {
        alert("Max 8 players allowed per search.");
      }
    }
  };

  // 3. Recherche
  const handleSearch = async () => {
    if (selectedMembers.length === 0) return alert("Select at least one agent.");
    
    setSearching(true);
    setMatches([]);

    // Préparation des données pour l'API Route
    const membersToFetch = squadMembers
        .filter((m) => selectedMembers.includes(m.riot_id)) // Le 'm' est maintenant typé !
        .map((m) => ({
            profileId: m.id,
            username: m.username,
            riotId: m.riot_id,
            avatarUrl: m.avatar_url
        }));

    try {
        const response = await fetch('/api/matches/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ members: membersToFetch }),
        });
        
        const results = await response.json();

        if (Array.isArray(results)) {
            let filteredMatches = results;
            
            // Filtrage Client (Rapide)
            if (resultFilter !== 'ALL') {
                filteredMatches = results.filter((match: any) => {
                    const player = match.players.all_players.find((p: any) => 
                        // Comparaison sécurisée
                        p.name && p.tag && selectedMembers.some(id => id.toLowerCase() === `${p.name}#${p.tag}`.toLowerCase())
                    );
                    
                    if (!player) return false;
                    
                    // On vérifie l'équipe
                    const teamColor = player.team ? player.team.toLowerCase() : null;
                    if (!teamColor || !match.teams || !match.teams[teamColor]) return false;

                    const won = match.teams[teamColor].has_won;
                    return resultFilter === 'WIN' ? won : !won;
                });
            }
            setMatches(filteredMatches);
        }
    } catch (error) {
        console.error("Search error", error);
    } finally {
        setSearching(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Initializing Uplink...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      <Sidebar />
      
      <main className="md:ml-20 lg:ml-64 p-6 lg:p-10 min-h-screen">
        
        <div className="max-w-5xl mx-auto">
            {/* HEADER */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white flex items-center gap-3 uppercase">
                    <Swords className="text-indigo-500" size={32}/> Combat Logs
                </h1>
                <p className="text-slate-400 text-sm">Select agents to retrieve mission reports.</p>
            </div>

            {/* --- FILTERS BOX --- */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 mb-10 shadow-xl backdrop-blur-md">
                
                {/* 1. SÉLECTION DES JOUEURS */}
                <div className="mb-6">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-3 block flex items-center gap-2">
                        <Search size={12}/> Select Agents ({selectedMembers.length}/8)
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {squadMembers.map((member) => {
                            const isSelected = selectedMembers.includes(member.riot_id);
                            return (
                                <button
                                    key={member.id}
                                    onClick={() => toggleMember(member.riot_id)}
                                    className={`
                                        flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-bold transition-all
                                        ${isSelected 
                                            ? 'bg-indigo-600/20 border-indigo-500 text-white' 
                                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}
                                    `}
                                >
                                    <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-indigo-400' : 'bg-slate-600'}`}></div>
                                    {member.username}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2. FILTRE RÉSULTAT & BOUTON SEARCH */}
                <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between border-t border-slate-800 pt-6">
                    
                    <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
                        {['ALL', 'WIN', 'LOSS'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setResultFilter(filter as any)}
                                className={`
                                    px-4 py-1.5 rounded-md text-xs font-bold transition-all
                                    ${resultFilter === filter 
                                        ? (filter === 'WIN' ? 'bg-green-500 text-black' : filter === 'LOSS' ? 'bg-red-500 text-white' : 'bg-slate-700 text-white') 
                                        : 'text-slate-500 hover:text-slate-300'}
                                `}
                            >
                                {filter === 'ALL' ? 'ALL MATCHES' : filter}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={handleSearch}
                        disabled={searching || selectedMembers.length === 0}
                        className={`
                            px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all
                            ${searching ? 'bg-slate-800 text-slate-500 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-105'}
                        `}
                    >
                        {searching ? <><Loader2 size={18} className="animate-spin"/> Scanning...</> : <><Filter size={18}/> Retrieve Logs</>}
                    </button>
                </div>
            </div>

            {/* --- RESULTS AREA --- */}
            <div className="space-y-4">
                {searching ? (
                    <div className="text-center py-20 animate-pulse">
                        <Swords size={48} className="mx-auto text-slate-700 mb-4"/>
                        <p className="text-slate-500">Decrypting match data...</p>
                    </div>
                ) : matches.length > 0 ? (
                    matches.map((match) => (
                        <DetailedMatchCard 
                            key={match.metadata.matchid} 
                            match={match} 
                            squadMembers={squadMembers.map(m => ({ riotId: m.riot_id }))} 
                        />
                    ))
                ) : (
                    <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
                        <Filter size={48} className="mx-auto text-slate-700 mb-4"/>
                        <p className="text-slate-500">No logs found. Adjust filters and search.</p>
                    </div>
                )}
            </div>

        </div>
      </main>
    </div>
  );
}