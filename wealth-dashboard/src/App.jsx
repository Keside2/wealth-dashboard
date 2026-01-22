import { useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import StatCard from './components/ui/StatCard';
import { CreditCard, Wallet, TrendingUp, Menu, X, Plus, RotateCcw, Search } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { addTransaction } from './lib/transactions';
import TransactionList from './components/dashboard/TransactionList';
import Login from './pages/Login';
import { db } from './lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import FinancialChart from './components/dashboard/FinancialChart';
import BudgetProgress from './components/dashboard/BudgetProgress';
import Settings from './pages/Settings';

function App() {
  const { user } = useAuth();

  // 1. STATE MANAGEMENT
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
  const [pulses, setPulses] = useState({
    balance: false,
    income: false,
    expense: false
  });
  const [activeTab, setActiveTab] = useState('dashboard');

  // PERSISTENT CURRENCY STATE
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('wealthify_currency');
    return saved ? JSON.parse(saved) : { symbol: '$', label: 'USD' };
  });

  // Save currency to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wealthify_currency', JSON.stringify(currency));
  }, [currency]);

  // 2. REAL-TIME DATA FETCHING
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTransactions(data);
    }, (error) => {
      console.error("Firestore Error:", error);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // UNIVERSAL CURRENCY FORMATTER
  const formatCurrency = (value) => {
    return `${currency.symbol}${Number(value).toLocaleString()}`;
  };

  // 3. FINANCIAL CALCULATIONS
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const balance = totalIncome - totalExpense;

  // 5. DYNAMIC CATEGORY ENGINE
  const savedCategories = [...new Set(transactions.map(t => t.category))];
  const allCategories = [...new Set(['General', 'Food', 'Transport', 'Rent', 'Tech', 'Salary', ...savedCategories])];

  const categoryTotals = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});

  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  // 6. CHART DATA GENERATION
  const filteredChartData = useMemo(() => {
    let runningBalance = 0;
    const points = transactions.map((t, index) => {
      const amt = Number(t.amount || 0);
      t.type === 'income' ? (runningBalance += amt) : (runningBalance -= amt);

      return {
        id: t.id,
        x: t.createdAt?.toMillis() ?? index,
        dateLabel: t.createdAt?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || 'Pending',
        amount: chartFilter === 'all' ? runningBalance : amt,
        type: t.type,
        title: t.title,
        rawAmount: amt
      };
    });

    return chartFilter === 'all' ? points : points.filter(p => p.type === chartFilter);
  }, [transactions, chartFilter]);

  const getChartColor = () => {
    if (chartFilter === 'expense') return '#f43f5e';
    if (chartFilter === 'income') return '#10b981';
    return balance >= 0 ? '#10b981' : '#f43f5e';
  };

  // 7. ACTION HANDLERS
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title || !amount || amount <= 0) return;
    const finalCategory = isCustomCategory ? customCategory : category;

    setPulses({
      balance: true,
      income: type === 'income',
      expense: type === 'expense'
    });

    setTimeout(() => {
      setPulses({ balance: false, income: false, expense: false });
    }, 800);

    try {
      await addTransaction(user.uid, {
        title,
        amount: Number(amount),
        type,
        category: finalCategory
      });
      setTitle(''); setAmount(''); setCustomCategory(''); setIsCustomCategory(false);
    } catch (err) {
      console.error("Failed to add transaction:", err);
    }
  };

  if (!user) return <Login />;

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans relative overflow-hidden">

      <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden fixed top-6 right-6 z-50 p-3 bg-blue-600 rounded-2xl shadow-lg transition-all">
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 lg:relative lg:translate-x-0 h-full shrink-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onNavClick={() => setIsMobileMenuOpen(false)} />
      </div>

      <main className="flex-1 h-full overflow-y-auto p-6 lg:p-12 custom-scrollbar">
        {activeTab === 'dashboard' ? (
          <>
            <header className="mb-10 pt-12 lg:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl lg:text-5xl font-bold italic tracking-tighter">Wealthify.</h1>
                <p className="text-slate-500 mt-2 font-medium">Monitoring your financial pulse, {user.displayName?.split(' ')[0]}.</p>
              </div>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input type="text" placeholder="Search history..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-white/5 border border-white/10 py-3.5 pl-12 pr-6 rounded-2xl outline-none focus:border-blue-500/40 w-full md:w-72 transition-all" />
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <StatCard title="Total Balance" amount={formatCurrency(balance)} icon={Wallet} color="text-blue-500" className={pulses.balance ? 'balance-pulse' : ''} />
              <StatCard title="Total Income" amount={formatCurrency(totalIncome)} icon={TrendingUp} color="text-emerald-500" className={pulses.income ? 'income-pulse' : ''} />
              <StatCard title="Total Expenses" amount={formatCurrency(totalExpense)} icon={CreditCard} color="text-rose-500" className={pulses.expense ? 'expense-pulse' : ''} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-1 space-y-6">
                <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 backdrop-blur-xl relative overflow-hidden group">
                  <h2 className="text-lg font-bold mb-4">Quick Add</h2>
                  <form onSubmit={handleAdd}>
                    <div className="flex gap-2 mb-4 p-1 bg-black/40 rounded-xl border border-white/5">
                      {['income', 'expense'].map((t) => (
                        <button key={t} type="button" onClick={() => setType(t)} className={`flex-1 py-2 rounded-lg text-sm capitalize transition-all ${type === t ? 'bg-white text-black font-bold' : 'text-slate-500 hover:text-slate-300'}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                    <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-black/20 border border-white/10 p-3.5 rounded-xl mb-3 outline-none" />
                    <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-black/20 border border-white/10 p-3.5 rounded-xl mb-3 outline-none" />
                    <button className="w-full bg-blue-600 py-4 rounded-xl font-bold transition-all">Add Transaction</button>
                  </form>
                </div>
                {/* Updated with Currency logic */}
                <BudgetProgress income={totalIncome} expenses={totalExpense} currencySymbol={currency.symbol} />

                <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 backdrop-blur-xl">
                  <h3 className="text-sm font-bold mb-4 text-slate-400 uppercase tracking-widest">Top Spending</h3>
                  <div className="space-y-4">
                    {topCategories.length > 0 ? topCategories.map(([cat, amt]) => (
                      <div key={cat} className="group">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white font-medium">{cat}</span>
                          <span className="text-slate-400">{formatCurrency(amt)}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${(amt / totalExpense) * 100}%` }} />
                        </div>
                      </div>
                    )) : <p className="text-xs text-slate-500">No expenses recorded yet.</p>}
                  </div>
                </div>
              </div>

              <div className="xl:col-span-2 space-y-8 pb-10">
                <div className="bg-white/5 border border-white/10 p-6 lg:p-8 rounded-[2.5rem] backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold">Wealth Trend</h3>
                    <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                      {['all', 'income', 'expense'].map((f) => (
                        <button key={f} onClick={() => setChartFilter(f)} className={`px-4 py-1.5 text-xs rounded-lg transition-all ${chartFilter === f ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>{f}</button>
                      ))}
                    </div>
                  </div>
                  <div className="min-h-[300px]">
                    {transactions.length > 0 ? <FinancialChart data={filteredChartData} color={getChartColor()} currencySymbol={currency.symbol} /> : <p>No data yet.</p>}
                  </div>
                </div>
                <TransactionList searchTerm={searchTerm} currencySymbol={currency.symbol} />
              </div>
            </div>
          </>
        ) : (
          <Settings currentCurrency={currency} setCurrency={setCurrency} />
        )}
      </main>
    </div>
  );
}

export default App;