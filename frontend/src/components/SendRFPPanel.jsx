import { useState, useEffect } from 'react';
import { Send, AlertCircle, ExternalLink, CheckCircle } from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function SendRFPPanel({ rfp, onSuccess }) {
  const [vendors, setVendors] = useState([]);
  const [selected, setSelected] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    axios.get(`${API}/api/vendors`)
      .then(res => setVendors(res.data.data))
      .catch(() => setError('Failed to load vendors'))
      .finally(() => setFetchLoading(false));
  }, []);

  function toggle(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  }

  async function handleSend() {
    if (selected.length === 0) { setError('Select at least one vendor'); return; }
    setSending(true);
    setError('');
    try {
      const res = await axios.post(`${API}/api/rfps/${rfp._id}/send`, { vendorIds: selected });
      console.log('[SendRFPPanel] Full API response:', res.data);
      setResult(res.data.data);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send emails');
    } finally {
      setSending(false);
    }
  }

  const deadline = rfp.requirements?.deadline
    ? new Date(rfp.requirements.deadline).toLocaleDateString()
    : 'TBD';

  const inputCls = 'rounded-lg border border-slate-700/60 bg-slate-800/40 px-3 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-violet-500/40';

  return (
    <div className="bg-slate-900/80 border border-slate-800/60 rounded-2xl p-6 animate-fade-in-up">
      <h2 className="text-sm font-semibold text-slate-200 mb-5">Send RFP to Vendors</h2>

      {fetchLoading ? (
        <LoadingSpinner label="Loading vendors…" />
      ) : result ? (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
            <CheckCircle className="w-4 h-4" />
            Sent to {result.sent.length} vendor{result.sent.length !== 1 ? 's' : ''}
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-3">Emails Sent</p>
            <div className="space-y-2">
              {result.sent.map(s => (
                <div key={s.email} className="flex items-center justify-between bg-cyan-500/5 border border-cyan-500/20 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{s.vendorName || s.email}</p>
                    <p className="text-xs text-slate-300">{s.email}</p>
                  </div>
                  {s.previewUrl ? (
                    <a
                      href={s.previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-lg transition-all hover:-translate-y-0.5"
                    >
                      Preview Email <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-300">No preview</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {result.failed.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-rose-400">Failed:</p>
              {result.failed.map(f => (
                <p key={f.email} className="text-xs text-rose-400/70 ml-2">• {f.vendorName || f.email}: {f.error}</p>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-3">Select Vendors</p>
            {vendors.length === 0 ? (
              <p className="text-sm text-slate-300">No vendors found. Add vendors first.</p>
            ) : (
              <div className="space-y-2">
                {vendors.map(v => (
                  <label key={v._id} className="flex items-center gap-2.5 cursor-pointer group p-2.5 rounded-xl hover:bg-slate-800/40 transition-colors">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 shrink-0 ${
                      selected.includes(v._id)
                        ? 'bg-violet-600 border-violet-600'
                        : 'border-slate-600 group-hover:border-violet-500'
                    }`}>
                      {selected.includes(v._id) && (
                        <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-white fill-none stroke-current stroke-2">
                          <polyline points="1,6 4,9 11,2" />
                        </svg>
                      )}
                    </div>
                    <input type="checkbox" checked={selected.includes(v._id)} onChange={() => toggle(v._id)} className="sr-only" />
                    <div>
                      <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{v.name}</p>
                      <p className="text-xs text-slate-300">{v.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-3">Email Preview</p>
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 text-xs text-slate-400 space-y-1 max-h-52 overflow-y-auto font-mono leading-relaxed">
              <p><span className="text-violet-400">Subject:</span> Request for Proposal — {rfp.title}</p>
              <p className="pt-1 text-slate-300">Dear [Vendor],</p>
              <p className="pt-1"><span className="text-cyan-400">PROJECT:</span> {rfp.title}</p>
              <p><span className="text-cyan-400">DEADLINE:</span> {deadline}</p>
              <p><span className="text-cyan-400">BUDGET:</span> ${rfp.requirements?.budget?.toLocaleString() || 'TBD'}</p>
              {rfp.requirements?.items?.length > 0 && (
                <div className="pt-1">
                  <p className="text-cyan-400">ITEMS:</p>
                  {rfp.requirements.items.map((item, i) => <p key={i} className="ml-2 text-slate-400">• {item}</p>)}
                </div>
              )}
              <p className="pt-1"><span className="text-cyan-400">Payment:</span> {rfp.requirements?.paymentTerms || 'TBD'}</p>
              <p><span className="text-cyan-400">Warranty:</span> {rfp.requirements?.warranty || 'TBD'}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 mt-3 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <p className="text-sm text-rose-400">{error}</p>
        </div>
      )}

      {!result && (
        <div className="mt-5 flex justify-end">
          <button
            onClick={handleSend}
            disabled={sending || selected.length === 0}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-violet-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:from-violet-500 hover:to-violet-400 transition-all duration-200 shadow-lg shadow-violet-500/25 hover:-translate-y-0.5 disabled:opacity-40 disabled:translate-y-0 disabled:cursor-not-allowed"
          >
            {sending
              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Send className="w-4 h-4" />
            }
            {sending ? 'Sending…' : `Send to ${selected.length || 0} vendor${selected.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  );
}
