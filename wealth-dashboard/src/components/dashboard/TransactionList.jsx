import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { ArrowDownRight, ArrowUpRight, Calendar, Trash2 } from 'lucide-react';
import { deleteTransaction } from '../../lib/transactions';

export default function TransactionList({ searchTerm }) {
  const [transactions, setTransactions] = useState([]);
  const { user } = useAuth();

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

  // FILTER LOGIC: This runs every time searchTerm or transactions change
  const filteredTransactions = transactions.filter(t => 
    t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 lg:p-8 backdrop-blur-xl">
      <h3 className="text-xl font-bold mb-6">Recent Transactions</h3>
      
      <div className="space-y-4">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((t) => {
            // Format the Date
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
                      <span className="flex items-center gap-1"><Calendar size={12}/> {date || 'Just now'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <p className={`font-bold ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {t.type === 'income' ? '+' : '-'}${Number(t.amount).toLocaleString()}
                  </p>
                  
                  <button 
                    onClick={() => {
                      if(window.confirm("Delete this transaction?")) {
                        deleteTransaction(t.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-rose-500/20 hover:text-rose-500 rounded-lg transition-all text-slate-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          /* Empty State when search returns nothing */
          <div className="text-center py-10">
            <p className="text-slate-500">No transactions found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
}