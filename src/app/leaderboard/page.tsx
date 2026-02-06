import { Trophy, ArrowLeft, Crown } from 'lucide-react'; // Ajout de Crown ici
import Link from 'next/link';

export default function LeaderboardPage() {
  const leaderboardData = [
    { rank: 1, name: "JettMain", rr: 450, tier: "Radiant", kda: "1.8", main: "Jett" },
    { rank: 2, name: "DarkSasukeDu93", rr: 312, tier: "Immortal 3", kda: "1.4", main: "Reyna" },
    { rank: 3, name: "SageHeal", rr: 289, tier: "Immortal 2", kda: "0.9", main: "Sage" },
    { rank: 4, name: "OmenOneTrick", rr: 210, tier: "Immortal 1", kda: "1.1", main: "Omen" },
    { rank: 5, name: "SovaLineups", rr: 180, tier: "Ascendant 3", kda: "1.0", main: "Sova" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-6 lg:p-10">
      
      {/* Header avec bouton retour */}
      <div className="max-w-5xl mx-auto mb-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20 text-yellow-500">
                <Trophy size={32} />
            </div>
            <div>
                <h1 className="text-3xl font-black text-white">Global Ranking</h1>
                <p className="text-slate-400">Who is the real carry?</p>
            </div>
        </div>
        <Link href="/" className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-full text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-2">
            <ArrowLeft size={16} /> Back to HQ
        </Link>
      </div>

      {/* Tableau de classement */}
      <div className="max-w-5xl mx-auto bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-950/50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800">
                        <th className="p-6 font-bold">Rank</th>
                        <th className="p-6 font-bold">Player</th>
                        <th className="p-6 font-bold">Tier / RR</th>
                        <th className="p-6 font-bold text-center">Main</th>
                        <th className="p-6 font-bold text-right">K/D Ratio</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                    {leaderboardData.map((player, index) => (
                        <tr key={index} className="hover:bg-slate-800/30 transition group">
                            <td className="p-6">
                                <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-black text-lg ${
                                    index === 0 ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 
                                    index === 1 ? 'bg-slate-300 text-black' : 
                                    index === 2 ? 'bg-orange-700 text-white' : 
                                    'text-slate-500 bg-slate-900'
                                }`}>
                                    {player.rank}
                                </div>
                            </td>
                            <td className="p-6 font-bold text-white text-lg flex items-center gap-3">
                                {/* Correction : utilisation de 'index' au lieu de 'player.index' */}
                                {index === 0 && <Crown size={16} className="text-yellow-500" />}
                                {player.name}
                            </td>
                            <td className="p-6">
                                <div className="font-mono font-bold text-slate-200">{player.tier}</div>
                                <div className="text-xs text-slate-500">{player.rr} RR</div>
                            </td>
                            <td className="p-6 text-center">
                                <span className="px-3 py-1 bg-slate-800 rounded text-xs font-bold text-slate-400 border border-slate-700">
                                    {player.main}
                                </span>
                            </td>
                            <td className="p-6 text-right font-mono text-green-400 font-bold">
                                {player.kda}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}