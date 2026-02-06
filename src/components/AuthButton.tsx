"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { LogIn, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function AuthButton() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(data);
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if(!session) setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  // CASE 1: Connected
  if (user && profile) {
    return (
      <div className="flex flex-col gap-2">
        <div className="bg-slate-800/80 rounded-xl p-3 flex items-center gap-3 border border-indigo-500/30">
             <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs border border-indigo-400">
                {profile.username ? profile.username[0].toUpperCase() : 'U'}
             </div>
          <div className="hidden lg:block overflow-hidden">
            <p className="text-sm font-bold text-white truncate w-24">{profile.username}</p>
            <p className="text-[10px] text-green-400 font-mono">ONLINE</p>
          </div>
        </div>
        
        <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-2 pl-2 mt-1">
            <LogOut size={12} /> Logout
        </button>
      </div>
    );
  }

  // CASE 2: Not Connected (Login Button)
  return (
    <Link href="/login" className="w-full block">
        <div className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl flex items-center gap-3 transition font-bold shadow-lg shadow-indigo-500/20 cursor-pointer">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <LogIn size={18} />
        </div>
        <div className="hidden lg:block text-left">
            <p className="text-xs text-white/80">Member Access</p>
            <p className="text-sm">Log In</p>
        </div>
        </div>
    </Link>
  );
}