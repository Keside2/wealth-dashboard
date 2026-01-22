import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, amount, change, isPositive, icon: Icon, color, className }) {
  return (
    <div className={`bg-white/5 p-6 rounded-[2.5rem] border border-white/10 backdrop-blur-xl relative overflow-hidden transition-all ${className}`}>
      {/* Decorative Glow */}
      <div className={`absolute -top-10 -right-10 w-24 h-24 blur-[80px] rounded-full ${color}`}></div>

      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 text-white`}>
          <Icon size={24} />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          {change}%
        </div>
      </div>

      <div>
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold mt-1 tracking-tight">{amount}</h3>
      </div>
    </div>
  );
}