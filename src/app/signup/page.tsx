"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, User, Shield, Gamepad2, Loader2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // On ajoute le pseudo ici
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Créer le compte Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: username } // On stocke le pseudo dans les métadonnées
      }
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // 2. Créer l'entrée dans la table 'profiles'
    if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').insert([
            { id: authData.user.id, username: username }
        ]);

        if (profileError) {
            console.error("Error creating profile:", profileError);
            // On continue quand même, le login marchera
        }
    }

    alert('Check your email for the confirmation link!');
    router.push('/login');
    setLoading(false);
  };

  const handleDiscordSignup = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
       <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[20%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]"></div>
       </div>

       <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white mb-2">Enlist Now</h1>
            <p className="text-slate-400">Create your profile and join the squad.</p>
          </div>

          {error && <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">{error}</div>}

          {/* BOUTON DISCORD */}
          <button 
            onClick={handleDiscordSignup}
            disabled={loading}
            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 mb-6 shadow-lg shadow-[#5865F2]/20"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><Gamepad2 size={20} /> Sign up with Discord</>}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-900 px-2 text-slate-500">Or using email</span></div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-indigo-500 outline-none transition" placeholder="JettMain" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-indigo-500 outline-none transition" placeholder="agent@valorant.com" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-indigo-500 outline-none transition" placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 mt-2">
              {loading ? <Loader2 className="animate-spin" /> : <><Shield size={20} /> Create Account</>}
            </button>
          </form>

          <p className="text-center mt-6 text-slate-400 text-sm">
            Already have an account? <Link href="/login" className="text-indigo-400 hover:text-white font-bold transition">Log In</Link>
          </p>
       </div>
    </div>
  );
}