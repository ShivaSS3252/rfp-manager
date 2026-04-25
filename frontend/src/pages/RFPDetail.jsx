import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, DollarSign, Package, Send, BarChart3 } from 'lucide-react';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import SendRFPPanel from '../components/SendRFPPanel';
import ProposalInbox from '../components/ProposalInbox';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function RFPDetail() {
  const { id } = useParams();
  const [rfp, setRfp] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSendPanel, setShowSendPanel] = useState(false);

  const fetchAll = useCallback(() => {
    return Promise.all([
      axios.get(`${API}/api/rfps/${id}`),
      axios.get(`${API}/api/proposals?rfpId=${id}`),
    ])
      .then(([rfpRes, propRes]) => {
        setRfp(rfpRes.data.data);
        setProposals(propRes.data.data);
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load RFP'));
  }, [id]);

  useEffect(() => {
    fetchAll().finally(() => setLoading(false));
  }, [fetchAll]);

  if (loading) return <LoadingSpinner size="lg" label="Loading RFP…" />;
  if (error) return (
    <div className="p-8">
      <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl px-5 py-4 text-rose-400 text-sm">{error}</div>
    </div>
  );
  if (!rfp) return null;

  const parsedProposals = proposals.filter(p => p.status === 'parsed' || p.status === 'reviewed');
  const sentVendors = rfp.vendorIds || [];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link
        to="/rfps"
        className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-slate-200 mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to RFPs
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{rfp.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <StatusBadge status={rfp.status} />
            <span className="text-xs text-slate-300">Created {new Date(rfp.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex gap-2 mt-1">
          {rfp.status === 'draft' && (
            <button
              onClick={() => setShowSendPanel(v => !v)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-violet-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:from-violet-500 hover:to-violet-400 transition-all duration-200 shadow-lg shadow-violet-500/25 hover:-translate-y-0.5"
            >
              <Send className="w-4 h-4" />
              Send to Vendors
            </button>
          )}
          {parsedProposals.length >= 2 && (
            <Link
              to={`/rfps/${id}/compare`}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:from-cyan-500 hover:to-cyan-400 transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:-translate-y-0.5"
            >
              <BarChart3 className="w-4 h-4" />
              Compare Proposals
            </Link>
          )}
        </div>
      </div>

      {/* Requirements card */}
      <div className="bg-slate-900/80 border border-slate-800/60 rounded-2xl p-6 mb-6 animate-fade-in-up">
        <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-5">Requirements</h2>

        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            { icon: DollarSign, label: 'Budget',        color: 'from-violet-600/20 to-violet-800/20', iconColor: 'text-violet-400', val: rfp.requirements?.budget ? `$${rfp.requirements.budget.toLocaleString()}` : '—' },
            { icon: Calendar,   label: 'Deadline',      color: 'from-cyan-600/20 to-cyan-800/20',     iconColor: 'text-cyan-400',   val: rfp.requirements?.deadline ? new Date(rfp.requirements.deadline).toLocaleDateString() : '—' },
            { icon: Package,    label: 'Payment Terms', color: 'from-purple-600/20 to-purple-800/20', iconColor: 'text-purple-400', val: rfp.requirements?.paymentTerms || '—' },
          ].map(({ icon: Icon, label, color, iconColor, val }) => (
            <div key={label} className="flex items-center gap-3">
              <div className={`bg-gradient-to-br ${color} border border-slate-700/40 p-2.5 rounded-xl`}>
                <Icon className={`w-4 h-4 ${iconColor}`} />
              </div>
              <div>
                <p className="text-xs text-slate-300">{label}</p>
                <p className="text-sm font-semibold text-slate-200">{val}</p>
              </div>
            </div>
          ))}
        </div>

        {rfp.requirements?.items?.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">Items Required</p>
            <ul className="space-y-1.5">
              {rfp.requirements.items.map((item, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-violet-500 mt-1 shrink-0">▸</span>{item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {rfp.requirements?.warranty && (
          <p className="text-sm text-slate-400 mt-3 pt-3 border-t border-slate-800/60">
            <span className="font-semibold text-slate-300">Warranty:</span> {rfp.requirements.warranty}
          </p>
        )}
        {rfp.requirements?.additionalNotes && (
          <p className="text-sm text-slate-400 mt-1">
            <span className="font-semibold text-slate-300">Notes:</span> {rfp.requirements.additionalNotes}
          </p>
        )}
      </div>

      {/* Send Panel */}
      {showSendPanel && rfp.status === 'draft' && (
        <div className="mb-6">
          <SendRFPPanel
            rfp={rfp}
            onSuccess={() => { setShowSendPanel(false); fetchAll(); }}
          />
        </div>
      )}

      {/* Proposals */}
      <ProposalInbox
        rfpId={id}
        proposals={proposals}
        sentVendors={sentVendors}
        onRefresh={setProposals}
      />
    </div>
  );
}
