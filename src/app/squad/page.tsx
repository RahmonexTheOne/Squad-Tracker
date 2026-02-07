"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Users, Shield, UserPlus, LogOut, Crown, Trash2, Search, Send, PlusCircle } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function SquadPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [squad, setSquad] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [isOwner, setIsOwner] = useState(false);

  // --- NOUVEAUX ÉTATS ---
  const [viewMode, setViewMode] = useState<'create' | 'join'>('create'); // Basculer entre Créer et Rejoindre
  const [squadsList, setSquadsList] = useState<any[]>([]); // Liste des squads trouvées
  const [joinSearch, setJoinSearch] = useState(''); // Recherche pour rejoindre
  const [requestedSquads, setRequestedSquads] = useState<string[]>([]); // Squads déjà demandées

  // Pour la création (existant)
  const [newSquadName, setNewSquadName] = useState('');

  // Pour l'invitation (existant - Owner only)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    fetchSquadData();
  }, []);

  const fetchSquadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        setLoading(false);
        return;
    }
    setUser(user);

    // 1. Mon profil
    const { data: profile } = await supabase.from('profiles').select('squad_id').eq('id', user.id).single();

    if (profile?.squad_id) {
      // J'ai déjà une squad
      const { data: squadData } = await supabase.from('squads').select('*').eq('id', profile.squad_id).single();
      
      if (squadData) {
          setSquad(squadData);
          const { data: membersData } = await supabase.from('profiles').select('*').eq('squad_id', profile.squad_id);
          setMembers(membersData || []);
          if (squadData.owner_id === user.id) setIsOwner(true);
      }
    } else {
        // Je n'ai pas de squad -> Je charge mes requêtes en cours
        const { data: requests } = await supabase.from('squad_requests').select('squad_id').eq('user_id', user.id);
        if (requests) {
            setRequestedSquads(requests.map(r => r.squad_id));
        }
    }
    setLoading(false);
  };

  // --- LOGIQUE JOIN SQUAD ---

  const searchSquads = async () => {
      if (joinSearch.length < 2) return;
      
      const { data } = await supabase
        .from('squads')
        .select('*, owner:profiles!owner_id(username)') // On récupère le nom du chef
        .ilike('name', `%${joinSearch}%`)
        .limit(10);
      
      setSquadsList(data || []);
  };

  const requestJoin = async (squadId: string) => {
      try {
          await supabase.from('squad_requests').insert({
              squad_id: squadId,
              user_id: user.id
          });
          setRequestedSquads([...requestedSquads, squadId]);
          alert("Request sent to the Squad Commander!");
      } catch (error) {
          alert("Error sending request.");
      }
  };

  // --- LOGIQUE CREATE / MANAGE (Existante) ---

  const createSquad = async () => {
    if (!newSquadName) return;
    const { data: newSquad, error } = await supabase.from('squads').insert({ name: newSquadName, owner_id: user.id }).select().single();
    if (error) return alert(error.message);
    await supabase.from('profiles').update({ squad_id: newSquad.id }).eq('id', user.id);
    window.location.reload();
  };

  const leaveSquad = async () => {
    if (confirm("Are you sure you want to leave your squad?")) {
        await supabase.from('profiles').update({ squad_id: null }).eq('id', user.id);
        window.location.reload();
    }
  };

  const kickMember = async (memberId: string) => {
    if (!confirm("Kick this soldier?")) return;
    await supabase.from('profiles').update({ squad_id: null }).eq('id', memberId);
    // On met à jour la liste locale sans recharger
    setMembers(members.filter(m => m.id !== memberId));
  };

  const deleteSquad = async () => {
     if (!confirm("WARNING: This will disband the squad for everyone. Continue?")) return;
     await supabase.from('profiles').update({ squad_id: null }).eq('squad_id', squad.id);
     await supabase.from('squads').delete().eq('id', squad.id);
     window.location.reload();
  };

  const searchPlayers = async () => {
    if(searchQuery.length < 3) return;
    const { data } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${searchQuery}%`)
        .neq('id', user.id)
        .limit(10);
    
    // Filtre : on retire ceux qui sont déjà dans l'équipe
    const currentMemberIds = members.map(m => m.id);
    const filteredResults = (data || []).filter(player => !currentMemberIds.includes(player.id));
    setSearchResults(filteredResults.slice(0, 5));
  };

  const invitePlayer = async (playerId: string) => {
      // Ici on crée une vraie invitation dans la table squad_invitations
      await supabase.from('squad_invitations').insert({
          squad_id: squad.id,
          receiver_id: playerId
      });
      alert("Invitation sent!");
  };

  if (loading) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading Operations...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      <Sidebar />
      <main className="md:ml-20 lg:ml-64 min-h-screen p-6 lg:p-10">
        
        {/* --- CAS 1 : PAS DE SQUAD (Create or Join) --- */}
        {!squad ? (
            <div className="max-w-3xl mx-auto mt-10">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                        <Shield size={40} className="text-indigo-500" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2">Squad Operations</h1>
                    <p className="text-slate-400">Join an existing unit or establish your own command.</p>
                </div>

                {/* TABS SELECTOR */}
                <div className="flex justify-center mb-8">
                    <div className="bg-slate-900 p-1 rounded-xl flex gap-1 border border-slate-800">
                        <button 
                            onClick={() => setViewMode('create')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${viewMode === 'create' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <PlusCircle size={16}/> Create Squad
                        </button>
                        <button 
                            onClick={() => setViewMode('join')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${viewMode === 'join' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Search size={16}/> Join Squad
                        </button>
                    </div>
                </div>

                {/* CONTENT AREA */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm">
                    
                    {viewMode === 'create' ? (
                        /* MODE CRÉATION */
                        <div className="text-center max-w-md mx-auto">
                            <h2 className="text-xl font-bold text-white mb-4">Establish New Squad</h2>
                            <div className="flex gap-3">
                                <input 
                                    type="text" 
                                    placeholder="Squad Name (ex: Team Liquid)" 
                                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition"
                                    value={newSquadName}
                                    onChange={(e) => setNewSquadName(e.target.value)}
                                />
                                <button onClick={createSquad} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-indigo-500/20">
                                    Create
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* MODE RECHERCHE */
                        <div className="max-w-lg mx-auto">
                            <h2 className="text-xl font-bold text-white mb-4 text-center">Find a Squad</h2>
                            <div className="flex gap-3 mb-6">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                    <input 
                                        type="text" 
                                        placeholder="Search squad name..." 
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-indigo-500 outline-none transition"
                                        value={joinSearch}
                                        onChange={(e) => setJoinSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && searchSquads()}
                                    />
                                </div>
                                <button onClick={searchSquads} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition">
                                    Search
                                </button>
                            </div>

                            <div className="space-y-3">
                                {squadsList.length > 0 ? (
                                    squadsList.map((s) => {
                                        const isRequested = requestedSquads.includes(s.id);
                                        return (
                                            <div key={s.id} className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 transition">
                                                <div>
                                                    <p className="font-bold text-white">{s.name}</p>
                                                    <p className="text-xs text-slate-500">Commander: {s.owner?.username || 'Unknown'}</p>
                                                </div>
                                                <button 
                                                    onClick={() => !isRequested && requestJoin(s.id)}
                                                    disabled={isRequested}
                                                    className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition ${isRequested ? 'bg-green-500/10 text-green-500 cursor-default' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'}`}
                                                >
                                                    {isRequested ? 'Request Sent' : <><Send size={12}/> Request Join</>}
                                                </button>
                                            </div>
                                        );
                                    })
                                ) : (
                                    joinSearch.length > 2 && <p className="text-center text-slate-500 text-sm">No squads found.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        ) : (
            
       /* --- CAS 2 : SQUAD ACTIVE (Dashboard existant) --- */
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-slate-800 pb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Shield className="text-indigo-500" size={32} />
                            <h1 className="text-4xl font-black text-white uppercase">{squad.name}</h1>
                        </div>
                        <p className="text-slate-400">Commanded by <span className="text-white font-bold">{members.find(m => m.id === squad.owner_id)?.username || 'Unknown'}</span></p>
                    </div>
                    
                    <div className="mt-4 md:mt-0">
                        {isOwner ? (
                            <button onClick={deleteSquad} className="flex items-center gap-2 text-red-400 hover:text-red-300 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20 transition">
                                <Trash2 size={16} /> Disband Squad
                            </button>
                        ) : (
                            <button onClick={leaveSquad} className="flex items-center gap-2 text-slate-400 hover:text-white bg-slate-800 px-4 py-2 rounded-lg transition">
                                <LogOut size={16} /> Leave Squad
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* COLONNE GAUCHE : LISTE DES MEMBRES */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Users size={20} className="text-indigo-400"/> Active Roster
                        </h2>
                        
                        <div className="grid gap-4">
                            {members.map((member) => (
                                <div key={member.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between group hover:border-slate-700 transition">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 overflow-hidden relative">
                                            <img 
                                                src={member.avatar_url || '/characters/default.png'} 
                                                className="w-full h-full object-cover"
                                                alt={member.username}
                                                onError={(e) => e.currentTarget.src = '/characters/default.png'}
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white text-lg">{member.username}</span>
                                                {squad.owner_id === member.id && <Crown size={14} className="text-yellow-500" />}
                                            </div>
                                            <div className="flex gap-2 text-xs mt-1">
                                                <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded">{member.valo_main_role || 'Flex'}</span>
                                                <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded">{member.lol_main_role || 'Fill'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {isOwner && member.id !== user.id && (
                                        <button 
                                            onClick={() => kickMember(member.id)}
                                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-500/10 p-2 rounded transition"
                                            title="Kick Member"
                                        >
                                            <LogOut size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* COLONNE DROITE : RECRUTEMENT */}
                    <div>
                        {isOwner ? (
                            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 sticky top-6">
                                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <UserPlus className="text-green-400" size={20} /> Recruit
                                </h2>
                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                    <input 
                                        type="text" 
                                        placeholder="Search username..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-white focus:border-indigo-500 outline-none text-sm"
                                        onKeyDown={(e) => e.key === 'Enter' && searchPlayers()}
                                    />
                                </div>
                                <button onClick={searchPlayers} className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg font-bold text-sm mb-4">
                                    Search
                                </button>

                                <div className="space-y-2">
                                    {searchResults.map((result) => (
                                        <div key={result.id} className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-800">
                                            <span className="text-sm font-bold text-slate-300 truncate max-w-[100px]">{result.username}</span>
                                            <button onClick={() => invitePlayer(result.id)} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-500">Invite</button>
                                        </div>
                                    ))}
                                    {searchResults.length === 0 && searchQuery.length > 2 && (
                                        <p className="text-center text-slate-600 text-xs">No users found.</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6">
                                <h3 className="text-indigo-400 font-bold mb-2">Member Access</h3>
                                <p className="text-sm text-slate-400">Only the Squad Commander can recruit new members or change settings.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        )}
      </main>
    </div>
  );
}