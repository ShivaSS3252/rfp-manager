const statusStyles = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  receiving: 'bg-yellow-100 text-yellow-700',
  closed: 'bg-green-100 text-green-700',
  pending: 'bg-gray-100 text-gray-600',
  parsed: 'bg-blue-100 text-blue-700',
  reviewed: 'bg-green-100 text-green-700',
};

export default function StatusBadge({ status }) {
  const cls = statusStyles[status] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>
      {status}
    </span>
  );
}
