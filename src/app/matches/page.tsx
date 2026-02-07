import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Sidebar from '@/components/Sidebar';
import { getSquadMatches, SquadMember } from '@/lib/valorant';
import DetailedMatchCard from '@/components/Matches/DetailedMatchCard';
import { Swords, Users } from 'lucide-react';

export default async function MatchesPage() {
  // 1. Initialisation Supabase Côté Serveur
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {} 
      },
    }
  );

  // 2. Récupérer l'utilisateur connecté (pour savoir quelle est SA squad)
  const { data: { user } } = await supabase.auth.getUser();
  
  let squadProfiles: any[] = [];

  if (user) {
    // 3. Récupérer MON profil
    const { data: myProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (myProfile) {
        // --- LOGIQUE SQUAD (Identique au Dashboard) ---
        if (myProfile.squad_id) {
            // Cas A : J'ai une squad (ID présent) -> Je récupère TOUS les membres de cette squad
            // Cela inclut moi-même et mes potes (s'ils sont dans la table profiles avec le même squad_id)
            const { data: members } = await supabase
                .from('profiles')
                .select('*')
                .eq('squad_id', myProfile.squad_id);
            
            // Sécurité : si la liste est vide (bug), on met au moins mon profil
            squadProfiles = members && members.length > 0 ? members : [myProfile];
        } else {
            // Cas B : Pas de squad -> La liste c'est juste MOI
            squadProfiles = [myProfile];
        }
    }
  }

  // 4. Préparer la liste pour l'API Valorant
  // On ne garde que ceux qui ont un Riot ID valide
  const squadMembers: SquadMember[] = squadProfiles
    .filter((p: any) => p.riot_id)
    .map((p: any) => ({
        profileId: p.id,
        username: p.username,
        riotId: p.riot_id,
        avatarUrl: p.avatar_url || '/characters/default.png'
    }));

  // 5. Récupérer les matchs fusionnés pour TOUTE la squad trouvée
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
                    {/* Message dynamique selon si on est seul ou en équipe */}
                    {squadMembers.length > 1 
                        ? `Opérations de la squad (${squadMembers.length} membres). ${matches.length} missions récupérées.`
                        : `Tes dernières opérations. ${matches.length} missions récupérées.`
                    }
                </p>
            </div>
            
            {/* Squad Avatars (Ceux dont on affiche les matchs) */}
            <div className="flex items-center gap-4 mt-4 md:mt-0">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Squad</span>
                <div className="flex -space-x-2">
                    {squadMembers.length > 0 ? (
                        squadMembers.map(m => (
                            <img 
                                key={m.profileId} 
                                src={m.avatarUrl} 
                                title={m.username}
                                className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 object-cover"
                            />
                        ))
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-xs text-slate-500">?</div>
                    )}
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
                    <p className="text-lg">Aucun match récent trouvé.</p>
                    {squadMembers.length === 0 && (
                        <p className="text-sm text-red-400 mt-2">
                            Attention : Aucun Riot ID lié détecté dans la squad. 
                            Vérifie ton profil (ou ceux de tes équipiers).
                        </p>
                    )}
                </div>
            )}
        </div>

      </main>
    </div>
  );
}