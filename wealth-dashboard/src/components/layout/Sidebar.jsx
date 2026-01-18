import { Home, Wallet, PieChart, Settings, LogOut, TrendingUp } from 'lucide-react';

const NavItem = ({ icon: Icon, label, active = false }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 
    ${active ? 'bg-white/20 text-white shadow-lg' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}>
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </div>
);

export default function Sidebar() {
  return (
    <aside className="h-screen w-64 flex flex-col p-6 bg-slate-950 border-r border-white/10">
      {/* Brand Logo */}
      <div className="flex items-center gap-2 px-2 mb-10">
        <div className="bg-blue-600 p-2 rounded-lg">
          <TrendingUp className="text-white" size={24} />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">Wealthify</h1>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 flex flex-col gap-2">
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 px-2">Menu</p>
        <NavItem icon={Home} label="Overview" active />
        <NavItem icon={Wallet} label="Assets" />
        <NavItem icon={PieChart} label="Analytics" />
      </nav>

      {/* Bottom Section */}
      <div className="pt-6 border-t border-white/5 flex flex-col gap-2">
        <NavItem icon={Settings} label="Settings" />
        <button className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}