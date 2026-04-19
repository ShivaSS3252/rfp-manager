import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, User, Tag, Trash2, Edit } from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import VendorForm from '../components/VendorForm';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function VendorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState(false);

  function fetchVendor() {
    axios.get(`${API}/api/vendors/${id}`)
      .then(res => setVendor(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchVendor(); }, [id]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await axios.delete(`${API}/api/vendors/${id}`);
      navigate('/vendors');
    } catch {
      setDeleting(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (!vendor) return <div className="p-8 text-red-600">Vendor not found</div>;

  if (editing) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Link to="/vendors" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Vendors
        </Link>
        <VendorForm
          vendor={vendor}
          onSaved={() => { setEditing(false); fetchVendor(); }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link to="/vendors" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Vendors
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{vendor.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Vendor Profile</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50"
          >
            <Edit className="w-3.5 h-3.5" /> Edit
          </button>
          {confirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600">Are you sure?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs text-white bg-red-600 px-2 py-1 rounded hover:bg-red-700"
              >
                {deleting ? '...' : 'Delete'}
              </button>
              <button onClick={() => setConfirm(false)} className="text-xs text-gray-500 px-2 py-1 border rounded">
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirm(true)}
              className="inline-flex items-center gap-1.5 text-sm text-red-600 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="grid grid-cols-2 gap-5">
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm text-gray-900">{vendor.email}</p>
            </div>
          </div>
          {vendor.contactPerson && (
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Contact Person</p>
                <p className="text-sm text-gray-900">{vendor.contactPerson}</p>
              </div>
            </div>
          )}
          {vendor.phone && (
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm text-gray-900">{vendor.phone}</p>
              </div>
            </div>
          )}
          {vendor.category?.length > 0 && (
            <div className="flex items-start gap-3">
              <Tag className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Categories</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {vendor.category.map(cat => (
                    <span key={cat} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{cat}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-5 pt-4 border-t border-gray-50">
          Added {new Date(vendor.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
