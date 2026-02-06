"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  Save, User, Lock, Gamepad2, MonitorPlay, 
  Swords, Hammer, Trophy, AlertCircle, CheckCircle 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
// On n'oublie pas la Sidebar pour la navigation
import Sidebar from '@/components/Sidebar';

export default function SettingsPage() {
  const router = useRouter();
  
  // États de chargement et messages
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
    // Rôles spécifiques par jeu
    valo_main_role: 'Flex',
    lol_main_role: 'Fill'
  });

  // État séparé pour le changement de mot de passe
  const [newPassword, setNewPassword] = useState('');

  // 1. Charger les données au démarrage
  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Si pas connecté, retour au login
      if (!user) {
        router.push('/login');
        return;
      }

      // Récupération du profil dans la base de données
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        // Astuce : Si le username est vide en base, on essaie de prendre celui des métadonnées d'inscription
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

  // 2. Fonction de Sauvegarde
  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Mise à jour de la table 'profiles'
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

      // Si un nouveau mot de passe est entré, on le met à jour
      if (newPassword) {
        const { error: pwdError } = await supabase.auth.updateUser({ password: newPassword });
        if (pwdError) throw pwdError;
      }

      setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
      setNewPassword(''); // On vide le champ mot de passe par sécurité
      router.refresh();   // Rafraîchit la page pour mettre à jour la Sidebar
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading data...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      
      {/* 1. SIDEBAR (Navigation) */}
      <Sidebar />

      {/* 2. CONTENU PRINCIPAL (Décalé à droite) */}
      <main className="md:ml-20 lg:ml-64 min-h-screen p-6 lg:p-10 pb-24">
      
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-black text-white mb-2">Profile Settings</h1>
            <p className="text-slate-400 mb-8">Manage your identity and game roles.</p>

            {/* Message de confirmation ou erreur */}
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
                  
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Avatar URL</label>
                    <div className="flex gap-4 items-center mt-1">
                      {/* Prévisualisation de l'image */}
                      <div className="w-12 h-12 rounded-full bg-slate-800 shrink-0 overflow-hidden border border-slate-600">
                        <img 
                            src={formData.avatar_url || '/characters/default.png'} 
                            alt="Preview" 
                            className="w-full h-full object-cover" 
                            onError={(e) => e.currentTarget.src = '/characters/default.png'} 
                        />
                      </div>
                      <input 
                        type="text" 
                        placeholder="https://imgur.com/..."
                        value={formData.avatar_url}
                        onChange={(e) => setFormData({...formData, avatar_url: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                      />
                    </div>
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
                    {/* Rôle Valorant Spécifique */}
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
                         readOnly // Juste pour info visuelle, on utilise Riot ID pour les deux
                         className="w-full bg-transparent border-none p-0 text-slate-500 placeholder-slate-600 focus:ring-0 font-mono italic"
                      />
                    </div>
                    {/* Rôle LoL Spécifique */}
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