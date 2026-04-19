function rankByMetric(proposals, getter, lowerIsBetter) {
  const vals = proposals.map(p => getter(p));
  const defined = vals.filter(v => v != null);
  if (defined.length === 0) return vals.map(() => -1);
  const sorted = [...defined].sort((a, b) => lowerIsBetter ? a - b : b - a);
  return vals.map(v => (v == null ? -1 : sorted.indexOf(v)));
}

function cellColor(rank, total) {
  if (rank === -1 || total <= 1) return '';
  if (rank === 0) return 'bg-green-50 text-green-800 font-semibold';
  if (rank === total - 1) return 'bg-red-50 text-red-700';
  return 'bg-yellow-50 text-yellow-800';
}

export default function ComparisonTable({ proposals }) {
  if (!proposals?.length) return null;
  const n = proposals.length;

  const priceRanks = rankByMetric(proposals, p => p.parsedData?.totalPrice, true);
  const deliveryRanks = rankByMetric(proposals, p => p.parsedData?.deliveryDays, true);
  const scoreRanks = rankByMetric(proposals, p => p.aiScore?.overall, false);

  const rows = [
    {
      label: 'Total Price',
      cells: proposals.map((p, i) => ({
        value: p.parsedData?.totalPrice != null ? `$${p.parsedData.totalPrice.toLocaleString()}` : '—',
        cls: cellColor(priceRanks[i], n),
      })),
    },
    {
      label: 'Delivery Days',
      cells: proposals.map((p, i) => ({
        value: p.parsedData?.deliveryDays != null ? `${p.parsedData.deliveryDays} days` : '—',
        cls: cellColor(deliveryRanks[i], n),
      })),
    },
    {
      label: 'Payment Terms',
      cells: proposals.map(p => ({ value: p.parsedData?.paymentTerms || '—', cls: '' })),
    },
    {
      label: 'Warranty',
      cells: proposals.map(p => ({ value: p.parsedData?.warranty || '—', cls: '' })),
    },
    {
      label: 'AI Score',
      cells: proposals.map((p, i) => ({
        value: p.aiScore?.overall != null ? `${p.aiScore.overall}/100` : '—',
        cls: cellColor(scoreRanks[i], n),
      })),
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-36">
              Metric
            </th>
            {proposals.map(p => (
              <th key={p._id} className="text-center px-5 py-3 text-sm font-semibold text-gray-800">
                {p.vendorId?.name || 'Unknown'}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.label} className="border-b border-gray-50 last:border-0">
              <td className="px-5 py-3 text-xs font-medium text-gray-500">{row.label}</td>
              {row.cells.map((cell, i) => (
                <td key={i} className={`px-5 py-3 text-center text-sm ${cell.cls}`}>
                  {cell.value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
