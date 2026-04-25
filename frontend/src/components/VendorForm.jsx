import { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function VendorForm({ vendor, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: vendor?.name || '',
    email: vendor?.email || '',
    contactPerson: vendor?.contactPerson || '',
    phone: vendor?.phone || '',
    category: vendor?.category?.join(', ') || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        category: form.category
          ? form.category.split(',').map(s => s.trim()).filter(Boolean)
          : [],
      };
      if (vendor?._id) {
        await axios.patch(`${API}/api/vendors/${vendor._id}`, payload);
      } else {
        await axios.post(`${API}/api/vendors`, payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save vendor');
      setSaving(false);
    }
  }

  const inputCls = 'w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200';
  const labelCls = 'block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5';

  return (
    <div className="bg-slate-900/80 border border-slate-800/60 rounded-2xl p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-slate-200">
          {vendor ? 'Edit Vendor' : 'Add New Vendor'}
        </h3>
        {onCancel && (
          <button onClick={onCancel} className="text-slate-300 hover:text-slate-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Company Name *</label>
          <input required value={form.name} onChange={e => set('name', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Email *</label>
          <input required type="email" value={form.email} onChange={e => set('email', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Contact Person</label>
          <input value={form.contactPerson} onChange={e => set('contactPerson', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Phone</label>
          <input value={form.phone} onChange={e => set('phone', e.target.value)} className={inputCls} />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Categories <span className="font-normal text-slate-300 lowercase normal-case tracking-normal">(comma-separated)</span></label>
          <input value={form.category} onChange={e => set('category', e.target.value)} placeholder="e.g. electronics, laptops, networking" className={inputCls} />
        </div>

        {error && (
          <div className="col-span-2 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
            <p className="text-sm text-rose-400">{error}</p>
          </div>
        )}

        <div className="col-span-2 flex justify-end gap-2 pt-1">
          {onCancel && (
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-500 rounded-xl transition-all">
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-violet-500 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:from-violet-500 hover:to-violet-400 transition-all shadow-lg shadow-violet-500/25 disabled:opacity-50"
          >
            {saving && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {vendor ? 'Save Changes' : 'Add Vendor'}
          </button>
        </div>
      </form>
    </div>
  );
}
