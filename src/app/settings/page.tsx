"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  Save, User, Lock, Gamepad2, MonitorPlay, 
  Swords, Hammer, Trophy, AlertCircle, CheckCircle,
  RefreshCcw, Link as LinkIcon 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function SettingsPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  
  // Pour gérer l'état de la liaison Discord
  const [isDiscordLinked, setIsDiscordLinked] = useState(false);
  const [discordHandle, setDiscordHandle] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    avatar_url: '',
    riot_id: '',
    steam_id: '',
    minecraft_ign: '',
    valo_main_role: 'Flex',
    lol_main_role: 'Fill'
  });

  const [newPassword, setNewPassword] = useState('');

  // 1. CHARGEMENT
  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // VÉRIFICATION DISCORD
      const identities = await supabase.auth.getUserIdentities();
      const discordIdentity = identities.data?.identities?.find((id: any) => id.provider === 'discord');
      
      if (discordIdentity) {
        setIsDiscordLinked(true);
        setDiscordHandle(user.user_metadata.full_name || user.user_metadata.custom_claims?.global_name || 'Linked');
      }

      // Récupération du profil BDD
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        const fallbackUsername = user.user_metadata?.username || user.user_metadata?.full_name || '';

        setFormData({
          username: data.username || fallbackUsername, 
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
          riot_id: data.riot_id || '',
          steam_id: data.steam_id || '',
          minecraft_ign: data.minecraft_ign || '',
          valo_main_role: data.valo_main_role || 'Flex',
          lol_main_role: data.lol_main_role || 'Fill',
        });
      }
      setLoading(false);
    };
    getProfile();
  }, [router]);

  // 2. FONCTION : LIER LE COMPTE DISCORD (Nouvel Onglet)
  const linkDiscordAccount = async () => {
    // On demande à Supabase de nous donner l'URL au lieu de rediriger tout seul
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: window.location.href, 
        scopes: 'identify',
        skipBrowserRedirect: true // <--- C'est ici que ça se joue !
      }
    });

    if (error) {
        alert("Erreur lors de la connexion Discord: " + error.message);
        return;
    }

    // Si on a bien reçu l'URL, on l'ouvre dans un nouvel onglet
    if (data?.url) {
        window.open(data.url, '_blank');
    }
  };

  // 3. FONCTION : SYNC AVATAR
  const syncDiscordData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const discordAvatar = user?.user_metadata?.avatar_url;
    
    if (discordAvatar) {
      setFormData(prev => ({ ...prev, avatar_url: discordAvatar }));
      alert("Avatar synced from Discord!");
    } else {
      alert("No Discord data found. Please click 'Connect Discord' first.");
    }
  };

  // 4. SAUVEGARDE
  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          bio: formData.bio,
          avatar_url: formData.avatar_url,
          riot_id: formData.riot_id,
          steam_id: formData.steam_id,
          minecraft_ign: formData.minecraft_ign,
          valo_main_role: formData.valo_main_role,
          lol_main_role: formData.lol_main_role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      if (newPassword) {
        const { error: pwdError } = await supabase.auth.updateUser({ password: newPassword });
        if (pwdError) throw pwdError;
      }

      setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
      setNewPassword('');
      router.refresh();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading data...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      
      <Sidebar />

      <main className="md:ml-20 lg:ml-64 min-h-screen p-6 lg:p-10 pb-24">
      
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-black text-white mb-2">Profile Settings</h1>
            <p className="text-slate-400 mb-8">Manage your identity and game roles.</p>

            {message && (
              <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {message.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
                {message.text}
              </div>
            )}

            <form onSubmit={updateProfile} className="space-y-8">
              
              {/* SECTION 1: IDENTITÉ PUBLIQUE */}
              <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <User className="text-indigo-400" /> Public Identity
                </h2>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Username</label>
                    <input 
                      type="text" 
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 mt-1 text-white focus:border-indigo-500 outline-none font-bold"
                    />
                  </div>

                  {/* --- BLOC CONNEXION DISCORD --- */}
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                    <label className="text-xs font-bold text-[#5865F2] uppercase mb-2 block">Discord Connection</label>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-white">
                                <Gamepad2 size={20} />
                            </div>
                            <div>
                                {isDiscordLinked ? (
                                    <>
                                        <p className="text-sm font-bold text-white">Account Linked ✅</p>
                                        <p className="text-xs text-slate-400">{discordHandle}</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm font-bold text-slate-300">Not Connected</p>
                                        <p className="text-xs text-slate-500">Link Discord to fetch avatar</p>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        {!isDiscordLinked && (
                            <button 
                                type="button"
                                onClick={linkDiscordAccount}
                                className="px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold rounded-lg transition flex items-center gap-2"
                            >
                                <LinkIcon size={12} /> Connect Discord
                            </button>
                        )}
                    </div>
                  </div>
                  
                  {/* --- AVATAR URL (Avec bouton Sync) --- */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Avatar URL</label>
                    <div className="flex gap-4 items-center mt-1">
                      <div className="w-12 h-12 rounded-full bg-slate-800 shrink-0 overflow-hidden border border-slate-600">
                        <img 
                            src={formData.avatar_url || '/characters/default.png'} 
                            alt="Preview" 
                            className="w-full h-full object-cover" 
                            onError={(e) => e.currentTarget.src = '/characters/default.png'} 
                        />
                      </div>
                      
                      <div className="relative flex-1">
                          <input 
                            type="text" 
                            placeholder="https://..."
                            value={formData.avatar_url}
                            onChange={(e) => setFormData({...formData, avatar_url: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 pr-12 text-white focus:border-indigo-500 outline-none"
                          />
                          <button 
                            type="button"
                            onClick={syncDiscordData}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition border border-slate-700"
                            title="Import Avatar from Discord"
                            disabled={!isDiscordLinked}
                          >
                            <RefreshCcw size={14} className={!isDiscordLinked ? 'opacity-30' : ''} />
                          </button>
                      </div>
                    </div>
                    {!isDiscordLinked && (
                        <p className="text-[10px] text-orange-400 mt-2 ml-16 flex items-center gap-1">
                            <AlertCircle size={10} /> Connect Discord above to enable avatar sync.
                        </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Bio / Status</label>
                    <textarea 
                      rows={2}
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 mt-1 text-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </section>

              {/* SECTION 2: COMPTES DE JEUX & RÔLES */}
              <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Gamepad2 className="text-red-400" /> Game Accounts & Roles
                </h2>

                <div className="space-y-4">
                  
                  {/* VALORANT */}
                  <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="p-2 bg-red-500/20 rounded-lg text-red-500 shrink-0"><Swords size={20} /></div>
                    <div className="flex-1 w-full">
                      <label className="text-xs font-bold text-slate-400 uppercase">Riot ID (Valo)</label>
                      <input 
                        type="text" 
                        placeholder="JettMain#EUW"
                        value={formData.riot_id}
                        onChange={(e) => setFormData({...formData, riot_id: e.target.value})}
                        className="w-full bg-transparent border-none p-0 text-white placeholder-slate-600 focus:ring-0 font-mono"
                      />
                    </div>
                    <div className="w-full md:w-48">
                        <label className="text-[10px] font-bold text-red-400 uppercase mb-1 block">Main Role</label>
                        <select 
                            value={formData.valo_main_role}
                            onChange={(e) => setFormData({...formData, valo_main_role: e.target.value})}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-red-500 outline-none"
                        >
                            <option value="Flex">Flex</option>
                            <option value="Duelist">Duelist</option>
                            <option value="Initiator">Initiator</option>
                            <option value="Controller">Controller</option>
                            <option value="Sentinel">Sentinel</option>
                        </select>
                    </div>
                  </div>

                  {/* LEAGUE OF LEGENDS */}
                  <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500 shrink-0"><Trophy size={20} /></div>
                    <div className="flex-1 w-full">
                      <label className="text-xs font-bold text-slate-400 uppercase">LoL Summoner Name</label>
                      <input 
                         type="text" 
                         placeholder="SummonerName#TAG"
                         value={formData.riot_id} // Souvent le même Riot ID
                         readOnly
                         className="w-full bg-transparent border-none p-0 text-slate-500 placeholder-slate-600 focus:ring-0 font-mono italic"
                      />
                    </div>
                    <div className="w-full md:w-48">
                        <label className="text-[10px] font-bold text-yellow-500 uppercase mb-1 block">Main Role</label>
                        <select 
                            value={formData.lol_main_role}
                            onChange={(e) => setFormData({...formData, lol_main_role: e.target.value})}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-yellow-500 outline-none"
                        >
                            <option value="Fill">Fill</option>
                            <option value="Top">Top</option>
                            <option value="Jungle">Jungle</option>
                            <option value="Mid">Mid</option>
                            <option value="ADC">ADC / Bot</option>
                            <option value="Support">Support</option>
                        </select>
                    </div>
                  </div>

                  {/* STEAM */}
                  <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 flex items-center gap-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500"><MonitorPlay size={20} /></div>
                    <div className="flex-1">
                      <label className="text-xs font-bold text-slate-400 uppercase">Steam Friend Code</label>
                      <input 
                        type="text" 
                        placeholder="123456789"
                        value={formData.steam_id}
                        onChange={(e) => setFormData({...formData, steam_id: e.target.value})}
                        className="w-full bg-transparent border-none p-0 text-white placeholder-slate-600 focus:ring-0 font-mono"
                      />
                    </div>
                  </div>

                  {/* MINECRAFT */}
                  <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 flex items-center gap-4">
                    <div className="p-2 bg-green-500/20 rounded-lg text-green-500"><Hammer size={20} /></div>
                    <div className="flex-1">
                      <label className="text-xs font-bold text-slate-400 uppercase">Minecraft IGN</label>
                      <input 
                        type="text" 
                        placeholder="SteveCraft"
                        value={formData.minecraft_ign}
                        onChange={(e) => setFormData({...formData, minecraft_ign: e.target.value})}
                        className="w-full bg-transparent border-none p-0 text-white placeholder-slate-600 focus:ring-0"
                      />
                    </div>
                  </div>

                </div>
              </section>

              {/* SECTION 3: SÉCURITÉ */}
              <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Lock className="text-yellow-400" /> Security
                </h2>
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Change Password</label>
                    <input 
                      type="password" 
                      placeholder="New password (leave empty to keep current)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 mt-1 text-white focus:border-yellow-500 outline-none"
                    />
                </div>
              </section>

              {/* BOUTONS D'ACTION */}
              <div className="flex justify-end gap-4 pt-4 border-t border-slate-800">
                <button 
                    type="button" 
                    onClick={() => router.push('/')}
                    className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white transition"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={saving}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-2 transition shadow-lg shadow-indigo-500/20"
                >
                    {saving ? 'Saving...' : <><Save size={18} /> Save Profile</>}
                </button>
              </div>

            </form>
          </div>
      </main>
    </div>
  );
}