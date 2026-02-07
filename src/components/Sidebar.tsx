"use client";

import { useState, useEffect, useRef } from 'react';
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
  const [searchResults, setSearchResults] = useState<any[]>([]); // Résultats de la recherche
  const [isSearching, setIsSearching] = useState(false); // Pour le loading
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Pour fermer le dropdown si on clique ailleurs
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // --- 1. FETCH USER CONNECTÉ ---
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', user.id)
          .single();
        if (profile) setUserProfile(profile);
      }
    };
    getUser();
  }, [supabase]);

  // --- 2. RECHERCHE EN DIRECT (Debounce) ---
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      const { data } = await supabase
        .from('profiles')
        .select('username, avatar_url, riot_id')
        .ilike('username', `%${searchQuery}%`) // Recherche insensible à la casse
        .limit(5); // Max 5 résultats
      
      setSearchResults(data || []);
      setIsSearching(false);
    };

    // On attend 300ms après la frappe pour éviter trop de requêtes
    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, supabase]);

  // --- 3. ACTIONS ---
  
  // Touche Entrée : Va sur le premier résultat si dispo
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (searchResults.length > 0) {
        // Redirige vers le premier résultat trouvé
        router.push(`/profile/${searchResults[0].username}`);
        setSearchQuery('');
        setSearchResults([]);
      } else {
        // Optionnel : Empêcher la recherche si rien n'est trouvé
        // alert("No agent found.");
      }
    }
  };

  const handleSelectUser = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  // Fermer les résultats si on clique dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

        {/* --- SEARCH BAR INTELLIGENTE --- */}
        <div className="px-4 mb-4 relative" ref={searchContainerRef}>
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
                    onKeyDown={handleKeyDown}
                />

                {/* Loading Indicator (Petit spinner à droite) */}
                {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:block">
                        <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
                
                {/* Icone Mobile */}
                <div className="lg:hidden w-10 h-10 flex items-center justify-center bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-700 transition">
                    <Search size={18} className="text-slate-400"/>
                </div>
            </div>

            {/* --- LISTE DÉROULANTE DES RÉSULTATS --- */}
            {searchResults.length > 0 && searchQuery.length >= 2 && (
                <div className="absolute top-full left-4 right-4 bg-slate-900 border border-slate-700 rounded-xl mt-2 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    {searchResults.map((user) => (
                        <Link 
                            key={user.username} 
                            href={`/profile/${user.username}`}
                            onClick={handleSelectUser}
                        >
                            <div className="flex items-center gap-3 p-3 hover:bg-slate-800 cursor-pointer transition border-b border-slate-800/50 last:border-0">
                                <img 
                                    src={user.avatar_url || '/characters/default.png'} 
                                    className="w-8 h-8 rounded-full object-cover border border-slate-600"
                                    alt={user.username}
                                />
                                <div className="overflow-hidden">
                                    <p className="text-sm font-bold text-white truncate">{user.username}</p>
                                    {user.riot_id && <p className="text-[10px] text-slate-500 truncate">{user.riot_id}</p>}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
            
            {/* MESSAGE "AUCUN RÉSULTAT" */}
            {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                <div className="absolute top-full left-4 right-4 bg-slate-900 border border-slate-700 rounded-xl mt-2 p-3 text-center z-50 shadow-xl">
                    <p className="text-xs text-slate-500">No agent found.</p>
                </div>
            )}
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

        {/* --- USER PROFILE SECTION --- */}
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
               <div className="flex-1 flex items-center gap-3 p-2 animate-pulse">
                   <div className="w-10 h-10 rounded-full bg-slate-800"></div>
                   <div className="hidden lg:block space-y-2">
                       <div className="w-20 h-3 bg-slate-800 rounded"></div>
                       <div className="w-12 h-2 bg-slate-800 rounded"></div>
                   </div>
               </div>
            )}

            {/* Logout */}
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