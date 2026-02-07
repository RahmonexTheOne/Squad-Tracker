import Sidebar from '@/components/Sidebar';
import { Trophy, Swords, Shield } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      <Sidebar />
      
      <main className="md:ml-20 lg:ml-64 min-h-screen pb-20 overflow-x-hidden relative">
        
        {/* --- HEADER SKELETON --- */}
        <div className="relative h-96 bg-slate-900 flex flex-col items-center justify-center border-b border-white/5 shadow-2xl z-10 overflow-hidden">
            {/* Effet Shimmer (Brillance qui passe) */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" style={{ transform: 'skewX(-20deg) translateX(-150%)' }}></div>
            
            <div className="z-10 text-center flex flex-col items-center gap-4">
                <div className="w-48 h-10 bg-slate-800 rounded-full animate-pulse"></div>
                <div className="w-96 h-20 bg-slate-800 rounded-2xl animate-pulse"></div>
            </div>

            {/* SWITCHER SKELETON */}
            <div className="absolute -bottom-7 z-20 flex bg-slate-950 p-2 rounded-full border border-slate-800 gap-2">
                <div className="w-32 h-10 bg-slate-800 rounded-full animate-pulse"></div>
                <div className="w-32 h-10 bg-slate-800/50 rounded-full animate-pulse"></div>
            </div>
        </div>

        <div className="p-6 lg:p-12 max-w-6xl mx-auto mt-16 relative z-0 space-y-8">
            {/* On affiche 3 fausses cartes pour simuler le chargement */}
            {[1, 2, 3].map((i) => (
                <div key={i} className="relative bg-slate-900/80 border border-slate-800 rounded-3xl h-40 overflow-hidden">
                    <div className="p-8 flex items-center justify-between gap-6 h-full">
                        
                        {/* Gauche: Rank + Avatar */}
                        <div className="flex items-center gap-8">
                            <div className="w-16 h-16 bg-slate-800 rounded-lg animate-pulse"></div>
                            <div className="flex items-center gap-5">
                                <div className="w-20 h-20 bg-slate-800 rounded-2xl animate-pulse"></div>
                                <div className="space-y-3">
                                    <div className="w-48 h-8 bg-slate-800 rounded-lg animate-pulse"></div>
                                    <div className="w-24 h-6 bg-slate-800/50 rounded-md animate-pulse"></div>
                                </div>
                            </div>
                        </div>

                        {/* Droite: Rank Info */}
                        <div className="hidden md:flex flex-col items-end gap-2">
                            <div className="w-32 h-8 bg-slate-800 rounded-lg animate-pulse"></div>
                            <div className="w-16 h-4 bg-slate-800/50 rounded animate-pulse"></div>
                        </div>
                    </div>
                    
                    {/* Shimmer Effect Global */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" style={{ content: '""' }}></div>
                </div>
            ))}
        </div>
      </main>
    </div>
  );
}