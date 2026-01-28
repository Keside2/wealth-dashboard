// components/dashboard/Goals.jsx
import { Plus, TrendingUp, Pencil, Trash2, Wallet, ArrowDownLeft } from 'lucide-react';

const Goals = ({ goals, onAddClick, onEditClick, onDeleteClick, formatCurrency, onDepositClick, onWithdrawClick, onDetailClick, isModal, onSeeAllClick, currency }) => {

    return (
        <div className={isModal ? "" : "mt-8"}>
            {/* Header: Hide inside modal to prevent double headers */}
            {!isModal && (
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white tracking-tight">Savings Goals</h3>
                    {/* Only show View All if you have more than 4 goals */}
                    {goals.length > 2 && (
                        <button
                            onClick={onSeeAllClick}
                            className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-widest"
                        >
                            View All
                        </button>
                    )}
                </div>
            )}

            <div className="goal-grid">
                {/* 1. ADD NEW GOAL CARD (Hidden inside Modal) */}
                {!isModal && (
                    <button
                        onClick={onAddClick}
                        className="goal-card border-dashed border-2 border-white/10 bg-transparent flex flex-col items-center justify-center min-h-[200px] hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                    >
                        <div className="p-4 rounded-full bg-white/5 group-hover:bg-blue-500/20 transition-all mb-4">
                            <Plus size={32} className="text-slate-500 group-hover:text-blue-500 transition-colors" />
                        </div>
                        <span className="font-bold text-slate-400 group-hover:text-white transition-colors">Create New Goal</span>
                    </button>
                )}

                {/* 2. EXISTING GOALS */}
                {goals.map((goal) => {
                    const progress = goal.targetAmount > 0 ? (goal.currentSaved / goal.targetAmount) * 100 : 0;
                    const isCompleted = progress >= 100;

                    return (
                        <div key={goal.id} className={`goal-card group relative ${isCompleted ? 'border-emerald-500/30' : ''}`}>

                            {/* Actions Group (Pencil, Trash, etc.) */}
                            <div className="flex flex-wrap gap-3 md:absolute md:top-4 md:right-4 md:opacity-0 md:group-hover:opacity-100 transition-all z-10 mb-4 md:mb-0">
                                <button onClick={() => onDepositClick(goal)} className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition-all">
                                    <Wallet size={18} />
                                </button>
                                <button
                                    onClick={() => onWithdrawClick(goal)}
                                    disabled={goal.currentSaved <= 0}
                                    className={`p-2.5 rounded-xl transition-all ${goal.currentSaved > 0 ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' : 'bg-white/5 text-slate-600 opacity-50 cursor-not-allowed'}`}
                                >
                                    <ArrowDownLeft size={18} />
                                </button>
                                <button onClick={() => onEditClick(goal)} className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500/20 transition-all">
                                    <Pencil size={18} />
                                </button>
                                <button onClick={() => onDeleteClick(goal.id)} className="p-2.5 bg-white/5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-500 rounded-xl transition-all">
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            {/* Clickable Content Area */}
                            <div onClick={() => onDetailClick(goal)} className="cursor-pointer">
                                <div className="goal-icon mb-4">
                                    <TrendingUp size={20} />
                                </div>
                                <h4 className="font-bold text-lg group-hover:text-blue-400 transition-colors">
                                    {goal.title}
                                </h4>
                                <p className="text-slate-500 text-sm mb-4">
                                    Target: {typeof formatCurrency === 'function'
                                        ? formatCurrency(goal.targetAmount)
                                        : `${currency?.symbol || '$'}${Number(goal.targetAmount).toLocaleString()}`
                                    }
                                </p>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span>Progress</span>
                                        <span>{progress.toFixed(0)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-blue-500'}`}
                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                        ></div>
                                    </div>
                                    {isCompleted && (
                                        <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                                            <span>Goal Achieved! ✨</span>
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