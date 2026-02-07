import Link from 'next/link';
import { MessageCircle, Link as LinkIcon } from 'lucide-react';

export default function DiscordBanner() {
  return (
    <div className="mb-8 p-4 bg-indigo-600/10 border border-indigo-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/20">
          <MessageCircle size={24} />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">Connect your Discord</h3>
          <p className="text-indigo-200 text-sm">
            Link your account to see your Live Status and unlock Squad features.
          </p>
        </div>
      </div>
      
      {/* Note: Remplace ce lien par ton vrai lien OAuth Discord si tu l'as, sinon vers settings */}
      <Link 
        href="/settings"
        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shadow-lg flex items-center gap-2 whitespace-nowrap"
      >
        <LinkIcon size={16} /> Link Account
      </Link>
    </div>
  );
}