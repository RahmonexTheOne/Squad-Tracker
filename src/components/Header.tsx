'use client';

import { useState } from 'react';
import { Search, Bell } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header({ userProfile }: { userProfile: any }) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length > 0) {
      // Redirection vers la page de profil cherchée
      router.push(`/profile/${query}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50 h-16 px-6 flex items-center justify-between mb-8">
        
        {/* BARRE DE RECHERCHE */}
        <form onSubmit={handleSearch} className="relative hidden sm:block group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition" />
            <input 
                type="text" 
                placeholder="Search agent..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition w-64 text-white placeholder:text-slate-600" 
            />
        </form>

        {/* PROFIL A DROITE */}
        <div className="flex items-center gap-4 ml-auto">
            <button className="relative p-2 hover:bg-slate-800 rounded-full transition text-slate-400 hover:text-white">
                <Bell className="w-5 h-5" />
                {/* Petit point rouge si notif (optionnel) */}
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-950"></span>
            </button>

            {userProfile && (
                <Link href={`/profile/${userProfile.username}`} className="flex items-center gap-3 pl-2 hover:opacity-80 transition">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-white">{userProfile.username}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{userProfile.riot_id || 'No ID'}</p>
                    </div>
                    <img 
                        src={userProfile.avatar_url || '/characters/default.png'} 
                        className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 object-cover" 
                        alt="Avatar"
                    />
                </Link>
            )}
        </div>
    </header>
  );
}