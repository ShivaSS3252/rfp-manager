const statusStyles = {
  draft:    'bg-slate-700/60 text-slate-300 border-slate-600/50',
  sent:     'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  receiving:'bg-amber-500/15 text-amber-400 border-amber-500/30',
  closed:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  pending:  'bg-slate-700/60 text-slate-400 border-slate-600/50',
  parsed:   'bg-violet-500/15 text-violet-400 border-violet-500/30',
  reviewed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

const dots = {
  sent:     'bg-cyan-400',
  receiving:'bg-amber-400',
  closed:   'bg-emerald-400',
  parsed:   'bg-violet-400',
  reviewed: 'bg-emerald-400',
};

export default function StatusBadge({ status }) {
  const cls = statusStyles[status] || 'bg-slate-700/60 text-slate-400 border-slate-600/50';
  const dot = dots[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${cls}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse`} />}
      {status}
    </span>
  );
}
