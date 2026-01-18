export default function TransactionItem({ name, category, date, amount, type }) {
  const isExpense = type === 'expense';
  
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all group">
      <div className="flex items-center gap-4">
        {/* Icon Placeholder - Could be replaced with specific brand logos later */}
        <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center font-bold text-white group-hover:scale-110 transition-transform">
          {name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-white">{name}</p>
          <p className="text-sm text-slate-500">{category} • {date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold ${isExpense ? 'text-white' : 'text-emerald-400'}`}>
          {isExpense ? `-${amount}` : `+${amount}`}
        </p>
        <p className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">Completed</p>
      </div>
    </div>
  );
}