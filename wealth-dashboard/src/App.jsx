import { useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import StatCard from './components/ui/StatCard';
import { CreditCard, Wallet, TrendingUp, Menu, X, Plus, RotateCcw, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { addTransaction } from './lib/transactions';
import TransactionList from './components/dashboard/TransactionList';
import Login from './pages/Login';
import { db } from './lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import FinancialChart from './components/dashboard/FinancialChart';
import BudgetProgress from './components/dashboard/BudgetProgress';

/**
 * WEALTHIFY APP - DAY 9 COMMIT
 * Features: Smart Categories, Crypto-style Trends, Search, and Mobile Responsive Menu.
 */
function App() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income');
  const [chartFilter, setChartFilter] = useState('all'); 
  
  const [category, setCategory] = useState('General'); 
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 1. REAL-TIME DATA FETCHING
  useEffect(() => {
    if (!user) return;
    // Added orderBy to ensure chronological order for the Trend Chart
    const q = query(
      collection(db, 'transactions'), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'asc') 
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  // 2. DYNAMIC CATEGORY ENGINE
  const savedCategories = [...new Set(transactions.map(t => t.category))];
  const allCategories = [...new Set(['General', 'Food', 'Transport', 'Rent', 'Tech', 'Salary', ...savedCategories])];

  // 3. FINANCIAL CALCULATIONS
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const balance = totalIncome - totalExpense;

  // 4. CRYPTO-STYLE TREND ENGINE (Cumulative P&L)
  const filteredChartData = transactions
    .reduce((acc, t) => {
      const lastBalance = acc.length > 0 ? acc[acc.length - 1].amount : 0;
      const amt = Number(t.amount);
      const newBalance = t.type === 'income' ? lastBalance + amt : lastBalance - amt;
      
      acc.push({
        date: t.createdAt?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || '',
        amount: chartFilter === 'all' ? newBalance : amt, 
        type: t.type
      });
      return acc;
    }, [])
    .filter(t => chartFilter === 'all' ? true : t.type === chartFilter);

  const getChartColor = () => {
    if (chartFilter === 'expense') return '#f43f5e';
    if (chartFilter === 'income') return '#10b981';
    return balance >= 0 ? '#10b981' : '#f43f5e';
  };

  // 5. ACTION HANDLERS
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title || !amount || amount <= 0) return;
    
    const finalCategory = isCustomCategory ? customCategory : category;
    
    try {
      await addTransaction(user.uid, { 
        title, 
        amount: Number(amount), 
        type, 
        category: finalCategory 
      });
      // Reset State
      setTitle(''); setAmount(''); setCustomCategory(''); setIsCustomCategory(false);
    } catch (err) {
      console.error("Failed to add transaction:", err);
    }
  };

  if (!user) return <Login />;

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans relative overflow-hidden">
      
      {/* MOBILE TRIGGER */}
      <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden fixed top-6 right-6 z-50 p-3 bg-blue-600 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all">
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* SIDEBAR NAVIGATION */}
      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 lg:relative lg:translate-x-0 h-full shrink-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onNavClick={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* SCROLLABLE DASHBOARD AREA */}
      <main className="flex-1 h-full overflow-y-auto p-6 lg:p-12 custom-scrollbar">
        <header className="mb-10 pt-12 lg:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl lg:text-5xl font-bold italic tracking-tighter">Wealthify.</h1>
            <p className="text-slate-500 mt-2 font-medium">Monitoring your financial pulse, {user.displayName.split(' ')[0]}.</p>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search history..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 py-3.5 pl-12 pr-6 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 w-full md:w-72 transition-all" 
            />
          </div>
        </header>

        {/* TOP STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="Total Balance" amount={`${balance.toLocaleString()}`} icon={Wallet} color="text-blue-500" />
          <StatCard title="Total Income" amount={`${totalIncome.toLocaleString()}`} icon={TrendingUp} color="text-emerald-500" />
          <StatCard title="Total Expenses" amount={`${totalExpense.toLocaleString()}`} icon={CreditCard} color="text-rose-500" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* LEFT SIDE: Management Tools */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[50px] rounded-full" />
              <h2 className="text-lg font-bold mb-4">Quick Add</h2>
              <form onSubmit={handleAdd} className="relative z-10">
                <div className="flex gap-2 mb-4 p-1 bg-black/40 rounded-xl border border-white/5">
                  {['income', 'expense'].map((t) => (
                    <button key={t} type="button" onClick={() => setType(t)} className={`flex-1 py-2 rounded-lg text-sm capitalize transition-all ${type === t ? 'bg-white text-black font-bold shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                      {t}
                    </button>
                  ))}
                </div>
                <input type="text" placeholder="Title (e.g. Freelance)" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-black/20 border border-white/10 p-3.5 rounded-xl mb-3 outline-none focus:border-white/20 transition-all" />
                <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-black/20 border border-white/10 p-3.5 rounded-xl mb-3 outline-none focus:border-white/20 transition-all" />
                
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Category</span>
                    <button type="button" onClick={() => setIsCustomCategory(!isCustomCategory)} className="text-[10px] text-blue-500 font-bold flex items-center gap-1 hover:text-blue-400">
                      {isCustomCategory ? <><RotateCcw size={10}/> SELECT EXISTING</> : <><Plus size={10}/> NEW CATEGORY</>}
                    </button>
                  </div>
                  {!isCustomCategory ? (
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-black/30 border border-white/10 p-3.5 rounded-xl text-slate-400 outline-none cursor-pointer">
                      {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  ) : (
                    <input type="text" placeholder="Category Name" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} className="w-full bg-black/30 border border-blue-500/30 p-3.5 rounded-xl text-white outline-none ring-1 ring-blue-500/10 focus:ring-blue-500/40 transition-all" autoFocus />
                  )}
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all">Add Transaction</button>
              </form>
            </div>
            
            <BudgetProgress income={totalIncome} expenses={totalExpense} />
          </div>

          {/* RIGHT SIDE: Visual Analytics */}
          <div className="xl:col-span-2 space-y-8 pb-10">
            <div className="bg-white/5 border border-white/10 p-6 lg:p-8 rounded-[2.5rem] backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  Wealth Trend 
                  {chartFilter === 'all' && (
                    <span className={`text-[10px] px-2.5 py-1 rounded-full border font-black tracking-tighter ${balance >= 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                      {balance >= 0 ? 'BULLISH' : 'BEARISH'}
                    </span>
                  )}
                </h3>
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 self-start">
                  {['all', 'income', 'expense'].map((f) => (
                    <button key={f} onClick={() => setChartFilter(f)} className={`px-4 py-1.5 text-xs rounded-lg capitalize transition-all ${chartFilter === f ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-white'}`}>{f}</button>
                  ))}
                </div>
              </div>
              
              <div className="min-h-[300px]">
                {transactions.length > 0 ? (
                  <FinancialChart data={filteredChartData} color={getChartColor()} />
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-500 gap-2 border border-dashed border-white/10 rounded-3xl">
                    <TrendingUp size={32} className="opacity-20" />
                    <p className="text-sm">No transaction data to visualize yet.</p>
                  </div>
                )}
              </div>
            </div>
            
            <TransactionList searchTerm={searchTerm} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;