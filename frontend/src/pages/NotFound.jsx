import { Link } from 'react-router-dom';
import { Home, Orbit } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <div className="relative mb-6 animate-float">
        <Orbit className="w-20 h-20 text-violet-500/30" />
        <p className="absolute inset-0 flex items-center justify-center text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-violet-400 to-cyan-400">
          404
        </p>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Lost in Space</h2>
      <p className="text-slate-400 mb-8 max-w-xs text-sm">The page you're looking for doesn't exist or was moved.</p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-violet-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-violet-500 hover:to-violet-400 transition-all duration-200 shadow-lg shadow-violet-500/25 hover:-translate-y-0.5"
      >
        <Home className="w-4 h-4" />
        Back to Dashboard
      </Link>
    </div>
  );
}
