import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ComparisonTable from '../components/ComparisonTable';
import RecommendationCard from '../components/RecommendationCard';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ComparisonView() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${API}/api/rfps/${id}/compare`)
      .then(res => {
        console.log('[ComparisonView] Full API response:', res.data);
        console.log('[ComparisonView] recommendation:', res.data.data?.recommendation);
        setData(res.data.data);
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load comparison'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Link to={`/rfps/${id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-slate-200 mb-6 transition-colors group">
        <ArrowLeft className="w-4 h-4" />
        Back to RFP
      </Link>

      <div className="mb-6 animate-fade-in-up">
        <h1 className="text-2xl font-bold text-white tracking-tight">Compare Proposals</h1>
        {data?.rfp && <p className="text-sm text-slate-300 mt-1">{data.rfp.title}</p>}
      </div>

      {loading && (
        <div className="bg-slate-900/80 border border-slate-800/60 rounded-2xl p-16 flex flex-col items-center">
          <LoadingSpinner size="lg" label="AI is scoring proposals…" />
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl p-5 text-sm">{error}</div>
      )}

      {data && !loading && (
        <div className="space-y-6">
          <ComparisonTable proposals={data.proposals} />
          {data.recommendation && (
            <RecommendationCard
              recommendation={data.recommendation}
              proposals={data.proposals}
              rfpId={id}
              rfpClosed={data.rfp?.status === 'closed'}
            />
          )}
        </div>
      )}
    </div>
  );
}
