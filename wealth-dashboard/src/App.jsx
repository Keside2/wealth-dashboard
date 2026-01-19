import { useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import StatCard from './components/ui/StatCard';
import TransactionItem from './components/ui/TransactionItem'; // Import it
import { DollarSign, CreditCard, Wallet, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { addTransaction } from './lib/transactions';
import TransactionList from './components/dashboard/TransactionList';
import Login from './pages/Login';

function App() {
  const { user, logout } = useAuth();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');


  const handleAdd = async (e) => {
    e.preventDefault();
    await addTransaction(user.uid, {
      title,
      amount,
      type: 'income',
      category: 'General'
    });
    setTitle('');
    setAmount('');
    alert("Transaction added to database!");
  };

  // 🔒 PROTECTED ROUTE LOGIC
  // If no user, show the Login Page
  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-sans">
      <Sidebar />
      
     <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Welcome, {user.displayName}</h1>
        
        {/* Simple Form to Test Firestore */}
        <form onSubmit={handleAdd} className="bg-white/5 p-6 rounded-2xl border border-white/10 max-w-md mb-8">
          <h2 className="text-lg mb-4">Quick Add Transaction</h2>
          <input 
            type="text" 
            placeholder="Title (e.g. Salary)" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-black/20 border border-white/10 p-3 rounded-xl mb-3"
          />
          <input 
            type="number" 
            placeholder="Amount" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-black/20 border border-white/10 p-3 rounded-xl mb-3"
          />
          <button className="w-full bg-blue-600 p-3 rounded-xl font-bold">Add to Cloud</button>
        </form>

        <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
  <header className="mb-10">
    <h1 className="text-3xl font-bold">Welcome back, {user.displayName}!</h1>
    <p className="text-slate-500">Here's what's happening with your wealth today.</p>
  </header>

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    {/* LEFT SIDE: Form & Stats */}
    <div className="lg:col-span-1 space-y-6">
       {/* (Keep your Add Transaction form here) */}
    </div>

    {/* RIGHT SIDE: The List */}
    <div className="lg:col-span-2">
       <TransactionList />
    </div>
  </div>
</main>


        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Placeholder (Taking up 2 columns) */}
          <div className="lg:col-span-2 rounded-3xl bg-white/5 border border-white/10 p-8 flex flex-col justify-center items-center text-slate-500">
             <div className="h-40 w-full bg-gradient-to-t from-blue-500/20 to-transparent rounded-t-full blur-3xl opacity-20"></div>
             <p className="font-medium">Market Analysis Chart Coming Soon</p>
          </div>

          {/* Transactions Feed (Taking up 1 column) */}
          <div className="rounded-3xl bg-white/5 border border-white/10 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Recent Activity</h3>
              <button className="text-blue-400 text-sm hover:underline flex items-center gap-1">
                View all <ArrowUpRight size={14} />
              </button>
            </div>
            
            <div className="space-y-2">
              <TransactionItem name="Apple Store" category="Technology" date="Jan 18" amount="1,299.00" type="expense" />
              <TransactionItem name="Stripe Payout" category="Freelance" date="Jan 17" amount="4,500.00" type="income" />
              <TransactionItem name="Netflix" category="Entertainment" date="Jan 15" amount="15.99" type="expense" />
              <TransactionItem name="Amazon" category="Shopping" date="Jan 14" amount="84.50" type="expense" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;