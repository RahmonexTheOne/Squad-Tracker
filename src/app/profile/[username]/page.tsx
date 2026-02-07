import { 
  ArrowLeft, Gamepad2, Quote, User, Shield, Swords 
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { getLeagueStats } from '@/lib/league';

import CharacterImage from '@/components/CharacterImage';
import Sidebar from '@/components/Sidebar';
import ValorantCard from '@/components/ValorantCard';
import LeagueCard from '@/components/LeagueCard'; // 👈 IMPORTED LEAGUE CARD
import { getDiscordStatus } from '@/lib/discordWidget';
import { getValorantStats } from '@/lib/valorant';

interface PageProps {
  params: Promise<{ username: string }>;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function ProfilePage({ params }: PageProps) {
  const resolvedParams = await params;
  const username = decodeURIComponent(resolvedParams.username);

  // --- A. SUPABASE FETCH ---
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', username)
    .single();

  if (!profile) {
      return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">User not found</div>;
  }

  // --- B. DISCORD RADAR ---
  let discordStatus = null;
  const serverId = process.env.NEXT_PUBLIC_DISCORD_SERVER_ID;
  if (profile?.username && serverId) {
      discordStatus = await getDiscordStatus(serverId, profile.username);
  }

  // --- C. VALORANT FETCH ---
  let valoData = null;
  if (profile.riot_id && profile.riot_id.includes('#')) {
      const [riotName, riotTag] = profile.riot_id.split('#');
      try {
        valoData = await getValorantStats(riotName, riotTag);
      } catch (e) {
        console.error("Valorant fetch error", e);
      }
  }

  // --- D. LEAGUE OF LEGENDS FETCH ---
  let lolData = null;
  if (profile.riot_id && profile.riot_id.includes('#')) {
      const [riotName, riotTag] = profile.riot_id.split('#');
      try {
        lolData = await getLeagueStats(riotName, riotTag);
      } catch (e) {
        console.error("League fetch error", e);
      }
  }

  // --- VISUAL CONFIG ---
  const avatarDisplay = profile.avatar_url || "/characters/default.png";
  const characterPath = `/characters/${username}.png`;
  const fallbackImage = "/characters/default.png"; 
  const userBio = profile.bio || "Agent Classified.";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-20 overflow-x-hidden">
      
      <Sidebar />

      <main className="md:ml-20 lg:ml-64 min-h-screen relative">
        
        {/* HERO BANNER */}
        <div className="h-[500px] lg:h-[600px] bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-950 absolute top-0 left-0 w-full z-0 overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://cdn.pixabay.com/photo/2017/08/30/01/05/milky-way-2695569_1280.jpg')] bg-cover bg-center"></div>
            
            <div className="absolute top-6 left-6 z-50">
                <Link href="/" className="flex items-center gap-2 text-slate-300 hover:text-white transition bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
            </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="max-w-7xl mx-auto px-6 pt-32 relative z-10">
            
            {/* HERO SECTION */}
            <div className="flex flex-col lg:flex-row items-end gap-10 mb-12 relative">
                
                <div className="flex-1 flex flex-col md:flex-row items-end gap-6 z-20">
                    {/* Avatar */}
                    <div className="w-36 h-36 md:w-44 md:h-44 shrink-0 rounded-3xl bg-[#5865F2] border-4 border-slate-800/50 shadow-2xl overflow-hidden relative flex items-center justify-center backdrop-blur-sm">
                        <img src={avatarDisplay} alt={username} className="w-full h-full object-cover"/>
                    </div>
                    
                    {/* Infos */}
                    <div className="flex-1 mb-2">
                        <h1 className="text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight mb-2">{profile.username}</h1>
                        
                        <p className="text-slate-300 text-lg italic flex items-center gap-2 mb-4">
                            <Quote size={16} className="text-slate-500 rotate-180" />
                            "No intel, no victory."
                        </p>

                        {/* BIO */}
                        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/60 p-4 rounded-2xl max-w-xl mb-4 relative">
                            <div className="absolute -top-3 left-4 bg-slate-800 text-xs text-slate-400 px-2 py-0.5 rounded flex items-center gap-1">
                                <User size={10} /> Bio
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">{userBio}</p>
                        </div>

                        {/* DISCORD WIDGET */}
                        {(discordStatus?.status === 'online' || discordStatus?.game || discordStatus?.channel_name) && (
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                {discordStatus?.status === 'online' && (
                                    <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/30 rounded-lg text-xs font-bold flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Online
                                    </span>
                                )}
                                {discordStatus?.game && (
                                    <span className="px-3 py-1 bg-slate-800 text-white border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-2">
                                        🎮 Playing <span className="text-indigo-300">{discordStatus.game}</span>
                                    </span>
                                )}
                                {discordStatus?.channel_name && (
                                    <span className="px-3 py-1 bg-[#5865F2]/10 text-[#5865F2] border border-[#5865F2]/30 rounded-lg text-xs font-bold flex items-center gap-2">
                                        🎙️ In Voice: <span className="text-white">{discordStatus.channel_name}</span>
                                    </span>
                                )}
                            </div>
                        )}
                        
                        <div className="flex flex-wrap gap-2">
                            {profile.riot_id && <Badge icon={<Swords size={14}/>} label={profile.riot_id} color="indigo" />}
                            {profile.steam_id && <Badge icon={<Gamepad2 size={14}/>} label="Steam Connected" color="blue" />}
                        </div>
                    </div>
                </div>

                {/* --- CHARACTER 3D --- */}
                <CharacterImage path={characterPath} fallback={fallbackImage} />
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-20 mt-20 lg:mt-0 items-start">
                
                {/* 🔴 VALORANT CARD */}
                <ValorantCard riotId={profile.riot_id} data={valoData} />

                {/* 🟡 LEAGUE CARD */}
                <LeagueCard data={lolData} />

                {/* 🔵 STEAM CARD */}
                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/60 rounded-3xl p-6 flex flex-col shadow-xl relative z-20 lg:z-0">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500"><Gamepad2 size={24} /></div>
                        <h2 className="text-xl font-bold text-white">Steam</h2>
                    </div>
                    <div className="bg-slate-950/80 rounded-xl p-3 flex items-center gap-4 border border-slate-800/80">
                        <div className="w-12 h-12 bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-400">
                            <Swords size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-sm text-white">Steam ID</p>
                            <p className="text-xs text-slate-400 font-mono">{profile.steam_id || 'Not linked'}</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </main>
    </div>
  );
}

// --- SUB COMPONENTS ---

function Badge({ icon, label, color }: any) {
    const colors: any = { 
        indigo: 'bg-[#5865F2]/10 text-[#5865F2] border-[#5865F2]/20', 
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        red: 'bg-red-500/10 text-red-400 border-red-500/20'
    };
    return <span className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 ${colors[color]}`}>{icon} {label}</span>
}