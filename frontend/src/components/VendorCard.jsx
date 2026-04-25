import { Link } from 'react-router-dom';
import { Building2, Mail, User, ChevronRight } from 'lucide-react';

export default function VendorCard({ vendor }) {
  return (
    <Link
      to={`/vendors/${vendor._id}`}
      className="group flex items-center justify-between px-5 py-4 hover:bg-slate-800/40 transition-all duration-200 border-b border-slate-800/60 last:border-0"
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600/20 to-cyan-500/20 border border-violet-500/20 rounded-xl flex items-center justify-center shrink-0 group-hover:border-violet-500/40 transition-colors">
            <Building2 className="w-4.5 h-4.5 text-violet-400" />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{vendor.name}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="flex items-center gap-1 text-xs text-slate-300">
              <Mail className="w-3 h-3" />{vendor.email}
            </span>
            {vendor.contactPerson && (
              <span className="flex items-center gap-1 text-xs text-slate-300">
                <User className="w-3 h-3" />{vendor.contactPerson}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex gap-1.5 flex-wrap max-w-[200px] justify-end">
          {(vendor.category || []).map(cat => (
            <span key={cat} className="bg-slate-800 border border-slate-700/60 text-slate-400 px-2 py-0.5 rounded-full text-xs group-hover:border-violet-500/30 group-hover:text-violet-400 transition-colors">
              {cat}
            </span>
          ))}
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-violet-400 transition-colors shrink-0" />
      </div>
    </Link>
  );
}
