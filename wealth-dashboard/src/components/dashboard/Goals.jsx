// components/dashboard/Goals.jsx
import { Plus, TrendingUp, Pencil, Trash2, Wallet, ArrowDownLeft } from 'lucide-react';

const Goals = ({ goals, onAddClick, onEditClick, onDeleteClick, formatCurrency, onDepositClick, onWithdrawClick, onDetailClick }) => {

    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-4 mt-8">
                <h3 className="text-xl font-bold text-white">Savings Goals</h3>
                <button
                    onClick={() => setShowAllGoals(true)}
                    className="text-blue-400 text-xs font-bold hover:underline"
                >
                    View All Goals
                </button>
            </div>

            <div className="goal-grid">
                {goals.map((goal) => {
                    const progress = goal.targetAmount > 0 ? (goal.currentSaved / goal.targetAmount) * 100 : 0;
                    const isCompleted = progress >= 100;

                    return (
                        <div key={goal.id} className={`goal-card group relative ${isCompleted ? 'border-emerald-500/30' : ''}`}>

                            {/* 1. THE ACTION BUTTONS (Outside the detail click) */}
                            <div className="mt-4 pt-4 border-t border-white/5 md:border-none md:pt-0">
                                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3 md:hidden">
                                    Manage Goal
                                </p>

                                <div className="flex flex-wrap gap-3 md:absolute md:top-4 md:right-4 md:opacity-0 md:group-hover:opacity-100 transition-all z-10">
                                    <button
                                        onClick={() => onDepositClick(goal)}
                                        className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition-all"
                                    >
                                        <Wallet size={18} />
                                    </button>

                                    <button
                                        onClick={() => onWithdrawClick(goal)}
                                        disabled={goal.currentSaved <= 0}
                                        className={`p-2.5 rounded-xl transition-all ${goal.currentSaved > 0
                                            ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
                                            : 'bg-white/5 text-slate-600 opacity-50 cursor-not-allowed'
                                            }`}
                                    >
                                        <ArrowDownLeft size={18} />
                                    </button>

                                    <button
                                        onClick={() => onEditClick(goal)}
                                        className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500/20 transition-all"
                                    >
                                        <Pencil size={18} />
                                    </button>

                                    <button
                                        onClick={() => onDeleteClick(goal.id)}
                                        className="p-2.5 bg-white/5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-500 rounded-xl transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* 2. THE CLICKABLE CONTENT AREA (Opens History) */}
                            <div
                                onClick={() => onDetailClick(goal)}
                                className="cursor-pointer"
                            >
                                <div className="goal-icon">
                                    <TrendingUp size={20} />
                                </div>
                                <h4 className="font-bold text-lg group-hover:text-blue-400 transition-colors">
                                    {goal.title}
                                </h4>
                                <p className="text-slate-500 text-sm mb-4">
                                    Target: {formatCurrency(goal.targetAmount)}
                                </p>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span>Progress</span>
                                        <span>{progress.toFixed(0)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-blue-500'
                                                }`}
                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                        ></div>
                                    </div>
                                    {isCompleted && (
                                        <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                                            <span>Goal Achieved!</span>
                                            <span>✨</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Goals;