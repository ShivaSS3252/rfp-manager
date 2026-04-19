import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
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
    if (!rawInput.trim()) {
      setError('Please describe what you want to procure.');
      return;
    }
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
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What do you want to procure?
        </label>
        <textarea
          rows={6}
          value={rawInput}
          onChange={e => setRawInput(e.target.value)}
          placeholder="e.g. We need 20 laptops with 16GB RAM, 512GB SSD, for a software development team. Budget around $30,000. Delivery within 4 weeks..."
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {loading ? 'Generating...' : 'Generate RFP'}
          </button>
        </div>
      </div>

      {parsed && (
        <div className="mt-6">
          <RFPPreviewCard data={parsed} onSave={handleSave} />
        </div>
      )}
    </div>
  );
}
