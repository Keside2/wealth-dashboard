import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { ArrowDownRight, ArrowUpRight, Trash2, AlertCircle, TrendingUp } from 'lucide-react';
import { deleteTransaction } from '../../lib/transactions';

export default function TransactionList({ searchTerm, currencySymbol, onSeeAllClick, limit, isModal }) {
    const [transactions, setTransactions] = useState([]);
    const { user } = useAuth();
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

    const displayedTransactions = limit ? filteredTransactions.slice(0, limit) : filteredTransactions;

    return (
        <>
            {/* Conditional Container: Removes styling if inside a modal */}
            <div className={isModal ? "" : "bg-white/5 border border-white/10 rounded-[2.5rem] p-6 lg:p-8 backdrop-blur-xl"}>

                {/* Header: Hidden if isModal is true (the modal will have its own header) */}
                {!isModal && (
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">
                            Recent Transactions
                        </h3>
                        {limit && transactions.length > limit && (
                            <button
                                onClick={onSeeAllClick}
                                className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-widest"
                            >
                                See All
                            </button>
                        )}
                    </div>
                )}

                <div className="space-y-3">
                    {displayedTransactions.length > 0 ? (
                        displayedTransactions.map((t) => {
                            const date = t.createdAt?.toDate().toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                            });

                            return (
                                <div
                                    key={t.id}
                                    className={`p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/[0.08] transition-all group relative ${isModal ? 'mb-2' : ''}`}
                                >
                                    <div className="flex flex-row items-center justify-between ">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                {t.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white text-sm sm:text-base">{t.title}</p>
                                                <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-tighter">
                                                    <span className="bg-white/10 px-2 py-0.5 rounded-md">{t.category}</span>
                                                    <span>{date || 'Just now'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <p className={`font-bold text-sm sm:text-base ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {t.type === 'income' ? '+' : '-'}{currencySymbol}{Number(t.amount).toLocaleString()}
                                            </p>

                                            <button
                                                onClick={() => setDeletingItem(t)}
                                                className="p-2 bg-rose-500/10 text-rose-500 rounded-lg lg:bg-transparent lg:text-slate-500 lg:opacity-0 lg:group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-12">
                            <TrendingUp size={40} className="text-slate-700 mx-auto mb-4 opacity-20" />
                            <p className="text-slate-500 text-sm italic">No transactions found.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* DELETE CONFIRMATION MODAL */}
            {deletingItem && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-icon">
                            <AlertCircle size={32} className="text-rose-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Delete Transaction?</h3>
                        <p className="text-slate-400 mb-6 text-sm px-4">
                            Delete <span className="text-white font-bold">"{deletingItem.title}"</span>? This cannot be undone.
                        </p>
                        <div className="flex gap-3 px-2">
                            <button onClick={() => setDeletingItem(null)} className="flex-1 py-3 bg-white/5 rounded-2xl font-bold">
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    deleteTransaction(deletingItem.id);
                                    setDeletingItem(null);
                                }}
                                className="flex-1 py-3 bg-rose-600 rounded-2xl font-bold shadow-lg shadow-rose-600/20"
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