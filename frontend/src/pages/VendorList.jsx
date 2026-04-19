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
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
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

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : vendors.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No vendors yet"
            description="Add your first vendor to start sending RFPs and collecting proposals."
            action={
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Vendor
              </button>
            }
          />
        ) : (
          <div className="divide-y divide-gray-50">
            {vendors.map(v => <VendorCard key={v._id} vendor={v} />)}
          </div>
        )}
      </div>
    </div>
  );
}
