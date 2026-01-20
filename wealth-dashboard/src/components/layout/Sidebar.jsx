import { Home, Wallet, PieChart, Settings, LogOut, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// We pass onNavClick so the menu closes on mobile after clicking a link
export default function Sidebar({ onNavClick }) {
  const { user, logout } = useAuth();

  return (
    <aside className="h-screen w-72 lg:w-64 flex flex-col p-6 bg-slate-950 border-r border-white/10 shadow-2xl">
      
      {/* Brand Logo */}
      <div className="flex items-center gap-2 px-2 mb-10">
        <div className="bg-blue-600 p-2 rounded-lg">
          <TrendingUp className="text-white" size={24} />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">Wealthify</h1>
      </div>

      {/* Navigation - Each item now calls onNavClick */}
      <nav className="flex-1 space-y-2">
        <NavItem 
          icon={Home} 
          label="Dashboard" 
          active 
          onClick={onNavClick} 
        />
        <NavItem 
          icon={Wallet} 
          label="Wallet" 
          onClick={onNavClick} 
        />
        <NavItem 
          icon={PieChart} 
          label="Analytics" 
          onClick={onNavClick} 
        />
        <NavItem 
          icon={Settings} 
          label="Settings" 
          onClick={onNavClick} 
        />
      </nav>

      {/* User Profile Section at the bottom */}
      <div className="pt-6 border-t border-white/10">
        <div className="flex items-center gap-3 mb-6 bg-white/5 p-3 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center font-bold text-white shrink-0 shadow-lg shadow-blue-500/20">
            {(user?.displayName || user?.email)?.charAt(0).toUpperCase()} 
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">
              {user?.displayName || 'User'}
            </p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        
        <button 
          onClick={logout} 
          className="w-full flex items-center gap-2 px-4 py-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all font-medium group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

// Internal NavItem for cleaner code
function NavItem({ icon: Icon, label, active = false, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 
      ${active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
        : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
    >
      <Icon size={20} />
      <span className="font-medium text-sm">{label}</span>
    </div>
  );
}