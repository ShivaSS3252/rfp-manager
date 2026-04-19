import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, RefreshCw, Building2, Inbox } from 'lucide-react';
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
    { label: 'Total RFPs', value: stats.rfps, icon: FileText, bg: 'bg-blue-50', color: 'text-blue-600' },
    { label: 'Active RFPs', value: stats.activeRfps, icon: RefreshCw, bg: 'bg-yellow-50', color: 'text-yellow-600' },
    { label: 'Vendors', value: stats.vendors, icon: Building2, bg: 'bg-purple-50', color: 'text-purple-600' },
    { label: 'Proposals Received', value: stats.proposals, icon: Inbox, bg: 'bg-green-50', color: 'text-green-600' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Overview of your procurement activity</p>
        </div>
        <Link
          to="/rfps/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New RFP
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 mb-8">
            {statCards.map(({ label, value, icon: Icon, bg, color }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                  <div className={`${bg} ${color} p-1.5 rounded-lg`}><Icon className="w-4 h-4" /></div>
                </div>
                <p className="text-3xl font-semibold text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">Recent RFPs</h2>
                <Link to="/rfps" className="text-xs text-blue-600 hover:underline">View all</Link>
              </div>
              {recentRfps.length === 0 ? (
                <div className="flex flex-col items-center py-10">
                  <p className="text-sm text-gray-400">No RFPs yet</p>
                  <Link to="/rfps/new" className="mt-2 text-xs text-blue-600 hover:underline">Create your first →</Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {recentRfps.map(rfp => (
                    <Link
                      key={rfp._id}
                      to={`/rfps/${rfp._id}`}
                      className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm text-gray-800 truncate max-w-[180px]">{rfp.title}</span>
                      <StatusBadge status={rfp.status} />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-800">Quick Actions</h2>
              </div>
              <div className="p-5 space-y-3">
                <Link to="/rfps/new" className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors">
                  <FileText className="w-4 h-4" /> Create new RFP
                </Link>
                <Link to="/vendors" className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors">
                  <Building2 className="w-4 h-4" /> Manage vendors
                </Link>
                <Link to="/rfps" className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors">
                  <RefreshCw className="w-4 h-4" /> View all RFPs
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
