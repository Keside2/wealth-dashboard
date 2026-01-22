import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { ArrowDownRight, ArrowUpRight, Calendar, Trash2, ChevronDown, ChevronUp, AlertCircle, TrendingUp } from 'lucide-react';
import { deleteTransaction } from '../../lib/transactions';

export default function TransactionList({ searchTerm, currencySymbol }) {
    const [transactions, setTransactions] = useState([]);
    const [showAll, setShowAll] = useState(false);
    const { user } = useAuth();

    // State to handle the modal: null means closed, transaction object means open
    const [deletingItem, setDeletingItem] = useState(null);

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, 'transactions'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [user]);

    const filteredTransactions = transactions.filter(t =>
        t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const displayedTransactions = showAll ? filteredTransactions : filteredTransactions.slice(0, 5);

    return (
        <>
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 lg:p-8 backdrop-blur-xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">Recent Transactions</h3>
                    {!showAll && filteredTransactions.length > 5 && (
                        <span className="text-xs text-slate-500">Showing 5 of {filteredTransactions.length}</span>
                    )}
                </div>

                <div className="space-y-4">
                    {displayedTransactions.length > 0 ? (
                        displayedTransactions.map((t) => {
                            const date = t.createdAt?.toDate().toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                            });

                            return (
                                <div key={t.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 transition-all group relative">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                            {t.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">{t.title}</p>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <span className="bg-white/5 px-2 py-0.5 rounded-md">{t.category}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1"><Calendar size={12} /> {date || 'Just now'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <p className={`font-bold ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {t.type === 'income' ? '+' : '-'}{currencySymbol}{Number(t.amount).toLocaleString()}
                                        </p>

                                        <button
                                            onClick={() => setDeletingItem(t)}
                                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-rose-500/20 hover:text-rose-500 rounded-lg transition-all text-slate-500"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="empty-state-container">
                            <div className="empty-state-icon-wrapper">
                                <div className="empty-state-pulse"></div>
                                <div className="empty-state-icon">
                                    <TrendingUp size={40} className="text-blue-500 opacity-40" />
                                </div>
                            </div>

                            <h4 className="text-xl font-bold text-white mt-6">No Activity Yet</h4>
                            <p className="text-slate-500 text-sm mt-2 max-w-[250px] mx-auto">
                                {searchTerm
                                    ? `We couldn't find any results for "${searchTerm}"`
                                    : "Start your financial journey by adding your first income or expense above!"}
                            </p>

                            {!searchTerm && (
                                <div className="mt-8 inline-flex items-center gap-2 text-[10px] font-black tracking-widest text-blue-500 uppercase">
                                    <div className="w-8 h-[1px] bg-blue-500/30"></div>
                                    Awaiting Data
                                    <div className="w-8 h-[1px] bg-blue-500/30"></div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {filteredTransactions.length > 5 && (
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="w-full mt-6 py-3 flex items-center justify-center gap-2 text-sm font-bold text-blue-500 hover:bg-blue-500/5 rounded-xl transition-all border border-blue-500/10"
                    >
                        {showAll ? (
                            <><ChevronUp size={16} /> Show Less</>
                        ) : (
                            <><ChevronDown size={16} /> Show All Transactions</>
                        )}
                    </button>
                )}
            </div>

            {/* CUSTOM PLAIN CSS MODAL */}
            {deletingItem && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-icon">
                            <AlertCircle size={32} className="text-rose-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Delete Transaction?</h3>
                        <p className="text-slate-400 mb-6 text-sm px-4">
                            Are you sure you want to delete <span className="text-white font-bold">"{deletingItem.title}"</span>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 px-2">
                            <button
                                onClick={() => setDeletingItem(null)}
                                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    deleteTransaction(deletingItem.id);
                                    setDeletingItem(null);
                                }}
                                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-rose-600/20"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}