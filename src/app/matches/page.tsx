import { createClient } from '@supabase/supabase-js';
import Sidebar from '@/components/Sidebar';
import { getSquadMatches, SquadMember } from '@/lib/valorant';
import DetailedMatchCard from '@/components/Matches/DetailedMatchCard';
import { Swords, Users } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function MatchesPage() {
  
  // 1. Récupérer la Squad (Simulation ou requête réelle)
  // Ici je prends tous les profils qui ont un Riot ID pour l'exemple
  // Dans le futur : .from('squad_members').select('profiles(*)')
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, riot_id, avatar_url')
    .not('riot_id', 'is', null);

  const squadMembers: SquadMember[] = (profiles || []).map((p: any) => ({
      profileId: p.id,
      username: p.username,
      riotId: p.riot_id,
      avatarUrl: p.avatar_url
  }));

  // 2. Récupérer les matchs fusionnés
  const matches = await getSquadMatches(squadMembers);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-20">
      <Sidebar />
      
      <main className="md:ml-20 lg:ml-64 p-6 lg:p-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-slate-800 pb-6">
            <div>
                <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
                    <Swords className="text-indigo-500" size={36}/> War Room History
                </h1>
                <p className="text-slate-400">
                    Dernières opérations de la squad. {matches.length} missions récupérées.
                </p>
            </div>
            
            {/* Squad Avatars */}
            <div className="flex items-center gap-4 mt-4 md:mt-0">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Squad</span>
                <div className="flex -space-x-2">
                    {squadMembers.map(m => (
                        <img 
                            key={m.profileId} 
                            src={m.avatarUrl || '/characters/default.png'} 
                            title={m.username}
                            className="w-8 h-8 rounded-full border border-slate-900 bg-slate-800"
                        />
                    ))}
                </div>
            </div>
        </div>

        {/* Liste des Matchs */}
        <div className="space-y-4 max-w-5xl mx-auto">
            {matches.length > 0 ? (
                matches.map((match: any) => (
                    <DetailedMatchCard 
                        key={match.metadata.matchid} 
                        match={match} 
                        squadMembers={squadMembers} 
                    />
                ))
            ) : (
                <div className="text-center py-20 text-slate-500 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed">
                    <Users size={48} className="mx-auto mb-4 opacity-50"/>
                    <p className="text-lg">Aucun match récent trouvé pour la squad.</p>
                    <p className="text-sm">Vérifiez que les Riot IDs sont bien configurés.</p>
                </div>
            )}
        </div>

      </main>
    </div>
  );
}