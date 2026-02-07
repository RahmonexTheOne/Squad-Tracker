import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import SquadInviteBanner from '@/components/Dashboard/SquadInviteBanner';
import { 
  LayoutDashboard, Users, Trophy, Activity, Crown, 
  ArrowUpRight, Clock, PlusCircle 
} from 'lucide-react';

// Composants
import Sidebar from '@/components/Sidebar';
import PerformanceChart from '@/components/Dashboard/PerformanceChart';
import DiscordBanner from '@/components/Dashboard/DiscordBanner';
import PodiumCharacter from '@/components/PodiumCharacter'; 

// Libs
import { getSquadMMRHistory, SquadMember } from '@/lib/valorant';

interface ActivityItem {
  username: string;
  type: string;
  oldRank: string;
  newRank: string;
  date: Date;
  tierImg: string;
}

export default async function Dashboard() {
  console.log("\n--- 🔍 DEBUG DASHBOARD START ---");

  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  
  let currentUserProfile = null;
  let squadProfiles: any[] = [];
  let pendingNotifications: any[] = [];

  // --- LOGIC START ---
  if (user) {
    // 1. Get MY Profile
    const { data: myProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    
    currentUserProfile = myProfile;
    
    if(myProfile) {
        // 2. FETCH NOTIFICATIONS (Invitations + Requests)
        
        // A. Invites sent TO me
        const { data: invitations } = await supabase
          .from('squad_invitations')
          .select('id, squad_id, squads(name)')
          .eq('receiver_id', user.id);
        
        if (invitations) {
          invitations.forEach(inv => pendingNotifications.push({ ...inv, type: 'INVITE' }));
        }

        // B. Join Requests sent TO my squad (if I am owner)
        const { data: myOwnedSquads } = await supabase.from('squads').select('id').eq('owner_id', user.id);
        if (myOwnedSquads && myOwnedSquads.length > 0) {
            const squadIds = myOwnedSquads.map(s => s.id);
            const { data: requests } = await supabase
              .from('squad_requests')
              .select('id, user_id, squad_id, profiles(username)')
              .in('squad_id', squadIds);
            
            if (requests) {
              requests.forEach(req => pendingNotifications.push({ ...req, type: 'REQUEST' }));
            }
        }

        // 3. SQUAD LOGIC
        if (myProfile.squad_id) {
            const { data: members } = await supabase
                .from('profiles')
                .select('*')
                .eq('squad_id', myProfile.squad_id);
            squadProfiles = members && members.length > 0 ? members : [myProfile];
        } else {
            squadProfiles = [myProfile];
        }
    }
  }

  // 4. Valorant API Prep
  const squadMembers: SquadMember[] = squadProfiles
    .filter((p: any) => p.riot_id) 
    .map((p: any) => ({
        profileId: p.id,
        username: p.username,
        riotId: p.riot_id,
        avatarUrl: p.avatar_url || '/characters/default.png'
    }));

  const squadMMR = await getSquadMMRHistory(squadMembers);

  // 5. Rankings & Activity logic
  const rankings = squadMMR.map(player => {
    const latest = player.data[0];
    const currentRR = latest ? latest.ranking_in_tier : 0;
    const currentTier = latest ? latest.currenttier : 0;
    const score = (currentTier * 100) + currentRR;
    const memberInfo = squadMembers.find(m => m.username === player.username);
    return {
      username: player.username,
      tierName: latest ? latest.currenttierpatched : "Unranked",
      rr: currentRR,
      score,
      avatar: memberInfo?.avatarUrl,
      img: latest?.images?.small, 
      characterPath: `/characters/${player.username}.png`
    };
  }).sort((a, b) => b.score - a.score); 

  const recentActivity: ActivityItem[] = [];
  squadMMR.forEach(player => {
    for (let i = 0; i < player.data.length - 1; i++) {
        const currentMatch = player.data[i];
        const prevMatch = player.data[i+1];
        if (currentMatch.currenttier > prevMatch.currenttier) {
            recentActivity.push({
                username: player.username,
                type: 'RANK_UP',
                oldRank: prevMatch.currenttierpatched,
                newRank: currentMatch.currenttierpatched,
                date: new Date(currentMatch.date_raw * 1000),
                tierImg: currentMatch.images?.small
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
        
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
                    <LayoutDashboard className="text-indigo-500" size={36}/> Dashboard
                </h1>
                <p className="text-slate-400">
                    Welcome back, <span className="text-white font-bold">{currentUserProfile?.username || 'Agent'}</span>.
                </p>
            </div>
            <Link href="/matches">
                <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-sm font-bold transition flex items-center gap-2">
                    <Activity size={16}/> View Match History
                </button>
            </Link>
        </div>

        {/* --- NOTIFICATIONS SECTION --- */}
        <div className="space-y-4 mb-8">
            {currentUserProfile && !currentUserProfile.discord_id && <DiscordBanner />}
            
            {/* Fix: We only render the banner if user.id exists to satisfy TypeScript */}
            {pendingNotifications.length > 0 && user?.id && (
                <SquadInviteBanner 
                    notifications={pendingNotifications} 
                    userId={user.id} 
                />
            )}
        </div>

        {/* --- LEADERBOARD PODIUM --- */}
        {rankings.length > 0 ? (
            <div className="mb-12">
                <div className="flex items-center gap-2 mb-6 justify-center md:justify-start">
                    <Crown className="text-yellow-500 fill-yellow-500" size={24}/>
                    <h2 className="text-2xl font-bold text-white">Squad Leaderboard</h2>
                </div>
                
                <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8 h-auto md:h-96 pt-10">
                    {rankings[1] && (
                        <div className="order-2 md:order-1 flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700 delay-100">
                             <div className="relative mb-2">
                                <PodiumCharacter path={rankings[1].characterPath} alt={rankings[1].username} />
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center w-full whitespace-nowrap">
                                    <span className="font-bold text-white text-lg">{rankings[1].username}</span>
                                    <div className="flex items-center gap-1 text-xs text-slate-400 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                                        <img src={rankings[1].img} className="w-3 h-3"/> {rankings[1].tierName}
                                    </div>
                                </div>
                             </div>
                             <div className="w-24 md:w-32 h-32 md:h-40 bg-gradient-to-t from-slate-900 to-slate-800 border-t-4 border-slate-600 rounded-t-lg flex items-start justify-center pt-4 shadow-xl">
                                 <span className="text-4xl font-black text-slate-600/50">2</span>
                             </div>
                        </div>
                    )}

                    {rankings[0] && (
                        <div className="order-1 md:order-2 flex flex-col items-center z-10 animate-in slide-in-from-bottom-12 duration-700">
                             <div className="relative mb-2">
                                <Crown className="absolute -top-16 left-1/2 -translate-x-1/2 text-yellow-500 fill-yellow-500 animate-bounce" size={32}/>
                                <PodiumCharacter path={rankings[0].characterPath} alt={rankings[0].username} />
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center w-full whitespace-nowrap">
                                    <span className="font-bold text-yellow-400 text-xl drop-shadow-md">{rankings[0].username}</span>
                                    <div className="flex items-center gap-1 text-xs text-black font-bold bg-yellow-500 px-2 py-0.5 rounded shadow-lg">
                                        <img src={rankings[0].img} className="w-3 h-3"/> {rankings[0].tierName} ({rankings[0].rr} RR)
                                    </div>
                                </div>
                             </div>
                             <div className="w-28 md:w-40 h-40 md:h-52 bg-gradient-to-t from-yellow-900/40 to-yellow-600/20 border-t-4 border-yellow-500 rounded-t-lg flex items-start justify-center pt-4 shadow-[0_0_50px_rgba(234,179,8,0.2)] backdrop-blur-sm relative overflow-hidden">
                                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                                 <span className="text-6xl font-black text-yellow-500/50 relative z-10">1</span>
                             </div>
                        </div>
                    )}

                    {rankings[2] && (
                        <div className="order-3 flex flex-col items-center animate-in slide-in-from-bottom-4 duration-700 delay-200">
                             <div className="relative mb-2">
                                <PodiumCharacter path={rankings[2].characterPath} alt={rankings[2].username} />
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center w-full whitespace-nowrap">
                                    <span className="font-bold text-white text-lg">{rankings[2].username}</span>
                                    <div className="flex items-center gap-1 text-xs text-slate-400 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                                        <img src={rankings[2].img} className="w-3 h-3"/> {rankings[2].tierName}
                                    </div>
                                </div>
                             </div>
                             <div className="w-24 md:w-32 h-24 md:h-32 bg-gradient-to-t from-amber-900/40 to-amber-700/20 border-t-4 border-amber-700 rounded-t-lg flex items-start justify-center pt-4 shadow-xl">
                                 <span className="text-4xl font-black text-amber-700/50">3</span>
                             </div>
                        </div>
                    )}
                </div>
            </div>
        ) : (
             <div className="mb-12 bg-slate-900/30 border border-slate-800 border-dashed rounded-3xl p-8 text-center">
                <Users className="mx-auto mb-2 opacity-50 text-slate-500" size={32}/>
                <p className="text-slate-500">No active agents found.</p>
                <Link href="/settings">
                    <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold transition flex items-center gap-2 mx-auto">
                        <PlusCircle size={16}/> Link Riot ID
                    </button>
                </Link>
             </div>
        )}

        {/* --- CHARTS & ACTIVITY --- */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
                {squadMMR.length > 0 ? (
                    <PerformanceChart mmrData={squadMMR} />
                ) : (
                    <div className="h-[300px] bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed flex items-center justify-center text-slate-500">
                        <Activity className="mb-2 mr-2 opacity-50"/> 
                        No Match Data Available
                    </div>
                )}
            </div>

            <div className="xl:col-span-1 space-y-6">
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 h-full">
                    <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                        <ArrowUpRight className="text-green-400"/> Recent Promotions
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
                                                <span className="text-white font-bold">{act.username}</span> promoted to <span className="text-green-400 font-bold">{act.newRank}</span>
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                <Clock size={10}/> {act.date.toLocaleDateString()}
                                            </p>
                                        </div>
                                        {act.tierImg && <img src={act.tierImg} className="w-8 h-8 opacity-80"/>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-500 text-sm">
                            <Trophy size={32} className="mx-auto mb-2 opacity-20"/>
                            No rank ups detected recently.
                        </div>
                    )}
                </div>
            </div>
        </div>

      </main>
    </div>
  );
}