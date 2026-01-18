import Sidebar from './components/layout/Sidebar';
import StatCard from './components/ui/StatCard';
import TransactionItem from './components/ui/TransactionItem'; // Import it
import { DollarSign, CreditCard, Wallet, ArrowUpRight } from 'lucide-react';

function App() {
  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-sans">
      <Sidebar />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        {/* Header and Stats Grid stay the same... */}
        
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