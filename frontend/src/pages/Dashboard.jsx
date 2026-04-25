import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, RefreshCw, Building2, Inbox, ArrowRight, TrendingUp } from 'lucide-react';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Dashboard() {
  const [stats, setStats] = useState({ rfps: 0, activeRfps: 0, vendors: 0, proposals: 0 });
  const [recentRfps, setRecentRfps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/api/rfps`),
      axios.get(`${API}/api/vendors`),
      axios.get(`${API}/api/proposals`),
    ])
      .then(([rfpsRes, vendorsRes, proposalsRes]) => {
        const rfps = rfpsRes.data.data;
        setStats({
          rfps: rfps.length,
          activeRfps: rfps.filter(r => ['sent', 'receiving'].includes(r.status)).length,
          vendors: vendorsRes.data.data.length,
          proposals: proposalsRes.data.data.length,
        });
        setRecentRfps(rfps.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total RFPs',        value: stats.rfps,        icon: FileText,   from: 'from-violet-600', to: 'to-violet-800', glow: 'shadow-violet-500/20' },
    { label: 'Active RFPs',       value: stats.activeRfps,  icon: RefreshCw,  from: 'from-cyan-500',   to: 'to-cyan-700',   glow: 'shadow-cyan-500/20'   },
    { label: 'Vendors',           value: stats.vendors,     icon: Building2,  from: 'from-purple-600', to: 'to-purple-800', glow: 'shadow-purple-500/20' },
    { label: 'Proposals In',      value: stats.proposals,   icon: Inbox,      from: 'from-emerald-500',to: 'to-emerald-700',glow: 'shadow-emerald-500/20'},
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Procurement <span className="shimmer-text">Dashboard</span>
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Overview of your AI-powered procurement activity</p>
        </div>
        <Link
          to="/rfps/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-violet-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-violet-500 hover:to-violet-400 transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          New RFP
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" label="Loading dashboard…" />
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-4 gap-4 mb-8 stagger">
            {statCards.map(({ label, value, icon: Icon, from, to, glow }) => (
              <div key={label} className={`animate-fade-in-up relative bg-slate-900/80 border border-slate-800/60 rounded-2xl p-5 overflow-hidden hover:-translate-y-1 transition-all duration-300 shadow-lg ${glow}`}>
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${from} ${to} opacity-10 rounded-full blur-2xl -translate-y-6 translate-x-6`} />
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest">{label}</p>
                  <div className={`w-9 h-9 bg-gradient-to-br ${from} ${to} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-white">{value}</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-slate-300">
                  <TrendingUp className="w-3 h-3" /> All time
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Recent RFPs */}
            <div className="bg-slate-900/80 border border-slate-800/60 rounded-2xl overflow-hidden animate-fade-in-up">
              <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-200">Recent RFPs</h2>
                <Link to="/rfps" className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {recentRfps.length === 0 ? (
                <div className="flex flex-col items-center py-10">
                  <p className="text-sm text-slate-300">No RFPs yet</p>
                  <Link to="/rfps/new" className="mt-2 text-xs text-violet-400 hover:text-violet-300 transition-colors">Create your first →</Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/60">
                  {recentRfps.map(rfp => (
                    <Link
                      key={rfp._id}
                      to={`/rfps/${rfp._id}`}
                      className="group flex items-center justify-between px-5 py-3.5 hover:bg-slate-800/40 transition-all duration-200"
                    >
                      <span className="text-sm text-slate-300 group-hover:text-white truncate max-w-[180px] transition-colors font-medium">{rfp.title}</span>
                      <StatusBadge status={rfp.status} />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-900/80 border border-slate-800/60 rounded-2xl overflow-hidden animate-fade-in-up">
              <div className="px-5 py-4 border-b border-slate-800/60">
                <h2 className="text-sm font-semibold text-slate-200">Quick Actions</h2>
              </div>
              <div className="p-4 space-y-2">
                {[
                  { to: '/rfps/new', icon: FileText, label: 'Create new RFP', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
                  { to: '/vendors', icon: Building2, label: 'Manage vendors',  color: 'text-cyan-400',   bg: 'bg-cyan-500/10 border-cyan-500/20'   },
                  { to: '/rfps',    icon: RefreshCw, label: 'View all RFPs',   color: 'text-emerald-400',bg: 'bg-emerald-500/10 border-emerald-500/20'},
                ].map(({ to, icon: Icon, label, color, bg }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${bg} hover:opacity-80 transition-all duration-200 group`}
                  >
                    <Icon className={`w-4 h-4 ${color} shrink-0`} />
                    <span className={`text-sm font-medium ${color}`}>{label}</span>
                    <ArrowRight className={`w-3.5 h-3.5 ${color} ml-auto opacity-0 group-hover:opacity-100 transition-opacity`} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
