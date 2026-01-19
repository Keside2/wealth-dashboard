import { Home, Wallet, PieChart, Settings, LogOut, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NavItem = ({ icon: Icon, label, active = false }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 
    ${active ? 'bg-white/20 text-white shadow-lg' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}>
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </div>
);

export default function Sidebar() {

  const { user, logout } = useAuth();

  return (
    <aside className="h-screen w-64 flex flex-col p-6 bg-slate-950 border-r border-white/10">
      {/* Brand Logo */}
      <div className="flex items-center gap-2 px-2 mb-10">
        <div className="bg-blue-600 p-2 rounded-lg">
          <TrendingUp className="text-white" size={24} />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">Wealthify</h1>
      </div>

      {/* User Profile Section at the bottom */}
      <div className="pt-6 border-t border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center font-bold text-white">
            {/* Show first letter of Username or Email */}
            {(user?.displayName || user?.email)?.charAt(0).toUpperCase()} 
          </div>
          <div className="overflow-hidden">
            {/* Show Username if exists, otherwise show email */}
            <p className="text-sm font-bold text-white truncate">
                {user?.displayName || 'User'}
            </p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={logout} className="text-xs text-rose-400">Sign Out</button>
      </div>
    </aside>
  );
}