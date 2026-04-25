function rankByMetric(proposals, getter, lowerIsBetter) {
  const vals = proposals.map(p => getter(p));
  const defined = vals.filter(v => v != null);
  if (defined.length === 0) return vals.map(() => -1);
  const sorted = [...defined].sort((a, b) => lowerIsBetter ? a - b : b - a);
  return vals.map(v => (v == null ? -1 : sorted.indexOf(v)));
}

function cellColor(rank, total) {
  if (rank === -1 || total <= 1) return { cls: 'text-slate-400', badge: '' };
  if (rank === 0)           return { cls: 'text-emerald-300 font-bold', badge: 'bg-emerald-500/15 border border-emerald-500/30 rounded-lg' };
  if (rank === total - 1)   return { cls: 'text-rose-400',    badge: 'bg-rose-500/10 border border-rose-500/20 rounded-lg' };
  return                           { cls: 'text-amber-400',   badge: 'bg-amber-500/10 border border-amber-500/20 rounded-lg' };
}

export default function ComparisonTable({ proposals }) {
  if (!proposals?.length) return null;
  const n = proposals.length;

  const priceRanks    = rankByMetric(proposals, p => p.parsedData?.totalPrice,   true);
  const deliveryRanks = rankByMetric(proposals, p => p.parsedData?.deliveryDays, true);
  const scoreRanks    = rankByMetric(proposals, p => p.aiScore?.overall,         false);

  const rows = [
    { label: 'Total Price',    cells: proposals.map((p, i) => ({ value: p.parsedData?.totalPrice != null ? `$${p.parsedData.totalPrice.toLocaleString()}` : '—', rank: priceRanks[i] })) },
    { label: 'Delivery Days',  cells: proposals.map((p, i) => ({ value: p.parsedData?.deliveryDays != null ? `${p.parsedData.deliveryDays} days` : '—', rank: deliveryRanks[i] })) },
    { label: 'Payment Terms',  cells: proposals.map(p => ({ value: p.parsedData?.paymentTerms || '—', rank: -1 })) },
    { label: 'Warranty',       cells: proposals.map(p => ({ value: p.parsedData?.warranty || '—', rank: -1 })) },
    { label: 'AI Score',       cells: proposals.map((p, i) => ({ value: p.aiScore?.overall != null ? `${p.aiScore.overall}/100` : '—', rank: scoreRanks[i] })) },
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800/60 rounded-2xl overflow-hidden animate-fade-in-up">
      <div className="px-5 py-4 border-b border-slate-800/60">
        <h2 className="text-sm font-semibold text-slate-200">Proposal Comparison</h2>
        <p className="text-xs text-slate-300 mt-0.5">
          <span className="text-emerald-400">Green</span> = best · <span className="text-amber-400">Amber</span> = middle · <span className="text-rose-400">Red</span> = worst
        </p>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-800/60">
            <th className="text-left px-5 py-3 text-xs font-semibold text-slate-300 uppercase tracking-widest w-36">Metric</th>
            {proposals.map(p => (
              <th key={p._id} className="text-center px-5 py-3">
                <p className="text-sm font-bold text-slate-200">{p.vendorId?.name || 'Unknown'}</p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.label} className="border-b border-slate-800/40 last:border-0 hover:bg-slate-800/20 transition-colors">
              <td className="px-5 py-3.5 text-xs font-semibold text-slate-300 uppercase tracking-wide">{row.label}</td>
              {row.cells.map((cell, i) => {
                const { cls, badge } = cellColor(cell.rank, n);
                return (
                  <td key={i} className="px-5 py-3.5 text-center">
                    <span className={`inline-block px-3 py-1 text-sm ${cls} ${badge}`}>
                      {cell.value}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
