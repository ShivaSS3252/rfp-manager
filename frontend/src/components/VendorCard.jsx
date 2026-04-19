import { Link } from 'react-router-dom';
import { Building2, Mail, User } from 'lucide-react';

export default function VendorCard({ vendor }) {
  return (
    <Link
      to={`/vendors/${vendor._id}`}
      className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{vendor.name}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Mail className="w-3 h-3" />{vendor.email}
            </span>
            {vendor.contactPerson && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <User className="w-3 h-3" />{vendor.contactPerson}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-1.5 flex-wrap max-w-[200px] justify-end">
        {(vendor.category || []).map(cat => (
          <span key={cat} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{cat}</span>
        ))}
      </div>
    </Link>
  );
}
