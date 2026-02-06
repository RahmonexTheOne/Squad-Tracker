"use client";

import { Activity, Trophy, Swords, MonitorPlay, Gamepad2, Settings, Shield } from 'lucide-react'; // Ajout de Shield
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthButton from '@/components/AuthButton';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-20 lg:w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 flex flex-col hidden md:flex z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shrink-0">
            <Gamepad2 className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-white tracking-tight hidden lg:block">SQUAD <span className="text-indigo-500">TRACKER</span></span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem href="/" icon={<Activity />} label="Dashboard" active={pathname === '/'} />
          <NavItem href="/leaderboard" icon={<Trophy />} label="Leaderboard" active={pathname === '/leaderboard'} />
          <NavItem href="/matches" icon={<Swords />} label="Matches & Stats" active={pathname === '/matches'} />
          
          <div className="h-px bg-slate-800 my-2 mx-4"></div>
          
          {/* NOUVEAU BOUTON SQUAD */}
          <NavItem href="/squad" icon={<Shield />} label="My Squad" active={pathname === '/squad'} />
          
          <NavItem href="/settings" icon={<Settings />} label="Settings" active={pathname === '/settings'} />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <AuthButton />
        </div>
    </aside>
  );
}

function NavItem({ href, icon, label, active }: any) {
    return (
      <Link href={href}>
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
          {icon} <span className="text-sm font-medium hidden lg:block">{label}</span>
        </div>
      </Link>
    );
}