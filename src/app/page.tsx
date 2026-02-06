"use client"; // On passe en client pour vérifier le profil

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  Users, Trophy, Skull, Bell, Search, Menu, Crown, PlusCircle 
} from 'lucide-react';
import Link from 'next/link';
// Imports des composants
import Sidebar from '@/components/Sidebar';
import PodiumCharacter from '@/components/PodiumCharacter';

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data);
      }
      setLoading(false);
    };
    getData();
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading HQ...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* 1. ON UTILISE NOTRE NOUVELLE SIDEBAR ICI */}
      <Sidebar />

      <main className="md:ml-20 lg:ml-64 min-h-screen pb-20">
        
        {/* HEADER */}
        <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50 h-16 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Menu className="md:hidden text-slate-400" />
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="text" placeholder="Search..." className="bg-slate-900 border border-slate-800 rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 transition w-64 text-white" />
            </div>
          </div>
          <button className="relative p-2 hover:bg-slate-800 rounded-full transition"><Bell className="w-5 h-5 text-slate-400" /></button>
        </header>

        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Squad Dashboard</h1>
              <p className="text-slate-400">Welcome back, {profile?.username || 'Soldier'}.</p>
            </div>
          </div>

          {/* --- LOGIQUE CONDITIONNELLE : A-T-IL UNE SQUAD ? --- */}
          
          {!profile?.squad_id ? (
             /* CAS 1 : PAS DE SQUAD -> Empty State */
             <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
                    <Users size={40} className="text-indigo-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">No Squad Found</h2>
                <p className="text-slate-400 max-w-md mb-8">You are currently a lone wolf. Create a Squad or ask a friend to invite you to start tracking stats together.</p>
                <Link href="/settings">
                    <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-2 transition shadow-lg shadow-indigo-500/20">
                        <PlusCircle size={20} /> Create or Join a Squad
                    </button>
                </Link>
             </div>
          ) : (
             /* CAS 2 : IL A UNE SQUAD -> On affiche le Podium */
             <div className="relative">
                 {/* ... (Ici tu remettras ton code PodiumCharacter, je le raccourcis pour la lisibilité) ... */}
                 <div className="flex items-center gap-2 mb-8">
                    <Crown className="text-yellow-500" />
                    <h2 className="text-2xl font-bold text-white">Top Grinders</h2>
                 </div>
                 <div className="text-center p-10 bg-slate-900 rounded-xl border border-slate-800">
                    <p className="text-green-400">✅ SQUAD ACTIVE - DATA LOADING...</p>
                    {/* Remets ton composant Podium ici */}
                 </div>
             </div>
          )}

        </div>
      </main>
    </div>
  );
}