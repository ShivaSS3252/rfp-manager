import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, ClipboardList, Zap } from 'lucide-react';

const navItems = [
  { to: '/',        label: 'Dashboard', icon: LayoutDashboard },
  { to: '/rfps',    label: 'RFPs',      icon: FileText        },
  { to: '/vendors', label: 'Vendors',   icon: Users           },
];

export default function Sidebar() {
  return (
    <aside className="flex flex-col w-64 min-h-screen bg-slate-950 border-r border-slate-800/60 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-slate-800/60">
        <div className="relative">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
            <ClipboardList className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="absolute -inset-1 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-xl opacity-20 blur-sm -z-10" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight tracking-tight">RFP Manager</p>
          <p className="text-slate-500 text-xs leading-tight mt-0.5 flex items-center gap-1">
            <Zap className="w-2.5 h-2.5 text-violet-400" /> AI-Powered
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Navigation</p>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30 shadow-lg shadow-violet-500/10'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-violet-500/20'
                    : 'bg-slate-800/60 group-hover:bg-slate-700/60'
                }`}>
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-violet-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                </div>
                {label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-800/60">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-xs text-slate-500">System online</p>
        </div>
      </div>
    </aside>
  );
}
