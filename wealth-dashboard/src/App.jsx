import { useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import StatCard from './components/ui/StatCard';
import { CreditCard, Wallet, TrendingUp, Menu, X, Plus, RotateCcw, Search, Trash2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { addTransaction } from './lib/transactions';
import TransactionList from './components/dashboard/TransactionList';
import Login from './pages/Login';
import { db } from './lib/firebase';
import { collection, query, where, onSnapshot, orderBy, addDoc, deleteDoc } from 'firebase/firestore';
import FinancialChart from './components/dashboard/FinancialChart';
import BudgetProgress from './components/dashboard/BudgetProgress';
import Settings from './pages/Settings';
import { doc, updateDoc } from 'firebase/firestore';
import Goals from './components/dashboard/Goals';



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
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('wealthify_theme') || 'midnight';
  });

  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    return localStorage.getItem('wealthify_budget') || 0;
  });

  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goals, setGoals] = useState([]);
  const [editingGoal, setEditingGoal] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [depositingGoal, setDepositingGoal] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawingGoal, setWithdrawingGoal] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');





  // Function to trigger the toast
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000); // Hide after 3 seconds
  };

  // Logic to determine layout

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);


  // 2. FINANCIAL CALCULATIONS
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const balance = totalIncome - totalExpense;

  const budgetPercent = monthlyBudget > 0 ? (totalExpense / monthlyBudget) * 100 : 0;

  // handle Goal Submit 

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    if (!goalTitle || !goalTarget) return;

    try {
      if (editingGoal) {
        // UPDATE existing goal
        const goalRef = doc(db, 'goals', editingGoal.id);
        await updateDoc(goalRef, {
          title: goalTitle,
          targetAmount: Number(goalTarget),
        });
        showToast("Goal updated successfully! ✨"); // Call it AFTER the await
      } else {
        // CREATE new goal
        await addDoc(collection(db, 'goals'), {
          userId: user.uid,
          title: goalTitle,
          targetAmount: Number(goalTarget),
          currentSaved: 0,
          createdAt: new Date()
        });
        showToast("New goal created! 🎯"); // Show success for new goals too
      }

      setGoalTitle('');
      setGoalTarget('');
      setEditingGoal(null);
      setIsGoalModalOpen(false);
    } catch (err) {
      console.error("Goal save failed:", err);
      showToast("Failed to save goal ❌", "error");
    }
  };

  // This just opens the modal
  const confirmDelete = (goalId) => {
    setGoalToDelete(goalId);
  };

  // This actually talks to Firebase
  const executeDelete = async () => {
    if (!goalToDelete) return;

    try {
      await deleteDoc(doc(db, 'goals', goalToDelete));
      showToast("Goal removed forever 🗑️", "error");
      setGoalToDelete(null); // Close modal
    } catch (err) {
      console.error("Delete failed:", err);
      showToast("Error deleting goal", "error");
    }
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setGoalTitle(goal.title);
    setGoalTarget(goal.targetAmount);
    setIsGoalModalOpen(true);
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositingGoal || !depositAmount || depositAmount <= 0) return;

    try {
      const goalRef = doc(db, 'goals', depositingGoal.id);
      const newAmount = Number(depositingGoal.currentSaved || 0) + Number(depositAmount);

      await updateDoc(goalRef, {
        currentSaved: newAmount
      });

      // Optional: Add a transaction record automatically so it shows in history
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        title: `Saved for ${depositingGoal.title}`,
        amount: Number(depositAmount),
        type: 'expense', // We treat it as an expense from the main balance
        category: 'Savings',
        createdAt: new Date()
      });

      showToast(`Added ${currency.symbol}${depositAmount} to ${depositingGoal.title}! 💰`);
      setDepositAmount('');
      setDepositingGoal(null);
    } catch (err) {
      console.error("Deposit failed:", err);
      showToast("Transaction failed", "error");
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);

    // Safety check: Don't withdraw more than what is saved
    if (!withdrawingGoal || amount <= 0) return;
    if (amount > withdrawingGoal.currentSaved) {
      showToast("Not enough funds in this goal!", "error");
      return;
    }

    try {
      const goalRef = doc(db, 'goals', withdrawingGoal.id);
      const newAmount = Number(withdrawingGoal.currentSaved) - amount;

      // 1. Update the Goal in Firestore
      await updateDoc(goalRef, { currentSaved: newAmount });

      // 2. Add an 'Income' transaction to restore the main balance
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        title: `Withdrawal from ${withdrawingGoal.title}`,
        amount: amount,
        type: 'income', // This adds it back to your total balance
        category: 'Savings',
        createdAt: new Date()
      });

      showToast(`Withdrew ${currency.symbol}${amount} successfully! 💸`);
      setWithdrawAmount('');
      setWithdrawingGoal(null);
    } catch (err) {
      console.error("Withdrawal failed:", err);
      showToast("Error processing withdrawal", "error");
    }
  };

  const handleSaveBudget = async (newBudget) => {
    setMonthlyBudget(newBudget);
    localStorage.setItem('wealthify_budget', newBudget);

    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { monthlyBudget: Number(newBudget) });
      } catch (err) {
        console.error("Firebase budget sync failed:", err);
      }
    }
  };


  // PERSISTENT CURRENCY STATE
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('wealthify_currency');
    return saved ? JSON.parse(saved) : { symbol: '$', label: 'USD' };
  });

  // Save currency to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wealthify_currency', JSON.stringify(currency));
  }, [currency]);

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('wealthify_theme', theme);
  }, [theme]);

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

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'goals'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGoals(data);
    }, (error) => {
      console.error("Goals Fetch Error:", error);
    });

    return () => unsubscribe();
  }, [user?.uid]);



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

      <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 lg:p-12 custom-scrollbar">
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

            <div className="budget-card">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Monthly Budget</span>
                  <h2 className="text-xl font-bold">{formatCurrency(monthlyBudget)}</h2>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Remaining</span>
                  <h2 className={`text-xl font-bold ${balance < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {formatCurrency(monthlyBudget - totalExpense)}
                  </h2>
                </div>
              </div>

              <div className="budget-progress-container">
                <div
                  className={`budget-progress-bar ${budgetPercent > 90 ? 'danger' : budgetPercent > 70 ? 'warning' : ''}`}
                  style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 mt-2">{budgetPercent.toFixed(1)}% of limit reached</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-1 space-y-6">
                <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 backdrop-blur-xl relative overflow-hidden group">
                  <h2 className="text-lg font-bold mb-4">Quick Add</h2>
                  <form onSubmit={handleAdd}>
                    {/* Type Toggle (Income/Expense) */}
                    <div className="flex gap-2 mb-4 p-1 bg-black/40 rounded-xl border border-white/5">
                      {['income', 'expense'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setType(t)}
                          className={`flex-1 py-2 rounded-lg text-sm capitalize transition-all ${type === t ? 'bg-white text-black font-bold' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-black/20 border border-white/10 p-3.5 rounded-xl mb-3 outline-none focus:border-blue-500/50 transition-all" />

                    <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-black/20 border border-white/10 p-3.5 rounded-xl mb-3 outline-none focus:border-blue-500/50 transition-all" />

                    {/* Category Selection Logic */}
                    <div className="mb-4">
                      {!isCustomCategory ? (
                        <select
                          value={category}
                          onChange={(e) => {
                            if (e.target.value === 'custom') {
                              setIsCustomCategory(true);
                            } else {
                              setCategory(e.target.value);
                            }
                          }}
                          className="w-full bg-black/80 border border-white/10 p-3.5 rounded-xl outline-none text-slate-300 appearance-none cursor-pointer focus:border-blue-500/50 transition-all okay"

                        >
                          <option value="General">Select Category</option>
                          {type === 'income' ? (
                            <>
                              <option value="Salary">Salary</option>
                              <option value="Freelance">Freelance</option>
                              <option value="Investment">Investment</option>
                            </>
                          ) : (
                            <>
                              <option value="Food">Food</option>
                              <option value="Transport">Transport</option>
                              <option value="Shopping">Shopping</option>
                              <option value="Bills">Bills</option>
                            </>
                          )}
                          <option value="custom" className="text-blue-400">+ Add Custom</option>
                        </select>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="New Category Name"
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            className="flex-1 bg-black/20 border border-blue-500/30 p-3.5 rounded-xl outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setIsCustomCategory(false);
                              setCustomCategory('');
                            }}
                            className="px-4 bg-white/5 hover:bg-white/10 rounded-xl text-xs transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>

                    <button className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20">
                      Add Transaction
                    </button>
                  </form>
                </div>
                {/* Updated with Currency logic */}
                <BudgetProgress income={totalIncome} expenses={totalExpense} currencySymbol={currency.symbol} />


                {/* ONLY show here if goals are few */}
                {/* Show in sidebar ONLY if goals are 0 or 1 */}
                {goals.length < 2 && (
                  <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 backdrop-blur-xl">
                    <Goals
                      goals={goals}
                      onAddClick={() => { setEditingGoal(null); setIsGoalModalOpen(true); }}
                      onEditClick={handleEditGoal}
                      onDeleteClick={confirmDelete}
                      onDepositClick={(goal) => setDepositingGoal(goal)}
                      onWithdrawClick={(goal) => setWithdrawingGoal(goal)}
                      formatCurrency={formatCurrency}
                    />
                  </div>
                )}
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
                  <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:justify-between sm:items-center">
                    <h3 className="text-xl font-bold">Wealth Trend</h3>
                    <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 self-start sm:self-auto">
                      {['all', 'income', 'expense'].map((f) => (
                        <button
                          key={f}
                          onClick={() => setChartFilter(f)}
                          className={`px-4 py-1.5 text-xs rounded-lg transition-all ${chartFilter === f ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="min-h-[300px]">
                    {transactions.length > 0 ? <FinancialChart data={filteredChartData} color={getChartColor()} currencySymbol={currency.symbol} /> : <p>No data yet.</p>}
                  </div>
                </div>

                {/* GOALS SECTION */}
                {/* Show in main area ONLY if goals are 2 or more */}
                {goals.length >= 2 && (
                  <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-xl mb-8">
                    <Goals
                      goals={goals}
                      onAddClick={() => { setEditingGoal(null); setIsGoalModalOpen(true); }}
                      onEditClick={handleEditGoal}
                      onDeleteClick={confirmDelete}
                      onDepositClick={(goal) => setDepositingGoal(goal)}
                      onWithdrawClick={(goal) => setWithdrawingGoal(goal)}
                      formatCurrency={formatCurrency}
                    />
                  </div>
                )}


                <TransactionList searchTerm={searchTerm} currencySymbol={currency.symbol} />


              </div>
            </div>
          </>
        ) : (


          <Settings
            currentCurrency={currency}
            setCurrency={setCurrency}
            currentTheme={theme}
            setTheme={setTheme}
            monthlyBudget={monthlyBudget}
            handleSaveBudget={handleSaveBudget}
          />
        )}

        {isGoalModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">New Saving Goal</h2>
                <button onClick={() => setIsGoalModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleGoalSubmit}>
                <div className="mb-4">
                  <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">Goal Name</label>
                  <input
                    type="text"
                    placeholder="e.g. MacBook Pro"
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 p-3.5 rounded-xl outline-none focus:border-blue-500/50 transition-all"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">Target Amount</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 p-3.5 rounded-xl outline-none focus:border-blue-500/50 transition-all"
                    required
                  />
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20">
                  Create Goal
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
      {goalToDelete && (
        <div className="modal-overlay">
          <div className="modal-content text-center max-w-[350px]">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>

            <h2 className="text-xl font-bold mb-2">Delete Goal?</h2>
            <p className="text-slate-400 text-sm mb-8">
              Are you sure? This will permanently remove your progress for this goal.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setGoalToDelete(null)}
                className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 rounded-2xl font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-500 rounded-2xl font-bold transition-all shadow-lg shadow-rose-600/20"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === 'success' ? '✅' : '🗑️'} {toast.message}
        </div>
      )}

      {depositingGoal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-[400px]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold">Add Savings</h2>
                <p className="text-xs text-slate-500">Target: {depositingGoal.title}</p>
              </div>
              <button onClick={() => setDepositingGoal(null)}><X size={20} /></button>
            </div>

            <form onSubmit={handleDeposit}>
              <div className="mb-6">
                <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">Amount to Save</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{currency.symbol}</span>
                  <input
                    type="number"
                    autoFocus
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 p-4 pl-10 rounded-2xl outline-none focus:border-emerald-500/50 transition-all text-xl font-bold"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-600/20">
                Confirm Deposit
              </button>
            </form>
          </div>
        </div>
      )}

      {withdrawingGoal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-[400px]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold">Withdraw Funds</h2>
                <p className="text-xs text-slate-500">Available: {currency.symbol}{withdrawingGoal.currentSaved}</p>
              </div>
              <button onClick={() => setWithdrawingGoal(null)}><X size={20} /></button>
            </div>

            <form onSubmit={handleWithdraw}>
              <div className="mb-6">
                <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">Amount to Withdraw</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{currency.symbol}</span>
                  <input
                    type="number"
                    autoFocus
                    max={withdrawingGoal.currentSaved} // Browser level safety
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 p-4 pl-10 rounded-2xl outline-none focus:border-rose-500/50 transition-all text-xl font-bold"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-rose-600 hover:bg-rose-500 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-rose-600/20">
                Confirm Withdrawal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;