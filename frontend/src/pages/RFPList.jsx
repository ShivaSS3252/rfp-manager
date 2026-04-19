import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
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
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New RFP
          </Link>
        }
      />
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : rfps.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No RFPs yet"
            description="Create your first RFP to start collecting vendor proposals."
            action={
              <Link
                to="/rfps/new"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create RFP
              </Link>
            }
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Budget</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Deadline</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</th>
              </tr>
            </thead>
            <tbody>
              {rfps.map(rfp => (
                <tr key={rfp._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <Link to={`/rfps/${rfp._id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600">
                      {rfp.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={rfp.status} /></td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    {rfp.requirements?.budget ? `$${rfp.requirements.budget.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    {rfp.requirements?.deadline ? new Date(rfp.requirements.deadline).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    {new Date(rfp.createdAt).toLocaleDateString()}
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
