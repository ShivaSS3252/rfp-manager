import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, User, Tag, Trash2, Edit, Building2 } from 'lucide-react';
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

  if (loading) return <LoadingSpinner size="lg" label="Loading vendor…" />;
  if (!vendor) return (
    <div className="p-8">
      <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl px-5 py-4 text-rose-400 text-sm">Vendor not found</div>
    </div>
  );

  if (editing) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Link to="/vendors" className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-slate-200 mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
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
      <Link to="/vendors" className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-slate-200 mb-6 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Vendors
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 animate-fade-in-up">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-600/20 to-cyan-500/20 border border-violet-500/20 rounded-2xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-violet-400" />
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-violet-600/10 to-cyan-500/10 rounded-2xl blur-lg -z-10" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{vendor.name}</h1>
            <p className="text-sm text-slate-300 mt-0.5">Vendor Profile</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 text-sm text-slate-300 border border-slate-700 hover:border-violet-500/50 hover:text-violet-300 rounded-xl px-3 py-2 transition-all duration-200"
          >
            <Edit className="w-3.5 h-3.5" /> Edit
          </button>

          {confirm ? (
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-1.5">
              <span className="text-xs text-rose-400">Are you sure?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs text-white bg-rose-600 hover:bg-rose-500 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting ? '…' : 'Delete'}
              </button>
              <button onClick={() => setConfirm(false)} className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 transition-colors">
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirm(true)}
              className="inline-flex items-center gap-1.5 text-sm text-rose-400 border border-rose-500/20 hover:border-rose-500/40 hover:bg-rose-500/10 rounded-xl px-3 py-2 transition-all duration-200"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          )}
        </div>
      </div>

      {/* Info card */}
      <div className="bg-slate-900/80 border border-slate-800/60 rounded-2xl p-6 animate-fade-in-up">
        <div className="grid grid-cols-2 gap-5">
          {[
            { icon: Mail,  label: 'Email',          val: vendor.email,         show: true            },
            { icon: User,  label: 'Contact Person',  val: vendor.contactPerson, show: !!vendor.contactPerson },
            { icon: Phone, label: 'Phone',           val: vendor.phone,         show: !!vendor.phone  },
          ].filter(f => f.show).map(({ icon: Icon, label, val }) => (
            <div key={label} className="flex items-center gap-3 bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
              <div className="w-8 h-8 bg-slate-700/60 rounded-lg flex items-center justify-center shrink-0">
                <Icon className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div>
                <p className="text-xs text-slate-300">{label}</p>
                <p className="text-sm font-semibold text-slate-200">{val}</p>
              </div>
            </div>
          ))}

          {vendor.category?.length > 0 && (
            <div className="flex items-start gap-3 bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
              <div className="w-8 h-8 bg-slate-700/60 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div>
                <p className="text-xs text-slate-300 mb-2">Categories</p>
                <div className="flex flex-wrap gap-1.5">
                  {vendor.category.map(cat => (
                    <span key={cat} className="bg-violet-500/10 border border-violet-500/20 text-violet-400 px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-400 mt-5 pt-4 border-t border-slate-800/60">
          Added {new Date(vendor.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
