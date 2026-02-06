import { 
  Users, Trophy, Swords, Gamepad2, Skull, Bell, Search, Menu,
  Activity, MonitorPlay, Crown, Mic
} from 'lucide-react';
// IMPORT THE AUTH BUTTON
import AuthButton from '@/components/AuthButton';
import PodiumCharacter from '@/components/PodiumCharacter';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside className="fixed left-0 top-0 h-full w-20 lg:w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 flex flex-col hidden md:flex z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shrink-0">
            <Gamepad2 className="text-white w-5 h-5" />
          </div>
          {/* RENAMED: SQUAD TRACKER */}
          <span className="font-bold text-xl text-white tracking-tight hidden lg:block">SQUAD <span className="text-indigo-500">TRACKER</span></span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem icon={<Activity />} label="Dashboard" active />
          <NavItem icon={<Trophy />} label="Leaderboard" />
          <NavItem icon={<Swords />} label="Matches & Stats" />
          <NavItem icon={<MonitorPlay />} label="Steam Library" />
        </nav>

        {/* AJOUTE CE LIEN ICI : */}
          <div className="h-px bg-slate-800 my-2 mx-4"></div> {/* Petit séparateur */}
          
          <Link href="/settings">
             <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
                <Users size={20} /> 
                <span className="text-sm font-medium hidden lg:block">Profile Settings</span>
             </div>
          </Link>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="md:ml-20 lg:ml-64 min-h-screen pb-20">
        
        {/* HEADER */}
        <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50 h-16 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Menu className="md:hidden text-slate-400" />
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search player..." 
                className="bg-slate-900 border border-slate-800 rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 transition w-64 text-white"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-slate-800 rounded-full transition">
              <Bell className="w-5 h-5 text-slate-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-slate-950"></span>
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-12">
          
          {/* WELCOME RENAMED */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Squad Dashboard</h1>
              <p className="text-slate-400">Overview of the 20 legends (and the griefers).</p>
            </div>
            <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-medium flex items-center gap-2 w-fit">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                System Online
            </span>
          </div>

          {/* --- SECTION 1: THE PODIUM (TOP 5) --- */}
          <div className="relative">
             <div className="flex items-center gap-2 mb-8">
                <Crown className="text-yellow-500" />
                <h2 className="text-2xl font-bold text-white">Top 5 Grinders</h2>
             </div>
             
             {/* TOP 3 PODIUM */}
             <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-6 mb-8">
                
                {/* RANK 2 */}
                <div className="order-2 md:order-1 w-full md:w-64 relative mt-10 md:mt-0">
                    <GrinderCard 
                        rank={2} name="SageHeal" games="42 Games" title="The Assist King" titleColor="blue"
                        stats="WR: 51%" charImg="/characters/SageHeal.png"
                    />
                </div>

                {/* RANK 1 (CENTER) */}
                <div className="order-1 md:order-2 w-full md:w-80 relative z-20 -mb-4 md:-mb-8">
                    <div className="absolute inset-0 bg-yellow-500/20 blur-[60px] rounded-full"></div>
                    <div className="bg-gradient-to-b from-slate-800 to-slate-950 border-2 border-yellow-500/50 rounded-3xl p-6 relative shadow-2xl transform hover:scale-105 transition duration-500">
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-yellow-500 text-slate-950 font-black px-6 py-1.5 rounded-full text-sm shadow-lg shadow-yellow-500/40 tracking-wider">
                            #1 WARLORD
                        </div>
                        
                        {/* 3D CHARACTER #1 */}
                        <div className="h-56 w-full relative -mt-12 mb-4 flex justify-center">
                            <PodiumCharacter path="/characters/JettMain.png" alt="JettMain" />
                        </div>

                        <div className="text-center relative z-10">
                            <h3 className="text-3xl font-black text-white uppercase italic">JettMain</h3>
                            <div className="text-5xl font-mono font-bold text-white mb-1 mt-2">58</div>
                            <p className="text-xs text-slate-400 uppercase tracking-widest mb-4">Matches Played</p>
                            <div className="pt-4 border-t border-slate-700/50 flex justify-center gap-4 text-xs">
                                <div><span className="text-slate-500 block">Winrate</span><span className="font-bold text-green-400 text-lg">62%</span></div>
                                <div><span className="text-slate-500 block">Headshot</span><span className="font-bold text-yellow-400 text-lg">32%</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RANK 3 */}
                <div className="order-3 md:order-3 w-full md:w-64 relative">
                    <GrinderCard 
                        rank={3} name="OmenOneTrick" games="38 Games" title="Smoke Criminal" titleColor="purple"
                        stats="WR: 49%" charImg="/characters/OmenOneTrick.png"
                    />
                </div>
             </div>

             {/* RANK 4 & 5 */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                 <MiniGrinderRow rank={4} name="SovaLineups" games="31 Games" title="Nerd 🤓" stats="WR: 55%" />
                 <MiniGrinderRow rank={5} name="BrimstoneDad" games="29 Games" title="iPad Gamer" stats="WR: 44%" />
             </div>
          </div>

          {/* --- SECTION 2: BENTO GRID --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="col-span-1 md:col-span-2 bg-[#5865F2]/10 border border-[#5865F2]/30 rounded-2xl p-6 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#5865F2] rounded-lg"><Users className="text-white w-5 h-5" /></div>
                <h3 className="font-bold text-white text-lg">Discord Voice</h3>
              </div>
              <div className="space-y-3">
                <ChannelRow name="General" users={['Pseudo1', 'Pseudo2', 'Pseudo3']} />
                <ChannelRow name="Valorant Ranked" users={['JettMain', 'SageHeal']} />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-yellow-500/50 transition">
                <div className="flex justify-between mb-4">
                  <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500"><Trophy size={20} /></div>
                  <span className="text-xs font-mono text-slate-500">LEAGUE</span>
                </div>
                <p className="text-sm text-slate-400">Squad Winrate</p>
                <p className="text-xl font-bold text-white">65% Win</p>
            </div>

            <div className="bg-pink-900/10 border border-pink-500/30 rounded-2xl p-6 flex flex-col items-center text-center justify-center">
               <div className="p-3 bg-pink-500/20 rounded-full mb-2"><Skull className="text-pink-500 w-6 h-6" /></div>
               <h3 className="text-pink-400 font-bold text-sm mb-1">FEEDER ALERT</h3>
               <p className="text-white font-bold text-lg">NoobMaster69</p>
               <p className="text-slate-400 text-xs italic mt-1">"0/12/1 in Ranked"</p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

// --- COMPONENTS ---

function NavItem({ icon, label, active = false }: any) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      {icon} <span className="text-sm font-medium hidden lg:block">{label}</span>
    </div>
  );
}

function GrinderCard({ rank, name, games, title, titleColor, charImg }: any) {
    const colors: any = { blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20', purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20' };
    return (
        <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-600 rounded-2xl p-4 flex flex-col items-center text-center transition hover:-translate-y-1 relative overflow-hidden group">
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-white/5 blur-xl rounded-full group-hover:bg-white/10 transition"></div>
            
            <div className="text-slate-600 font-black text-xl mb-1">#{rank}</div>
            
            <div className="h-32 w-full flex justify-center -my-2 relative z-10">
                <PodiumCharacter path={charImg} alt={name} />
            </div>

            <div className="font-bold text-white text-lg leading-none z-10">{name}</div>
            <div className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase mt-2 mb-2 border z-10 ${colors[titleColor]}`}>{title}</div>
            <div className="font-mono text-slate-300 font-bold z-10">{games}</div>
        </div>
    )
}

function MiniGrinderRow({ rank, name, games, title }: any) {
    return (
        <div className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-3 flex items-center justify-between hover:bg-slate-800 transition px-4">
            <div className="flex items-center gap-4">
                <span className="text-slate-600 font-bold font-mono text-lg">#{rank}</span>
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-400">{name[0]}</div>
                <div>
                    <div className="text-sm font-bold text-slate-300">{name}</div>
                    <div className="text-[10px] text-slate-500 bg-slate-800 px-1.5 rounded w-fit">{title}</div>
                </div>
            </div>
            <div className="text-sm font-mono text-slate-400">{games}</div>
        </div>
    )
}

function ChannelRow({ name, users }: any) {
    return (
        <div className="bg-slate-950/30 rounded-lg p-3 flex items-center justify-between border border-[#5865F2]/10">
            <div className="flex items-center gap-2"><Mic size={14} className="text-slate-500" /><span className="font-medium text-slate-200 text-sm">{name}</span></div>
            <div className="flex -space-x-2">{users.map((u:string, i:number) => <div key={i} className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-[8px] text-white font-bold">{u[0]}</div>)}</div>
        </div>
    )
}