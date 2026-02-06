import { Users, Crosshair, Trophy } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-indigo-600">
          SQUAD TRACKER
        </h1>
        <p className="text-slate-400 mt-2">Le QG des 20 légendes (et des feeders)</p>
      </div>

      {/* Grid Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        
        {/* Widget 1 : Discord Live */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500 transition">
          <div className="flex items-center gap-3 mb-4">
            <Users className="text-indigo-400" />
            <h2 className="text-xl font-bold">En Ligne</h2>
          </div>
          <div className="text-3xl font-mono text-green-400">5 <span className="text-sm text-slate-500">membres</span></div>
          <p className="text-sm text-slate-400 mt-2">En vocal: Général</p>
        </div>

        {/* Widget 2 : Top Killer */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-red-500 transition relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Crosshair size={100} />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="text-yellow-500" />
            <h2 className="text-xl font-bold">MVP Semaine</h2>
          </div>
          <div className="text-2xl font-bold">PseudoDuPote</div>
          <div className="text-sm text-yellow-500 mt-1">K/D: 2.45 (Monstrueux)</div>
        </div>

        {/* Widget 3 : Le Feeder (Humour) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-pink-500 transition">
           <h2 className="text-xl font-bold text-pink-500 mb-2">Le "Sac à Dos" 🎒</h2>
           <p className="text-slate-300">Celui qui s'est fait carry hier soir :</p>
           <p className="text-xl font-bold mt-2">PseudoDuNoob</p>
           <p className="text-xs text-slate-500">3 kills / 18 morts (Aïe)</p>
        </div>

      </div>
    </main>
  );
}