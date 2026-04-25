import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, CheckCircle, Zap } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function RecommendationCard({ recommendation, proposals, rfpId, rfpClosed }) {
  const navigate = useNavigate();
  const [awarding, setAwarding] = useState(false);
  const [awarded, setAwarded] = useState(rfpClosed);
  const [confirm, setConfirm] = useState(false);

  const winner = proposals.find(
    p =>
      p.vendorId?._id?.toString() === recommendation?.vendorId ||
      p._id?.toString() === recommendation?.vendorId
  );

  async function handleAward() {
    setAwarding(true);
    try {
      await axios.patch(`${API}/api/rfps/${rfpId}/award`, { vendorId: recommendation.vendorId });
      setAwarded(true);
      setTimeout(() => navigate('/rfps'), 1500);
    } catch (err) {
      console.error('Award failed:', err.message);
    } finally {
      setAwarding(false);
      setConfirm(false);
    }
  }

  if (!recommendation) return null;

  const scores = [
    { label: 'Price',        value: winner?.aiScore?.priceScore,       color: 'from-violet-500 to-violet-700',  glow: 'shadow-violet-500/30' },
    { label: 'Delivery',     value: winner?.aiScore?.deliveryScore,     color: 'from-cyan-500 to-cyan-700',      glow: 'shadow-cyan-500/30'   },
    { label: 'Completeness', value: winner?.aiScore?.completenessScore, color: 'from-emerald-500 to-emerald-700',glow: 'shadow-emerald-500/30'},
  ];

  return (
    <div className="relative bg-slate-900/80 border border-amber-500/20 rounded-2xl p-6 overflow-hidden animate-fade-in-up">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between mb-6 relative">
        <div className="flex items-center gap-3">
          <div className="relative animate-float">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400/20 to-yellow-500/20 border border-amber-400/30 rounded-2xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-400/70 uppercase tracking-widest mb-0.5">AI Recommendation</p>
            <h2 className="text-xl font-black text-white tracking-tight">
              We Recommend: <span className="shimmer-text">{recommendation.vendorName}</span>
            </h2>
          </div>
        </div>

        {winner?.aiScore?.overall != null && (
          <div className="text-center bg-slate-800/60 border border-slate-700/60 rounded-2xl px-5 py-3">
            <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-violet-300 to-violet-500">
              {winner.aiScore.overall}
            </p>
            <p className="text-xs text-slate-300 mt-0.5">/ 100</p>
          </div>
        )}
      </div>

      {/* Score bars */}
      {winner?.aiScore && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {scores.map(({ label, value, color, glow }) => (
            <div key={label} className={`bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 hover:shadow-lg ${glow} transition-all duration-300`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-slate-400">{label}</span>
                <span className="text-sm font-black text-white">{value ?? '—'}{value != null ? '' : ''}</span>
              </div>
              <div className="h-2 bg-slate-700/60 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-700`}
                  style={{ width: `${value ?? 0}%` }}
                />
              </div>
              {value != null && (
                <p className="text-xs text-slate-300 mt-1.5 text-right">{value}/100</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* AI reasoning */}
      {winner?.aiScore?.reasoning && (
        <div className="flex items-start gap-2 mb-3 bg-violet-500/5 border border-violet-500/10 rounded-xl px-4 py-3">
          <Zap className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-400 leading-relaxed">{winner.aiScore.reasoning}</p>
        </div>
      )}

      {recommendation.summary && (
        <p className="text-sm text-slate-300 leading-relaxed mb-2">{recommendation.summary}</p>
      )}
      {recommendation.tradeoffs && (
        <p className="text-xs text-slate-300 italic mb-5">{recommendation.tradeoffs}</p>
      )}

      {/* Award button */}
      <div className="pt-4 border-t border-slate-800/60">
        {awarded ? (
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
            <CheckCircle className="w-4 h-4" />
            RFP awarded to {recommendation.vendorName} — redirecting…
          </div>
        ) : confirm ? (
          <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3">
            <p className="text-sm text-slate-300">Award RFP to <strong className="text-white">{recommendation.vendorName}</strong>?</p>
            <button
              onClick={handleAward}
              disabled={awarding}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:from-emerald-500 hover:to-emerald-400 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/25"
            >
              {awarding && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {awarding ? 'Awarding…' : 'Confirm'}
            </button>
            <button onClick={() => setConfirm(false)} className="text-sm text-slate-300 hover:text-slate-300 transition-colors">
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirm(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:from-amber-400 hover:to-orange-400 transition-all duration-200 shadow-lg shadow-amber-500/25 hover:-translate-y-0.5"
          >
            <Trophy className="w-4 h-4" />
            Award to {recommendation.vendorName}
          </button>
        )}
      </div>
    </div>
  );
}
