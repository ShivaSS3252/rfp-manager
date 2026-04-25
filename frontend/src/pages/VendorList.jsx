import { useState, useEffect } from 'react';
import { Plus, Users } from 'lucide-react';
import axios from 'axios';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import VendorCard from '../components/VendorCard';
import VendorForm from '../components/VendorForm';
import LoadingSpinner from '../components/LoadingSpinner';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function VendorList() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  function fetchVendors() {
    setLoading(true);
    axios.get(`${API}/api/vendors`)
      .then(res => setVendors(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchVendors(); }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <PageHeader
        title="Vendor Directory"
        subtitle="Manage your supplier contacts"
        action={
          <button
            onClick={() => setShowForm(v => !v)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-violet-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:from-violet-500 hover:to-violet-400 transition-all duration-200 shadow-lg shadow-violet-500/25 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            Add Vendor
          </button>
        }
      />

      {showForm && (
        <div className="mb-6">
          <VendorForm
            onSaved={() => { setShowForm(false); fetchVendors(); }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="bg-slate-900/80 border border-slate-800/60 rounded-2xl overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Loading vendors…" />
        ) : vendors.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No vendors yet"
            description="Add your first vendor to start sending RFPs and collecting proposals."
            action={
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-violet-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:from-violet-500 hover:to-violet-400 transition-all duration-200 shadow-lg shadow-violet-500/25 hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4" />
                Add Vendor
              </button>
            }
          />
        ) : (
          <div className="divide-y divide-slate-800/40">
            {vendors.map(v => <VendorCard key={v._id} vendor={v} />)}
          </div>
        )}
      </div>
    </div>
  );
}
