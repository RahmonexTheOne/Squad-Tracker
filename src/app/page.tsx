import { 
  Users, 
  Trophy, 
  Swords, 
  Gamepad2, 
  Ghost, 
  Bell, 
  Search, 
  Menu,
  Activity,
  Flame,
  MonitorPlay
} from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      
      {/* --- SIDEBAR (Navigation) --- */}
      <aside className="fixed left-0 top-0 h-full w-20 lg:w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 flex flex-col hidden md:flex z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shrink-0">
            <Gamepad2 className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-white tracking-tight hidden lg:block">SQUAD<span className="text-indigo-500">HQ</span></span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem icon={<Activity />} label="Dashboard" active />
          <NavItem icon={<Trophy />} label="Leaderboard" />
          <NavItem icon={<Swords />} label="Matchs & Stats" />
          <NavItem icon={<MonitorPlay />} label="Steam Library" />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-800 transition">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">MO</div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-white">Moi</p>
              <p className="text-xs text-slate-400">En ligne</p>
            </div>
          </div>
        </div>
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
                placeholder="Chercher un joueur, un match..." 
                className="bg-slate-900 border border-slate-800 rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 transition w-64"
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

        {/* DASHBOARD CONTENT */}
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
          
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">QG des Opérations</h1>
              <p className="text-slate-400">Vue d'ensemble des 20 légendes (et des boulets).</p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Systèmes Opérationnels
              </span>
            </div>
          </div>

          {/* BENTO GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* WIDGET 1: DISCORD (Large) */}
            <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-[#5865F2]/20 to-slate-900 border border-[#5865F2]/30 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                <Users size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-[#5865F2] rounded-lg">
                    <Users className="text-white w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-lg">Discord Vocal</h3>
                </div>
                <div className="space-y-3">
                  <ChannelRow name="Général" users={['Pseudo1', 'Pseudo2', 'Pseudo3']} />
                  <ChannelRow name="Valorant Ranked" users={['JettMain', 'SageHeal']} />
                </div>
              </div>
            </div>

            {/* WIDGET 2: VALORANT MVP */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-900 border border-slate-800 rounded-2xl p-1 relative hover:border-red-500/50 transition duration-300 group">
              <div className="bg-slate-950 rounded-xl h-full p-5 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                    <Swords size={20} />
                  </div>
                  <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded">VALORANT</span>
                </div>
                <div className="flex-1 flex flex-col justify-end">
                  <p className="text-sm text-slate-400 mb-1">MVP de la semaine</p>
                  <p className="text-xl font-bold text-white">DarkSasukeDu93</p>
                  <div className="mt-2 flex items-center gap-3 text-sm">
                    <span className="text-green-400 font-mono">K/D 2.45</span>
                    <span className="text-slate-600">|</span>
                    <span className="text-white">Diamond 3</span>
                  </div>
                </div>
              </div>
            </div>

            {/* WIDGET 3: LEAGUE OF LEGENDS */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-900 border border-slate-800 rounded-2xl p-1 relative hover:border-yellow-500/50 transition duration-300">
              <div className="bg-slate-950 rounded-xl h-full p-5 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                    <Trophy size={20} />
                  </div>
                  <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded">LEAGUE</span>
                </div>
                <div className="flex-1 flex flex-col justify-end">
                  <p className="text-sm text-slate-400 mb-1">Winrate Squad</p>
                  <p className="text-xl font-bold text-white">65% Win</p>
                  <div className="mt-2 text-xs text-slate-500">
                    Sur les 20 derniers matchs
                  </div>
                </div>
              </div>
            </div>

            {/* WIDGET 4: STEAM / RECENT */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <MonitorPlay size={18} className="text-blue-400"/> 
                Activités Récentes (Steam & Autres)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <GameCard game="Counter-Strike 2" status="En jeu: 3 personnes" color="blue" />
                <GameCard game="Lethal Company" status="Dernière session: Hier" color="orange" />
                <GameCard game="Rocket League" status="En jeu: 1 personne" color="cyan" />
              </div>
            </div>

            {/* WIDGET 5: THE FEEDER (Humour) */}
            <div className="bg-gradient-to-br from-pink-500/10 to-slate-900 border border-pink-500/30 rounded-2xl p-6 flex flex-col items-center text-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-5"></div>
               <div className="p-3 bg-pink-500/20 rounded-full mb-3 animate-bounce">
                  <Ghost className="text-pink-500 w-8 h-8" />
               </div>
               <h3 className="text-pink-400 font-bold uppercase tracking-wider text-sm mb-1">Alerte Feeder 🎒</h3>
               <p className="text-white font-bold text-lg">NoobMaster69</p>
               <p className="text-slate-400 text-xs mt-2 italic">"C'est la faute du lag"</p>
               <div className="mt-3 bg-slate-950/50 px-3 py-1 rounded border border-pink-500/20 text-xs text-pink-300">
                 0 Kills / 12 Morts
               </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

// --- PETITS COMPOSANTS POUR GARDER LE CODE PROPRE ---

function NavItem({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      {icon}
      <span className={`text-sm font-medium hidden lg:block`}>{label}</span>
    </div>
  );
}

function ChannelRow({ name, users }: { name: string, users: string[] }) {
  return (
    <div className="bg-slate-950/30 rounded-lg p-3 flex items-center justify-between border border-[#5865F2]/10">
      <div className="flex items-center gap-2">
        <span className="text-slate-400">#</span>
        <span className="font-medium text-slate-200">{name}</span>
      </div>
      <div className="flex -space-x-2">
        {users.map((u, i) => (
          <div key={i} className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-[8px] text-white" title={u}>
            {u[0]}
          </div>
        ))}
      </div>
    </div>
  );
}

function GameCard({ game, status, color }: { game: string, status: string, color: string }) {
  return (
    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-600 transition group cursor-pointer">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-full rounded-full bg-${color}-500 group-hover:shadow-[0_0_10px_theme('colors.${color}.500')] transition`}></div>
        <div>
          <h4 className="font-bold text-slate-200">{game}</h4>
          <p className="text-xs text-slate-500">{status}</p>
        </div>
      </div>
    </div>
  );
}