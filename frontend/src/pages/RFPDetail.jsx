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

  if (loading) return <LoadingSpinner size="lg" />;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!rfp) return null;

  const parsedProposals = proposals.filter(p => p.status === 'parsed' || p.status === 'reviewed');
  const sentVendors = rfp.vendorIds || [];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link to="/rfps" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to RFPs
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{rfp.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <StatusBadge status={rfp.status} />
            <span className="text-sm text-gray-500">Created {new Date(rfp.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex gap-2 mt-1">
          {rfp.status === 'draft' && (
            <button
              onClick={() => setShowSendPanel(v => !v)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Send className="w-4 h-4" />
              Send to Vendors
            </button>
          )}
          {parsedProposals.length >= 2 && (
            <Link
              to={`/rfps/${id}/compare`}
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              Compare Proposals
            </Link>
          )}
        </div>
      </div>

      {/* Requirements */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Requirements</h2>
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg"><DollarSign className="w-4 h-4 text-blue-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Budget</p>
              <p className="text-sm font-medium text-gray-900">
                {rfp.requirements?.budget ? `$${rfp.requirements.budget.toLocaleString()}` : '—'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-green-50 p-2 rounded-lg"><Calendar className="w-4 h-4 text-green-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Deadline</p>
              <p className="text-sm font-medium text-gray-900">
                {rfp.requirements?.deadline ? new Date(rfp.requirements.deadline).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-purple-50 p-2 rounded-lg"><Package className="w-4 h-4 text-purple-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Payment Terms</p>
              <p className="text-sm font-medium text-gray-900">{rfp.requirements?.paymentTerms || '—'}</p>
            </div>
          </div>
        </div>

        {rfp.requirements?.items?.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-500 mb-2">Items Required</p>
            <ul className="space-y-1">
              {rfp.requirements.items.map((item, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>{item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {rfp.requirements?.warranty && (
          <p className="text-sm text-gray-600 mt-2">
            <span className="font-medium">Warranty:</span> {rfp.requirements.warranty}
          </p>
        )}
        {rfp.requirements?.additionalNotes && (
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-medium">Notes:</span> {rfp.requirements.additionalNotes}
          </p>
        )}
      </div>

      {/* Send Panel */}
      {showSendPanel && rfp.status === 'draft' && (
        <div className="mb-6">
          <SendRFPPanel
            rfp={rfp}
            onSuccess={() => {
              setShowSendPanel(false);
              fetchAll();
            }}
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
