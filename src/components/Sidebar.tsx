"use client";

import { useState, useEffect } from 'react';
import { 
  Activity, Trophy, Swords, Shield, Gamepad2, 
  Settings, Search, LogOut 
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // --- STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);

  // --- FETCH USER DATA ---
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', user.id)
          .single();
        
        if (profile) {
            setUserProfile(profile);
        }
      }
    };
    getUser();
  }, [supabase]);

  // --- ACTIONS ---
  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim().length > 0) {
      router.push(`/profile/${searchQuery}`);
      setSearchQuery('');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh(); // Rafraîchit la page pour rediriger vers le login si nécessaire
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-20 lg:w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 flex flex-col hidden md:flex z-50">
        
        {/* --- LOGO --- */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
            <Gamepad2 className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-white tracking-tight hidden lg:block">
            SQUAD <span className="text-indigo-500">TRACKER</span>
          </span>
        </div>

        {/* --- SEARCH BAR --- */}
        <div className="px-4 mb-4">
            <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 pointer-events-none">
                    <Search size={18} />
                </div>
                
                <input 
                    type="text" 
                    placeholder="Find agent..." 
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg py-2.5 pl-10 pr-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all hidden lg:block placeholder:text-slate-600"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearch}
                />
                
                <div className="lg:hidden w-10 h-10 flex items-center justify-center bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-700 transition">
                    <Search size={18} className="text-slate-400"/>
                </div>
            </div>
        </div>

        {/* --- NAVIGATION --- */}
        <nav className="flex-1 px-4 space-y-2">
          <NavItem href="/" icon={<Activity />} label="Dashboard" active={pathname === '/'} />
          <NavItem href="/leaderboard" icon={<Trophy />} label="Leaderboard" active={pathname === '/leaderboard'} />
          <NavItem href="/matches" icon={<Swords />} label="Matches & Stats" active={pathname === '/matches'} />
          
          <div className="h-px bg-slate-800 my-2 mx-2"></div>
          
          <NavItem href="/squad" icon={<Shield />} label="My Squad" active={pathname === '/squad'} />
          <NavItem href="/settings" icon={<Settings />} label="Settings" active={pathname === '/settings'} />
        </nav>

        {/* --- USER PROFILE SECTION (CLEAN) --- */}
        <div className="p-4 border-t border-slate-800 flex items-center gap-2">
            {userProfile ? (
                <Link href={`/profile/${userProfile.username}`} className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/50 transition cursor-pointer group border border-transparent hover:border-slate-700">
                        {/* Avatar */}
                        <div className="relative w-10 h-10 shrink-0">
                            <img 
                                src={userProfile.avatar_url || '/characters/default.png'} 
                                className="w-full h-full rounded-full object-cover bg-slate-950 border border-slate-700 group-hover:border-indigo-500 transition"
                                alt="User"
                            />
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-900"></div>
                        </div>
                        
                        {/* Name & Title */}
                        <div className="hidden lg:block overflow-hidden">
                            <p className="text-sm font-bold text-white truncate group-hover:text-indigo-400 transition">{userProfile.username}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">View Profile</p>
                        </div>
                    </div>
                </Link>
            ) : (
               // Loading state
               <div className="flex-1 flex items-center gap-3 p-2 animate-pulse">
                   <div className="w-10 h-10 rounded-full bg-slate-800"></div>
                   <div className="hidden lg:block space-y-2">
                       <div className="w-20 h-3 bg-slate-800 rounded"></div>
                       <div className="w-12 h-2 bg-slate-800 rounded"></div>
                   </div>
               </div>
            )}

            {/* BOUTON DE DECONNEXION */}
            <button 
                onClick={handleSignOut}
                className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition border border-transparent hover:border-red-500/20"
                title="Sign Out"
            >
                <LogOut size={20} />
            </button>
        </div>
    </aside>
  );
}

function NavItem({ href, icon, label, active }: any) {
    return (
      <Link href={href}>
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
          <div className="shrink-0">{icon}</div> 
          <span className="text-sm font-medium hidden lg:block">{label}</span>
        </div>
      </Link>
    );
}