import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, ArrowRight } from 'lucide-react';
import axios from 'axios';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function RFPList() {
  const [rfps, setRfps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/rfps`)
      .then(res => setRfps(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <PageHeader
        title="Requests for Proposal"
        subtitle="Manage and track all your RFPs"
        action={
          <Link
            to="/rfps/new"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-violet-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:from-violet-500 hover:to-violet-400 transition-all duration-200 shadow-lg shadow-violet-500/25 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            New RFP
          </Link>
        }
      />
      <div className="bg-slate-900/80 border border-slate-800/60 rounded-2xl overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Loading RFPs…" />
        ) : rfps.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No RFPs yet"
            description="Create your first RFP to start collecting vendor proposals."
            action={
              <Link
                to="/rfps/new"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-violet-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-violet-500 hover:to-violet-400 transition-all"
              >
                <Plus className="w-4 h-4" /> Create RFP
              </Link>
            }
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/60">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-300 uppercase tracking-widest">Title</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-300 uppercase tracking-widest">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-300 uppercase tracking-widest">Budget</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-300 uppercase tracking-widest">Deadline</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-300 uppercase tracking-widest">Created</th>
                <th />
              </tr>
            </thead>
            <tbody className="stagger">
              {rfps.map(rfp => (
                <tr key={rfp._id} className="animate-fade-in-up group border-b border-slate-800/40 last:border-0 hover:bg-slate-800/30 transition-all duration-200">
                  <td className="px-5 py-3.5">
                    <Link to={`/rfps/${rfp._id}`} className="text-sm font-semibold text-slate-200 group-hover:text-violet-300 transition-colors">
                      {rfp.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge status={rfp.status} /></td>
                  <td className="px-5 py-3.5 text-sm text-slate-400">
                    {rfp.requirements?.budget ? `$${rfp.requirements.budget.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-400">
                    {rfp.requirements?.deadline ? new Date(rfp.requirements.deadline).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-300">
                    {new Date(rfp.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition-colors" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
