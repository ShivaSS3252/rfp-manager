export default function LoadingSpinner({ size = 'md', label }) {
  const outer = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16' }[size];
  const inner = { sm: 'w-3 h-3',  md: 'w-5 h-5',  lg: 'w-8 h-8'  }[size];

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <div className={`relative ${outer}`}>
        <div className={`absolute inset-0 rounded-full border-2 border-violet-500/20`} />
        <div className={`absolute inset-0 rounded-full border-2 border-transparent border-t-violet-500 border-r-cyan-400 animate-spin`} />
        <div className={`absolute inset-1 rounded-full border border-transparent border-t-violet-400/40 animate-spin-slow`} />
        <div className={`absolute inset-0 flex items-center justify-center`}>
          <div className={`${inner} rounded-full bg-gradient-to-br from-violet-600/20 to-cyan-500/20 animate-pulse`} />
        </div>
      </div>
      {label && <p className="text-sm text-slate-300 animate-pulse">{label}</p>}
    </div>
  );
}
