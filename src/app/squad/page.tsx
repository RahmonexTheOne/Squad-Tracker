"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Users, Shield, UserPlus, LogOut, Crown, Trash2, Search } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function SquadPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [squad, setSquad] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [isOwner, setIsOwner] = useState(false);

  // Pour la création
  const [newSquadName, setNewSquadName] = useState('');

  // Pour l'invitation
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    fetchSquadData();
  }, []);

  const fetchSquadData = async () => {
    // 1. Qui suis-je ?
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        setLoading(false);
        return;
    }
    setUser(user);

    // 2. Mon profil
    const { data: profile } = await supabase.from('profiles').select('squad_id').eq('id', user.id).single();

    if (profile?.squad_id) {
      // 3. Infos de la Squad
      const { data: squadData } = await supabase.from('squads').select('*').eq('id', profile.squad_id).single();
      
      if (squadData) {
          setSquad(squadData);
          
          // 4. Membres
          const { data: membersData } = await supabase.from('profiles').select('*').eq('squad_id', profile.squad_id);
          setMembers(membersData || []);

          // 5. Suis-je le chef ?
          if (squadData.owner_id === user.id) {
            setIsOwner(true);
          }
      }
    }
    setLoading(false);
  };

  // --- ACTIONS ---

  const createSquad = async () => {
    if (!newSquadName) return;
    
    // Créer la squad
    const { data: newSquad, error } = await supabase
        .from('squads')
        .insert({ name: newSquadName, owner_id: user.id })
        .select()
        .single();
    
    if (error) return alert(error.message);

    // Mettre à jour mon profil pour rejoindre cette squad
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
    fetchSquadData();
  };

  const deleteSquad = async () => {
     if (!confirm("WARNING: This will disband the squad for everyone. Continue?")) return;
     await supabase.from('profiles').update({ squad_id: null }).eq('squad_id', squad.id);
     await supabase.from('squads').delete().eq('id', squad.id);
     window.location.reload();
  };

  const searchPlayers = async () => {
    if(searchQuery.length < 3) return;
    
    // 1. On cherche les profils qui matchent le pseudo
    const { data } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${searchQuery}%`)
        .neq('id', user.id) // 🚫 EXCLU : Moi-même (l'utilisateur connecté)
        .limit(10); // On en prend un peu plus pour filtrer après

    // 2. FILTRE CLIENT : On retire ceux qui sont DÉJÀ dans l'équipe
    // On crée une liste des IDs des membres actuels
    const currentMemberIds = members.map(m => m.id);
    
    // On garde uniquement ceux qui NE SONT PAS dans cette liste
    const filteredResults = (data || []).filter(player => !currentMemberIds.includes(player.id));

    // On met à jour l'affichage (max 5 résultats)
    setSearchResults(filteredResults.slice(0, 5));
  };

  const invitePlayer = async (playerId: string) => {
      alert("Feature d'invitation (Notification) à venir ! Pour l'instant, dis à ton pote de créer un compte.");
  };

  if (loading) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading Operations...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      <Sidebar />
      <main className="md:ml-20 lg:ml-64 min-h-screen p-6 lg:p-10">
        
        {/* --- CAS 1 : PAS DE SQUAD --- */}
        {!squad ? (
            <div className="max-w-2xl mx-auto mt-20 text-center">
                <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
                    <Shield size={48} className="text-indigo-500" />
                </div>
                <h1 className="text-3xl font-black text-white mb-2">No Squad Active</h1>
                <p className="text-slate-400 mb-8">Create your own squad to start tracking stats with your team.</p>
                
                <div className="flex gap-4 justify-center">
                    <input 
                        type="text" 
                        placeholder="Squad Name (ex: Team Liquid)" 
                        className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
                        value={newSquadName}
                        onChange={(e) => setNewSquadName(e.target.value)}
                    />
                    <button onClick={createSquad} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition">
                        Create Squad
                    </button>
                </div>
            </div>
        ) : (
            
        /* --- CAS 2 : SQUAD ACTIVE --- */
            <div className="max-w-5xl mx-auto">
                {/* Header Squad */}
                <div className="flex justify-between items-end mb-8 border-b border-slate-800 pb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Shield className="text-indigo-500" size={32} />
                            <h1 className="text-4xl font-black text-white uppercase">{squad.name}</h1>
                        </div>
                        <p className="text-slate-400">Commanded by <span className="text-white font-bold">{members.find(m => m.id === squad.owner_id)?.username || 'Unknown'}</span></p>
                    </div>
                    
                    <div>
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
                                <div key={member.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 overflow-hidden relative">
                                            {/* CORRECTION ICI : On utilise un OU (||) pour éviter le vide */}
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
                                    />
                                </div>
                                <button onClick={searchPlayers} className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg font-bold text-sm mb-4">
                                    Search
                                </button>

                                <div className="space-y-2">
                                    {searchResults.map((result) => (
                                        <div key={result.id} className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-800">
                                            <span className="text-sm font-bold text-slate-300">{result.username}</span>
                                            <button onClick={() => invitePlayer(result.id)} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-500">Invite</button>
                                        </div>
                                    ))}
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