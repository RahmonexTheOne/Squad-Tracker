import { Users } from 'lucide-react';

export default function DiscordWidget() {
  return (
    <div className="col-span-1 md:col-span-2 bg-[#5865F2]/10 border border-[#5865F2]/30 rounded-2xl p-6 relative overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-[#5865F2] rounded-lg">
          <Users className="text-white w-5 h-5" />
        </div>
        <h3 className="font-bold text-white text-lg">Discord Vocal</h3>
      </div>
      <div className="space-y-3">
        <div className="bg-slate-950/50 rounded-lg p-3 flex justify-between">
           <span>🔊 Général</span>
           <span className="text-green-400">3 connectés</span>
        </div>
      </div>
    </div>
  );
}