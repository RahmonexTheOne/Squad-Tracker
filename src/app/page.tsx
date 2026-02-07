import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import {
  LayoutDashboard, Activity, Crown,
  ArrowUpRight, Clock, Trophy
} from 'lucide-react';

// Composants
import Sidebar from '@/components/Sidebar';
import PerformanceChart from '@/components/Dashboard/PerformanceChart';
import DiscordBanner from '@/components/Dashboard/DiscordBanner';

// Libs
import { getSquadMMRHistory, SquadMember } from '@/lib/valorant';

// Initialisation Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Interface pour TypeScript
interface ActivityItem {
  username: string;
  type: string;
  oldRank: string;
  newRank: string;
  date: Date;
  tierImg: string;
}

export default async function Dashboard() {
  // 1. Identification de l'utilisateur connecté
  const { data: { user } } = await supabase.auth.getUser();
  let currentUserProfile: any = null;

  // Si pas connecté, on peut quand même afficher une page vide / fallback
  if (user) {
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    currentUserProfile = userProfile;
  }

  // 2. Déterminer la squad courante (tu es owner pour l’instant)
  // On prend la squad dont tu es owner si elle existe,
  // sinon on fallback sur profiles.squad_id.
  let squadId: string | null = currentUserProfile?.squad_id ?? null;

  if (user) {
    const { data: ownedSquad } = await supabase
      .from('squads')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (ownedSquad?.id) {
      squadId = ownedSquad.id;
    }
  }

  // 3. Récupération UNIQUEMENT des profils de ta squad (et qui ont un Riot ID)
  const { data: squadProfilesAll } = squadId
    ? await supabase
        .from('profiles')
        .select('*')
        .or(`squad_id.eq.${squadId},id.eq.${user?.id}`)
    : { data: [] as any[] };

  const squadMembers: SquadMember[] = (squadProfilesAll || [])
    .filter((p: any) => !!p.riot_id)
    .map((p: any) => ({
      profileId: p.id,
      username: p.username,
      riotId: p.riot_id,
      avatarUrl: p.avatar_url || '/characters/default.png',
    }));


  // 5. Récupération des Données Réelles (MMR History)
  const squadMMR = await getSquadMMRHistory(squadMembers);

  // --- LOGIQUE INTELLIGENTE (CALCULS) ---

  // A. CALCUL DU PODIUM 🏆
  const rankings = squadMMR.map(player => {
    const latest = player.data[0];
    const currentRR = latest ? latest.ranking_in_tier : 0;
    const currentTier = latest ? latest.currenttier : 0;
    const tierName = latest ? latest.currenttierpatched : 'Unranked';

    const score = (currentTier * 100) + currentRR;

    const memberInfo = squadMembers.find(m => m.username === player.username);


    console.log("AUTH user.id =", user?.id);
    console.log("currentUserProfile?.id =", currentUserProfile?.id);
    console.log("currentUserProfile?.squad_id =", currentUserProfile?.squad_id);
    console.log("currentUserProfile?.riot_id =", currentUserProfile?.riot_id);

    console.log("ownedSquad?.id =", ownedSquad?.id);
    console.log("FINAL squadId used =", squadId);


    return {
      username: player.username,
      tierName,
      rr: currentRR,
      score,
      avatar: memberInfo?.avatarUrl,
      img: latest?.images?.small,
    };
  }).sort((a, b) => b.score - a.score);

  // B. CALCUL DE L'ACTIVITÉ RÉCENTE ⚡
  const recentActivity: ActivityItem[] = [];

  squadMMR.forEach(player => {
    for (let i = 0; i < player.data.length - 1; i++) {
      const currentMatch = player.data[i];
      const prevMatch = player.data[i + 1];

      if (currentMatch.currenttier > prevMatch.currenttier) {
        recentActivity.push({
          username: player.username,
          type: 'RANK_UP',
          oldRank: prevMatch.currenttierpatched,
          newRank: currentMatch.currenttierpatched,
          date: new Date(currentMatch.date_raw * 1000),
          tierImg: currentMatch.images?.small,
        });
      }
    }
  });

  recentActivity.sort((a, b) => b.date.getTime() - a.date.getTime());
  const latestActivity = recentActivity.slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-20 overflow-x-hidden">
      <Sidebar />

      <main className="md:ml-20 lg:ml-64 p-6 lg:p-12">

        {/* HEADER */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
              <LayoutDashboard className="text-indigo-500" size={36} /> Dashboard
            </h1>
            <p className="text-slate-400">
              Welcome back, <span className="text-white font-bold">{currentUserProfile?.username || 'Agent'}</span>.
            </p>
          </div>

          {/* Petit bouton raccourci */}
          <Link href="/matches">
            <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-sm font-bold transition flex items-center gap-2">
              <Activity size={16} /> View Match History
            </button>
          </Link>
        </div>

        {/* NOTIF DISCORD (Si pas lié) */}
        {currentUserProfile && !currentUserProfile.discord_id && (
          <DiscordBanner />
        )}

        {/* --- SECTION 1 : LE PODIUM (Top Squad) --- */}
        {rankings.length > 0 ? (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="text-yellow-500 fill-yellow-500" size={20} />
              <h2 className="text-xl font-bold text-white">Squad Leaderboard</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* LEADER (1er) */}
              {rankings[0] && (
                <div className="bg-gradient-to-b from-yellow-500/10 to-slate-900 border border-yellow-500/30 rounded-2xl p-6 relative overflow-hidden md:col-span-1 md:row-span-2 flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(234,179,8,0.1)]">
                  <div className="absolute top-0 right-0 p-3 opacity-20"><Crown size={64} /></div>
                  <div className="relative mb-4">
                    <img
                      src={rankings[0].avatar}
                      className="w-24 h-24 rounded-full border-4 border-yellow-500 shadow-xl"
                      alt={rankings[0].username}
                    />
                    <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black font-black w-8 h-8 flex items-center justify-center rounded-full border-4 border-slate-900">
                      1
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-white">{rankings[0].username}</h3>
                  <div className="flex items-center gap-2 mt-2 bg-black/40 px-3 py-1 rounded-lg border border-yellow-500/20">
                    {rankings[0].img && <img src={rankings[0].img} className="w-6 h-6" alt="" />}
                    <span className="text-yellow-400 font-bold">{rankings[0].tierName}</span>
                    <span className="text-xs text-slate-400">({rankings[0].rr} RR)</span>
                  </div>
                </div>
              )}

              {/* SUIVANTS (2e et 3e) - ne s'affichent que s'ils existent */}
              {rankings.slice(1, 3).map((r, i) => (
                <div key={r.username} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 hover:bg-slate-800/50 transition">
                  <div className="relative">
                    <img src={r.avatar} className="w-16 h-16 rounded-full border-2 border-slate-700" alt={r.username} />
                    <div className="absolute -bottom-1 -right-1 bg-slate-700 text-white font-bold w-6 h-6 text-xs flex items-center justify-center rounded-full border-2 border-slate-900">
                      {i + 2}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-white">{r.username}</h4>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      {r.img && <img src={r.img} className="w-4 h-4" alt="" />} {r.tierName}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-8 bg-slate-900/30 border border-slate-800 border-dashed rounded-3xl p-8 text-center">
            <Trophy className="mx-auto mb-2 opacity-50 text-slate-500" size={32} />
            <p className="text-slate-500">No active agents found in your squad.</p>
            <p className="text-xs text-slate-600">Add a Riot ID and ensure your profile is linked to your squad.</p>
          </div>
        )}

        {/* --- SECTION 2 : CHART & ACTIVITÉ --- */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* GRAPHIQUE (2/3) */}
          <div className="xl:col-span-2 space-y-6">
            {squadMMR.length > 0 ? (
              <PerformanceChart mmrData={squadMMR} />
            ) : (
              <div className="h-[300px] bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed flex items-center justify-center text-slate-500">
                <Activity className="mb-2 mr-2 opacity-50" />
                No Match Data Available
              </div>
            )}
          </div>

          {/* ACTIVITÉ RÉCENTE (1/3) */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 h-full">
              <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                <ArrowUpRight className="text-green-400" /> Recent Promotions
              </h3>

              {latestActivity.length > 0 ? (
                <div className="space-y-6 relative">
                  <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-800"></div>

                  {latestActivity.map((act, i) => (
                    <div key={i} className="relative pl-8 animate-in slide-in-from-right-2" style={{ animationDelay: `${i * 100}ms` }}>
                      <div className="absolute left-0 top-1 w-4 h-4 bg-slate-900 border-2 border-green-500 rounded-full z-10"></div>

                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-slate-300">
                            <span className="text-white font-bold">{act.username}</span> promoted to{' '}
                            <span className="text-green-400 font-bold">{act.newRank}</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <Clock size={10} /> {act.date.toLocaleDateString()}
                          </p>
                        </div>
                        {act.tierImg && <img src={act.tierImg} className="w-8 h-8 opacity-80" alt="" />}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 text-sm">
                  <Trophy size={32} className="mx-auto mb-2 opacity-20" />
                  No rank ups detected recently.<br />Time to grind!
                </div>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
