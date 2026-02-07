'use client';

import { Check, X, Shield, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function SquadInviteBanner({ notifications, userId }: { notifications: any[], userId: any }) {
  const router = useRouter();

  const handleAction = async (notif: any, action: 'accept' | 'decline') => {
    if (notif.type === 'INVITE') {
      if (action === 'accept') {
        await supabase.from('profiles').update({ squad_id: notif.squad_id }).eq('id', userId);
      }
      await supabase.from('squad_invitations').delete().eq('id', notif.id);
    } else {
      // C'est une REQUEST (quelqu'un veut venir dans ma squad)
      if (action === 'accept') {
        await supabase.from('profiles').update({ squad_id: notif.squad_id }).eq('id', notif.user_id);
      }
      await supabase.from('squad_requests').delete().eq('id', notif.id);
    }
    router.refresh();
  };

  return (
    <div className="space-y-3">
      {notifications.map((n) => (
        <div key={n.id} className="p-4 bg-slate-900 border border-indigo-500/30 rounded-2xl flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-lg ${n.type === 'INVITE' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-green-500/20 text-green-400'}`}>
              {n.type === 'INVITE' ? <Shield size={20} /> : <UserPlus size={20} />}
            </div>
            <div>
              <p className="font-bold text-white">
                {n.type === 'INVITE' ? 'Squad Invitation' : 'Join Request'}
              </p>
              <p className="text-sm text-slate-400">
                {n.type === 'INVITE' 
                  ? `Invite to join ${n.squads.name}` 
                  : `${n.profiles.username} wants to join your squad`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleAction(n, 'decline')} className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-500 rounded-lg transition"><X size={18}/></button>
            <button onClick={() => handleAction(n, 'accept')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition shadow-lg shadow-indigo-500/20">Accept</button>
          </div>
        </div>
      ))}
    </div>
  );
}