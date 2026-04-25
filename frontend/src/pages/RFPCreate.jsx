import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Wand2 } from 'lucide-react';
import axios from 'axios';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import RFPPreviewCard from '../components/RFPPreviewCard';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function RFPCreate() {
  const [rawInput, setRawInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parsed, setParsed] = useState(null);
  const navigate = useNavigate();

  async function handleGenerate() {
    if (!rawInput.trim()) { setError('Please describe what you want to procure.'); return; }
    setLoading(true);
    setError('');
    setParsed(null);
    try {
      const res = await axios.post(`${API}/api/rfps/parse`, { rawInput });
      setParsed({ ...res.data.data, rawInput });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not parse your request. Please be more specific.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(rfpData) {
    const res = await axios.post(`${API}/api/rfps`, rfpData);
    navigate(`/rfps/${res.data.data._id}`);
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <PageHeader
        title="Create New RFP"
        subtitle="Describe your procurement need and let AI structure it"
      />

      <div className="relative bg-slate-900/80 border border-slate-800/60 rounded-2xl p-6 overflow-hidden animate-fade-in-up">
        {/* background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/5 rounded-full blur-3xl -translate-y-12 translate-x-12 pointer-events-none" />

        <label className="block text-sm font-semibold text-slate-300 mb-2">
          What do you want to procure?
        </label>
        <p className="text-xs text-slate-300 mb-3">Be as specific as possible — quantity, specs, budget, timeline, terms</p>
        <textarea
          rows={6}
          value={rawInput}
          onChange={e => setRawInput(e.target.value)}
          placeholder="e.g. We need 20 laptops with 16GB RAM, 512GB SSD for a software dev team. Budget $30,000. Delivery within 4 weeks. Net 30 payment. 1 year warranty..."
          className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
          onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleGenerate(); }}
        />

        {error && (
          <div className="mt-3 flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
            <p className="text-sm text-rose-400">{error}</p>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-slate-400">Tip: Press ⌘+Enter to generate</p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-violet-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:from-violet-500 hover:to-violet-400 transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed"
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Sparkles className="w-4 h-4" />
            }
            {loading ? 'Generating with AI…' : 'Generate RFP'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="mt-6 animate-fade-in">
          <LoadingSpinner size="lg" label="AI is structuring your RFP…" />
        </div>
      )}

      {parsed && !loading && (
        <div className="mt-6 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-3">
            <Wand2 className="w-4 h-4 text-violet-400" />
            <p className="text-sm font-semibold text-violet-300">AI-Generated — Review &amp; Edit Before Saving</p>
          </div>
          <RFPPreviewCard data={parsed} onSave={handleSave} />
        </div>
      )}
    </div>
  );
}
