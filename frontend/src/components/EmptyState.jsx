import { PackageOpen } from 'lucide-react';

export default function EmptyState({ icon: Icon = PackageOpen, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="relative mb-5">
        <div className="w-16 h-16 bg-slate-800/80 border border-slate-700/60 rounded-2xl flex items-center justify-center">
          <Icon className="w-7 h-7 text-slate-300" />
        </div>
        <div className="absolute -inset-2 bg-gradient-to-br from-violet-600/10 to-cyan-500/10 rounded-3xl blur-lg -z-10" />
      </div>
      <h3 className="text-base font-semibold text-slate-200 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-300 mb-5 max-w-xs">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
