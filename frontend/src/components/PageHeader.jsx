export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-7 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-300 mt-1">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
