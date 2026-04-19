import { useState } from 'react';
import { Save } from 'lucide-react';

export default function RFPPreviewCard({ data, onSave }) {
  const [form, setForm] = useState({
    title: data.title || '',
    requirements: {
      items: data.requirements?.items || [],
      budget: data.requirements?.budget ?? '',
      deadline: data.requirements?.deadline
        ? data.requirements.deadline.split('T')[0]
        : '',
      paymentTerms: data.requirements?.paymentTerms || '',
      warranty: data.requirements?.warranty || '',
      quantity: data.requirements?.quantity ?? '',
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
          budget: form.requirements.budget !== '' ? Number(form.requirements.budget) : null,
          quantity: form.requirements.quantity !== '' ? Number(form.requirements.quantity) : null,
          deadline: form.requirements.deadline || null,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save RFP. Please try again.');
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-6">
      <h3 className="text-sm font-semibold text-gray-800 mb-5">AI-Generated RFP — Review &amp; Edit</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Budget ($)</label>
            <input
              type="number"
              value={form.requirements.budget}
              onChange={e => set('requirements.budget', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Deadline</label>
            <input
              type="date"
              value={form.requirements.deadline}
              onChange={e => set('requirements.deadline', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Payment Terms</label>
            <input
              type="text"
              value={form.requirements.paymentTerms}
              onChange={e => set('requirements.paymentTerms', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Warranty</label>
            <input
              type="text"
              value={form.requirements.warranty}
              onChange={e => set('requirements.warranty', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Items Required</label>
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
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => set('requirements.items', form.requirements.items.filter((_, j) => j !== i))}
                  className="text-gray-400 hover:text-red-500 px-2 text-lg leading-none"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => set('requirements.items', [...form.requirements.items, ''])}
              className="text-xs text-blue-600 hover:underline"
            >
              + Add item
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Additional Notes</label>
          <textarea
            rows={3}
            value={form.requirements.additionalNotes}
            onChange={e => set('requirements.additionalNotes', e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-5 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving…' : 'Save RFP'}
        </button>
      </div>
    </div>
  );
}
