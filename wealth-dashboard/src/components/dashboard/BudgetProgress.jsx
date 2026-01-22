
export default function BudgetProgress({ income, expenses, currencySymbol }) {
    // Calculate percentage (avoid division by zero)
    const percentage = income > 0 ? (expenses / income) * 100 : 0;


    // Determine color based on "Burn Rate"
    const getColor = () => {
        if (percentage > 90) return 'bg-rose-500';
        if (percentage > 60) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    return (
        <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-xl">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Expense Ratio</h3>
                    <p className="text-2xl font-bold">{percentage.toFixed(1)}%</p>
                </div>
                <p className="text-xs text-slate-500 pb-1">
                    {currencySymbol}{expenses.toLocaleString()} of {currencySymbol}{income.toLocaleString()}
                </p>
            </div>

            {/* The Progress Bar Track */}
            <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                {/* The Actual Progress */}
                <div
                    className={`h-full transition-all duration-1000 ease-out ${getColor()}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
            </div>

            <p className="mt-4 text-[11px] text-slate-500 italic">
                {percentage > 100
                    ? "⚠️ You are spending more than you earn!"
                    : "✅ You're living within your means."}
            </p>
        </div>
    );
}