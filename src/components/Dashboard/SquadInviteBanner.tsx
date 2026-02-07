'use client';

import { Check, X, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function SquadInviteBanner({ invitations, userId }: { invitations: any[], userId: string }) {
  const router = useRouter();

  if (!invitations || invitations.length === 0) return null;

  const handleAccept = async (invite: any) => {
    // 1. Mettre à jour le profil avec le squad_id
    await supabase.from('profiles').update({ squad_id: invite.squad_id }).eq('id', userId);
    // 2. Supprimer l'invitation
    await supabase.from('squad_invitations').delete().eq('id', invite.id);
    // 3. Rafraîchir
    router.refresh();
  };

  const handleDecline = async (inviteId: string) => {
    await supabase.from('squad_invitations').delete().eq('id', inviteId);
    router.refresh();
  };

  return (
    <div className="mb-6 space-y-2">
      {invitations.map((invite) => (
        <div key={invite.id} className="p-4 bg-gradient-to-r from-indigo-900/40 to-slate-900 border border-indigo-500/30 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                    <Shield size={20} />
                </div>
                <div>
                    <p className="text-white text-sm font-bold">Squad Invitation Received</p>
                    <p className="text-indigo-200 text-xs">
                        You have been invited to join <span className="text-white font-bold">{invite.squad?.name || 'Unknown Squad'}</span>.
                    </p>
                </div>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={() => handleDecline(invite.id)}
                    className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition"
                    title="Decline"
                >
                    <X size={18} />
                </button>
                <button 
                    onClick={() => handleAccept(invite)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition shadow-lg shadow-indigo-500/20"
                >
                    <Check size={16} /> Accept
                </button>
            </div>
        </div>
      ))}
    </div>
  );
}