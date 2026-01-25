// components/dashboard/Goals.jsx
import { Plus, TrendingUp, Pencil, Trash2 } from 'lucide-react';

const Goals = ({ goals, onAddClick, onEditClick, onDeleteClick, formatCurrency }) => {
    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Savings Goals</h3>
                <button
                    onClick={onAddClick}
                    className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                >
                    <Plus size={20} />
                </button>
            </div>

            <div className="goal-grid">
                {goals.map((goal) => {
                    const progress = goal.targetAmount > 0 ? (goal.currentSaved / goal.targetAmount) * 100 : 0;

                    return (
                        <div key={goal.id} className="goal-card group relative">
                            {/* HOVER ACTIONS */}
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => onEditClick(goal)}
                                    className="p-1.5 bg-white/5 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 rounded-md transition-colors"
                                >
                                    <Pencil size={14} />
                                </button>
                                <button
                                    onClick={() => onDeleteClick(goal.id)}
                                    className="p-1.5 bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-md transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            <div className="goal-icon">
                                <TrendingUp size={20} />
                            </div>
                            <h4 className="font-bold text-lg">{goal.title}</h4>
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
                                        className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                    ></div>
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