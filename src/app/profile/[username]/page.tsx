import { 
  ArrowLeft, Crosshair, Gamepad2, MessageCircle, 
  MonitorPlay, Swords, Shield, Quote, User, Flame 
} from 'lucide-react';
import Link from 'next/link';
// On importe notre nouveau composant séparé
import CharacterImage from '@/components/CharacterImage';

// Fix Next.js 15: params is a Promise
interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: PageProps) {
  const resolvedParams = await params;
  const username = decodeURIComponent(resolvedParams.username);

  // --- CONFIGURATION ---
  const characterPath = `/characters/${username}.png`;
  const fallbackImage = "/characters/default.png"; // Assure-toi d'avoir une image par défaut ou vide
  const userBio = "Hardstuck Diamond but plays like Radiant in my dreams. I love clutch situations and tilting the enemy Jett. Main entry fragger for the squad since 2020.";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-20 overflow-x-hidden">
      
      {/* HERO BANNER */}
      <div className="h-[500px] lg:h-[600px] bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-950 absolute top-0 left-0 w-full z-0 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://cdn.pixabay.com/photo/2017/08/30/01/05/milky-way-2695569_1280.jpg')] bg-cover bg-center"></div>
        
        <div className="absolute top-6 left-6 z-50">
            <Link href="/" className="flex items-center gap-2 text-slate-300 hover:text-white transition bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <ArrowLeft size={16} /> Back to HQ
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
                    <span className="text-5xl font-black text-white">{username[0].toUpperCase()}</span>
                    <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-4 border-[#5865F2] rounded-full"></div>
                </div>
                
                {/* Infos */}
                <div className="flex-1 mb-2">
                    <h1 className="text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight mb-2">{username}</h1>
                    
                    <p className="text-slate-300 text-lg italic flex items-center gap-2 mb-4">
                        <Quote size={16} className="text-slate-500 rotate-180" />
                        "I don't miss, I just zone them."
                    </p>

                    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/60 p-4 rounded-2xl max-w-xl mb-4 relative">
                        <div className="absolute -top-3 left-4 bg-slate-800 text-xs text-slate-400 px-2 py-0.5 rounded flex items-center gap-1">
                            <User size={10} /> Bio
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">{userBio}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        <Badge icon={<MessageCircle size={14}/>} label="Discord OG '20" color="indigo" />
                        <Badge icon={<Gamepad2 size={14}/>} label="Steam Lvl 42" color="blue" />
                    </div>
                </div>
            </div>

            {/* --- LE COMPOSANT SÉPARÉ EST APPELÉ ICI --- */}
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
                            <AgentBadge name="Jett" role="Duelist" image="https://media.valorant-api.com/agents/add6443a-41bd-e414-f685-fb956a161346/displayicon.png" />
                            <AgentBadge name="Omen" role="Controller" image="https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/displayicon.png"/>
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
                        <div className="flex gap-3">
                            <ChampBadge name="Yasuo" img="https://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/Yasuo.png" />
                            <ChampBadge name="Yone" img="https://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/Yone.png" />
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
                        <p className="font-bold text-sm text-white">Counter-Strike 2</p>
                        <p className="text-xs text-green-400 flex items-center gap-1 animate-pulse">
                            <MonitorPlay size={10} /> Playing now
                        </p>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}

// --- SUB COMPONENTS (Helpers) ---

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

function AgentBadge({ name, role, image }: any) {
    return (
        <div className="flex items-center gap-3 bg-slate-950/50 pl-1 pr-4 py-1 rounded-full border border-slate-800/50 hover:bg-slate-900 transition cursor-pointer group">
             <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden border border-slate-700 group-hover:border-red-400 transition">
                 <img src={image} alt={name} className="w-full h-full object-cover scale-125" loading="lazy" />
             </div>
            <div className="flex flex-col">
                <span className="text-white font-bold text-sm leading-none">{name}</span>
                <span className="text-slate-500 text-[10px] font-medium uppercase">{role}</span>
            </div>
        </div>
    )
}

function ChampBadge({ name, img }: any) {
    return (
        <div className="w-12 h-12 rounded-2xl bg-slate-950 border-2 border-slate-800 overflow-hidden hover:border-yellow-500 transition cursor-pointer relative group shadow-lg">
             <img src={img} alt={name} className="w-full h-full object-cover scale-110 group-hover:scale-100 transition" loading="lazy" />
        </div>
    )
}