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

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-sm font-semibold text-gray-800 mb-4">Send RFP to Vendors</h2>

      {fetchLoading ? (
        <LoadingSpinner />
      ) : result ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-green-700">
            <CheckCircle className="w-4 h-4" />
            Sent to {result.sent.length} vendor{result.sent.length !== 1 ? 's' : ''}
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Emails Sent</p>
            <div className="space-y-2">
              {result.sent.map(s => (
                <div key={s.email} className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
                  <span className="text-sm text-gray-800 font-medium">
                    {s.vendorName || s.email}
                    <span className="text-xs text-gray-500 font-normal ml-2">{s.email}</span>
                  </span>
                  {s.previewUrl ? (
                    <a
                      href={s.previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium shrink-0 ml-3"
                    >
                      Preview Email <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400">No preview</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {result.failed.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-red-600">Failed:</p>
              {result.failed.map(f => (
                <p key={f.email} className="text-xs text-red-500 ml-2">• {f.vendorName || f.email}: {f.error}</p>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-3">Select Vendors</p>
            {vendors.length === 0 ? (
              <p className="text-sm text-gray-400">No vendors found. Add vendors first.</p>
            ) : (
              <div className="space-y-2">
                {vendors.map(v => (
                  <label key={v._id} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selected.includes(v._id)}
                      onChange={() => toggle(v._id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-800 group-hover:text-gray-900">{v.name}</span>
                    <span className="text-xs text-gray-400">{v.email}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 mb-3">Email Preview</p>
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1 max-h-52 overflow-y-auto font-mono leading-relaxed">
              <p><strong>Subject:</strong> Request for Proposal — {rfp.title}</p>
              <p className="pt-1">Dear [Vendor],</p>
              <p className="pt-1">PROJECT: {rfp.title}</p>
              <p>DEADLINE: {deadline}</p>
              <p>BUDGET: ${rfp.requirements?.budget?.toLocaleString() || 'TBD'}</p>
              {rfp.requirements?.items?.length > 0 && (
                <div className="pt-1">
                  <p>ITEMS:</p>
                  {rfp.requirements.items.map((item, i) => <p key={i} className="ml-2">• {item}</p>)}
                </div>
              )}
              <p className="pt-1">Payment: {rfp.requirements?.paymentTerms || 'TBD'}</p>
              <p>Warranty: {rfp.requirements?.warranty || 'TBD'}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 mt-3 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {!result && (
        <div className="mt-5 flex justify-end">
          <button
            onClick={handleSend}
            disabled={sending || selected.length === 0}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {sending
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Send className="w-4 h-4" />
            }
            {sending ? 'Sending…' : `Send to ${selected.length || 0} vendor${selected.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  );
}
