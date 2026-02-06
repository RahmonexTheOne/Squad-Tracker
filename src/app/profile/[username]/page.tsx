import { 
  ArrowLeft, Swords, Crosshair, Gamepad2, MessageCircle, 
  MonitorPlay, Shield, Quote, User 
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

import CharacterImage from '@/components/CharacterImage';
import Sidebar from '@/components/Sidebar';
import { getDiscordStatus } from '@/lib/discordWidget';

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

  // A. On récupère le profil
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', username)
    .single();

  if (!profile) {
      return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">User not found</div>;
  }

  // B. On lance le radar
  let discordStatus = null;
  const serverId = process.env.NEXT_PUBLIC_DISCORD_SERVER_ID;
  
  if (profile?.username && serverId) {
      discordStatus = await getDiscordStatus(serverId, profile.username);
  }

  // --- CONFIGURATION ---
  const avatarDisplay = profile.avatar_url || "/characters/default.png";
  const characterPath = `/characters/${username}.png`;
  const fallbackImage = "/characters/default.png"; 
  const userBio = profile.bio || "Hardstuck Diamond but plays like Radiant in my dreams. I love clutch situations and tilting the enemy Jett.";

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
                        <img 
                            src={avatarDisplay} 
                            alt={username} 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    
                    {/* Infos */}
                    <div className="flex-1 mb-2">
                        <h1 className="text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight mb-2">{profile.username}</h1>
                        
                        <p className="text-slate-300 text-lg italic flex items-center gap-2 mb-4">
                            <Quote size={16} className="text-slate-500 rotate-180" />
                            "I don't miss, I just zone them."
                        </p>

                        {/* BIO SECTION */}
                        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/60 p-4 rounded-2xl max-w-xl mb-4 relative">
                            <div className="absolute -top-3 left-4 bg-slate-800 text-xs text-slate-400 px-2 py-0.5 rounded flex items-center gap-1">
                                <User size={10} /> Bio
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">{userBio}</p>
                        </div>

                        {/* 🔥 WIDGET DISCORD STATUS (DÉPLACÉ ICI) 🔥 */}
                        {/* On l'affiche seulement s'il y a un statut actif */}
                        {(discordStatus?.status === 'online' || discordStatus?.game || discordStatus?.channel_name) && (
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                
                                {/* STATUT EN LIGNE */}
                                {discordStatus?.status === 'online' && (
                                    <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/30 rounded-lg text-xs font-bold flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        Online
                                    </span>
                                )}

                                {/* JEU EN COURS */}
                                {discordStatus?.game && (
                                    <span className="px-3 py-1 bg-slate-800 text-white border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-500">
                                        🎮 Playing <span className="text-indigo-300">{discordStatus.game}</span>
                                    </span>
                                )}

                                {/* SALON VOCAL */}
                                {discordStatus?.channel_name && (
                                    <span className="px-3 py-1 bg-[#5865F2]/10 text-[#5865F2] border border-[#5865F2]/30 rounded-lg text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-2 delay-100 duration-500">
                                        🎙️ In Voice: <span className="text-white">{discordStatus.channel_name}</span>
                                    </span>
                                )}
                            </div>
                        )}
                        
                        <div className="flex flex-wrap gap-2">
                            {profile.riot_id && <Badge icon={<Crosshair size={14}/>} label={profile.riot_id} color="indigo" />}
                            {profile.steam_id && <Badge icon={<Gamepad2 size={14}/>} label="Steam Connected" color="blue" />}
                        </div>
                    </div>
                </div>

                {/* --- CHARACTER 3D --- */}
                <CharacterImage path={characterPath} fallback={fallbackImage} />

            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-20 mt-20 lg:mt-0">
                
                {/* VALORANT */}
                <div className="bg-gradient-to-b from-slate-900/80 to-slate-950/90 backdrop-blur-md border border-slate-800/60 rounded-3xl p-6 relative overflow-hidden group hover:border-red-500/50 transition duration-300 shadow-xl">
                    <div className="flex justify-between items-start mb-6 relative">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-red-500/10 rounded-xl text-red-500"><Crosshair size={24} /></div>
                            <h2 className="text-xl font-bold text-white">Valorant</h2>
                        </div>
                        <span className="text-red-500 font-mono font-black text-2xl">DIA 3</span>
                    </div>
                    <div className="space-y-4 relative">
                        <StatRow label="K/D Ratio" value="1.42" good />
                        <StatRow label="Win Rate" value="52.4%" />
                        <div className="pt-4 border-t border-slate-800/60">
                            <div className="flex gap-2">
                                <span className="text-sm text-slate-400">Main Role:</span>
                                <span className="text-sm font-bold text-white uppercase">{profile.valo_main_role || 'Flex'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LEAGUE */}
                <div className="bg-gradient-to-b from-slate-900/80 to-slate-950/90 backdrop-blur-md border border-slate-800/60 rounded-3xl p-6 relative overflow-hidden group hover:border-yellow-500/50 transition duration-300 shadow-xl">
                    <div className="flex justify-between items-start mb-6 relative">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500"><Shield size={24} /></div>
                            <h2 className="text-xl font-bold text-white">League</h2>
                        </div>
                        <span className="text-yellow-500 font-mono font-black text-2xl">GOLD IV</span>
                    </div>
                    <div className="space-y-4 relative">
                        <StatRow label="Win Rate" value="48%" bad />
                        <StatRow label="KDA" value="3.2" />
                        <div className="pt-4 border-t border-slate-800/60">
                             <div className="flex gap-2">
                                <span className="text-sm text-slate-400">Main Role:</span>
                                <span className="text-sm font-bold text-white uppercase">{profile.lol_main_role || 'Fill'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* STEAM */}
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
    const colors: any = { indigo: 'bg-[#5865F2]/10 text-[#5865F2] border-[#5865F2]/20', blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
    return <span className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 ${colors[color]}`}>{icon} {label}</span>
}

function StatRow({ label, value, good, bad }: any) {
    let color = 'text-white';
    if (good) color = 'text-green-400';
    if (bad) color = 'text-red-400';
    return (
        <div className="flex justify-between items-center p-2.5 bg-slate-950/30 rounded-xl border border-transparent hover:border-slate-800/50 transition">
            <span className="text-slate-400 text-sm font-medium">{label}</span>
            <span className={`font-bold font-mono text-lg ${color}`}>{value}</span>
        </div>
    )
}