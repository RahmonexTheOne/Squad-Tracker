"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  Save, User, Lock, Gamepad2, MonitorPlay, 
  Swords, Hammer, Link as LinkIcon, AlertCircle, CheckCircle 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  // Données du formulaire
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    avatar_url: '',
    riot_id: '',
    steam_id: '',
    minecraft_ign: '',
    squad_role: 'Soldier'
  });

  // Nouveau mot de passe (séparé)
  const [newPassword, setNewPassword] = useState('');

  // 1. Charger les données au démarrage
  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setFormData({
          username: data.username || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
          riot_id: data.riot_id || '',
          steam_id: data.steam_id || '',
          minecraft_ign: data.minecraft_ign || '',
          squad_role: data.squad_role || 'Soldier'
        });
      }
      setLoading(false);
    };
    getProfile();
  }, [router]);

  // 2. Sauvegarder le Profil
  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Mise à jour de la table profiles
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          bio: formData.bio,
          avatar_url: formData.avatar_url,
          riot_id: formData.riot_id,
          steam_id: formData.steam_id,
          minecraft_ign: formData.minecraft_ign,
          squad_role: formData.squad_role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Mise à jour du mot de passe (si rempli)
      if (newPassword) {
        const { error: pwdError } = await supabase.auth.updateUser({ password: newPassword });
        if (pwdError) throw pwdError;
      }

      setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
      setNewPassword(''); // Reset champ password
      router.refresh(); // Rafraîchir pour voir les changements dans la sidebar
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading data...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-6 lg:p-10 pb-24">
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-white mb-2">Profile Settings</h1>
        <p className="text-slate-400 mb-8">Manage your identity across the multiverse.</p>

        {/* Message de notification */}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Username</label>
                <input 
                  type="text" 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 mt-1 text-white focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Squad Role</label>
                <select 
                  value={formData.squad_role}
                  onChange={(e) => setFormData({...formData, squad_role: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 mt-1 text-white focus:border-indigo-500 outline-none"
                >
                  <option value="Soldier">Soldier (Default)</option>
                  <option value="IGL">IGL (In-Game Leader)</option>
                  <option value="Sniper">Sniper</option>
                  <option value="Entry">Entry Fragger</option>
                  <option value="Support">Support</option>
                  <option value="Lurker">Lurker</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Avatar URL (Image Link)</label>
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-full bg-slate-800 shrink-0 overflow-hidden border border-slate-600">
                    <img src={formData.avatar_url || '/characters/default.png'} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="https://imgur.com/..."
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({...formData, avatar_url: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Paste a link to any image (Discord, Imgur, etc).</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Bio / Status</label>
                <textarea 
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="I don't miss. I just zone them."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 mt-1 text-white focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
          </section>

          {/* SECTION 2: GAMING ACCOUNTS */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Gamepad2 className="text-red-400" /> Game Accounts
            </h2>

            <div className="space-y-4">
              {/* Valorant / Riot */}
              <div className="flex items-center gap-4 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                <div className="p-2 bg-red-500/20 rounded-lg text-red-500"><Swords size={20} /></div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Riot ID (Valorant / LoL)</label>
                  <input 
                    type="text" 
                    placeholder="JettMain#EUW"
                    value={formData.riot_id}
                    onChange={(e) => setFormData({...formData, riot_id: e.target.value})}
                    className="w-full bg-transparent border-none p-0 text-white placeholder-slate-600 focus:ring-0"
                  />
                </div>
              </div>

              {/* Steam */}
              <div className="flex items-center gap-4 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500"><MonitorPlay size={20} /></div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Steam Friend Code / ID</label>
                  <input 
                    type="text" 
                    placeholder="123456789"
                    value={formData.steam_id}
                    onChange={(e) => setFormData({...formData, steam_id: e.target.value})}
                    className="w-full bg-transparent border-none p-0 text-white placeholder-slate-600 focus:ring-0"
                  />
                </div>
              </div>

              {/* Minecraft */}
              <div className="flex items-center gap-4 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                <div className="p-2 bg-green-500/20 rounded-lg text-green-500"><Hammer size={20} /></div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Minecraft / TLauncher Name</label>
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

          {/* SECTION 3: SECURITY */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Lock className="text-yellow-400" /> Security
            </h2>
            
            <div>
                <label className="text-xs font-bold text-slate-400 uppercase">New Password</label>
                <input 
                  type="password" 
                  placeholder="Leave empty to keep current password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 mt-1 text-white focus:border-yellow-500 outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-2">Only fill this if you want to change your login password.</p>
            </div>
          </section>

          {/* ACTION BUTTONS */}
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
                {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}