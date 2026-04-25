import { useState } from 'react';
import { Save, Plus, X } from 'lucide-react';

export default function RFPPreviewCard({ data, onSave }) {
  const [form, setForm] = useState({
    title: data.title || '',
    requirements: {
      items:           data.requirements?.items        || [],
      budget:          data.requirements?.budget        ?? '',
      deadline:        data.requirements?.deadline ? data.requirements.deadline.split('T')[0] : '',
      paymentTerms:    data.requirements?.paymentTerms  || '',
      warranty:        data.requirements?.warranty      || '',
      quantity:        data.requirements?.quantity      ?? '',
      additionalNotes: data.requirements?.additionalNotes || '',
    },
    rawInput: data.rawInput || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(path, value) {
    setForm(prev => {
      const next = structuredClone(prev);
      const parts = path.split('.');
      let obj = next;
      for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
      obj[parts[parts.length - 1]] = value;
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      await onSave({
        ...form,
        requirements: {
          ...form.requirements,
          budget:   form.requirements.budget   !== '' ? Number(form.requirements.budget)   : null,
          quantity: form.requirements.quantity !== '' ? Number(form.requirements.quantity) : null,
          deadline: form.requirements.deadline || null,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save RFP. Please try again.');
      setSaving(false);
    }
  }

  const inputCls = 'w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200';
  const labelCls = 'block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide';

  return (
    <div className="bg-slate-900/80 border border-violet-500/20 rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 rounded-full blur-2xl pointer-events-none" />

      <div className="space-y-5">
        <div>
          <label className={labelCls}>Title</label>
          <input type="text" value={form.title} onChange={e => set('title', e.target.value)} className={inputCls} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Budget ($)</label>
            <input type="number" value={form.requirements.budget} onChange={e => set('requirements.budget', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Deadline</label>
            <input type="date" value={form.requirements.deadline} onChange={e => set('requirements.deadline', e.target.value)} className={`${inputCls} [color-scheme:dark]`} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Payment Terms</label>
            <input type="text" value={form.requirements.paymentTerms} onChange={e => set('requirements.paymentTerms', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Warranty</label>
            <input type="text" value={form.requirements.warranty} onChange={e => set('requirements.warranty', e.target.value)} className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Items Required</label>
          <div className="space-y-2">
            {form.requirements.items.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={e => {
                    const items = [...form.requirements.items];
                    items[i] = e.target.value;
                    set('requirements.items', items);
                  }}
                  className={inputCls}
                />
                <button
                  onClick={() => set('requirements.items', form.requirements.items.filter((_, j) => j !== i))}
                  className="text-slate-500 hover:text-rose-400 transition-colors px-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => set('requirements.items', [...form.requirements.items, ''])}
              className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add item
            </button>
          </div>
        </div>

        <div>
          <label className={labelCls}>Additional Notes</label>
          <textarea
            rows={3}
            value={form.requirements.additionalNotes}
            onChange={e => set('requirements.additionalNotes', e.target.value)}
            className={`${inputCls} resize-none`}
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2.5">
          <p className="text-sm text-rose-400">{error}</p>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:from-emerald-500 hover:to-emerald-400 transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
        >
          {saving
            ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            : <Save className="w-4 h-4" />
          }
          {saving ? 'Saving…' : 'Save RFP'}
        </button>
      </div>
    </div>
  );
}
