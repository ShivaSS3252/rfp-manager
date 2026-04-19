import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    { label: 'Price Score',      value: winner?.aiScore?.priceScore,        color: 'bg-blue-500'   },
    { label: 'Delivery Score',   value: winner?.aiScore?.deliveryScore,      color: 'bg-green-500'  },
    { label: 'Completeness',     value: winner?.aiScore?.completenessScore,  color: 'bg-purple-500' },
  ];

  return (
    <div className="rounded-xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-green-50 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">🏆</span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-yellow-700">AI Recommendation</p>
          <h2 className="text-xl font-bold text-gray-900">We Recommend: {recommendation.vendorName}</h2>
        </div>
        {winner?.aiScore?.overall != null && (
          <div className="ml-auto text-center">
            <p className="text-4xl font-bold text-blue-600">{winner.aiScore.overall}</p>
            <p className="text-xs text-gray-500">/ 100</p>
          </div>
        )}
      </div>

      {/* Score bars */}
      {winner?.aiScore && (
        <div className="grid grid-cols-3 gap-4 mb-5">
          {scores.map(({ label, value, color }) => (
            <div key={label}>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>{label}</span>
                <span className="font-semibold">{value ?? '—'}{value != null ? '/100' : ''}</span>
              </div>
              <div className="h-2.5 bg-white rounded-full overflow-hidden border border-gray-200">
                <div
                  className={`h-full ${color} rounded-full transition-all duration-500`}
                  style={{ width: `${value ?? 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {recommendation.summary && (
        <p className="text-sm text-gray-700 leading-relaxed mb-2">{recommendation.summary}</p>
      )}

      {/* Tradeoffs */}
      {recommendation.tradeoffs && (
        <p className="text-xs text-gray-500 italic mb-5">{recommendation.tradeoffs}</p>
      )}

      {/* Award button */}
      <div className="pt-2 border-t border-yellow-200">
        {awarded ? (
          <div className="flex items-center gap-2 text-green-700 text-sm font-semibold">
            ✅ RFP awarded to {recommendation.vendorName} — redirecting…
          </div>
        ) : confirm ? (
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-700">Award RFP to <strong>{recommendation.vendorName}</strong>?</p>
            <button
              onClick={handleAward}
              disabled={awarding}
              className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {awarding && (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {awarding ? 'Awarding…' : 'Confirm'}
            </button>
            <button
              onClick={() => setConfirm(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Award to {recommendation.vendorName}
          </button>
        )}
      </div>
    </div>
  );
}
