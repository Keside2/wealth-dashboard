import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // 🔥 REAL-TIME LISTENER: This updates your UI instantly when data changes
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTransactions(items);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl">
      <h3 className="text-xl font-bold mb-6">Recent Transactions</h3>
      
      <div className="space-y-4">
        {transactions.length === 0 ? (
          <p className="text-slate-500 text-center py-10">No transactions found. Add one above!</p>
        ) : (
          transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {t.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                </div>
                <div>
                  <p className="font-semibold text-white">{t.title}</p>
                  <p className="text-xs text-slate-500">{t.category}</p>
                </div>
              </div>
              <p className={`font-bold ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {t.type === 'income' ? '+' : '-'}${Number(t.amount).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}