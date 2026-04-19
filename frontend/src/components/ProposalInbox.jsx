import { useState } from 'react';
import { ChevronDown, ChevronUp, Inbox, Play } from 'lucide-react';
import axios from 'axios';
import StatusBadge from './StatusBadge';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ProposalInbox({ rfpId, proposals, sentVendors = [], onRefresh }) {
  const [expanded, setExpanded] = useState(null);
  const [simulating, setSimulating] = useState(null);

  const proposalVendorIds = new Set(proposals.map(p =>
    typeof p.vendorId === 'object' ? p.vendorId._id : p.vendorId
  ));

  const vendorsWithoutProposal = sentVendors.filter(v => {
    const vid = typeof v === 'object' ? v._id : v;
    return !proposalVendorIds.has(vid);
  });

  async function handleSimulate(vendor) {
    const vid = typeof vendor === 'object' ? vendor._id : vendor;
    setSimulating(vid);
    try {
      await axios.post(`${API}/api/proposals/simulate-reply`, { rfpId, vendorId: vid });
      const updated = await axios.get(`${API}/api/proposals?rfpId=${rfpId}`);
      onRefresh(updated.data.data);
    } catch (err) {
      console.error('Simulate failed:', err.message);
    } finally {
      setSimulating(null);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">
          Vendor Proposals ({proposals.length})
        </h2>
      </div>

      {/* Simulate buttons for vendors who haven't replied */}
      {vendorsWithoutProposal.length > 0 && (
        <div className="px-5 py-3 border-b border-gray-100 bg-amber-50">
          <p className="text-xs font-medium text-amber-700 mb-2">
            Awaiting replies from {vendorsWithoutProposal.length} vendor{vendorsWithoutProposal.length !== 1 ? 's' : ''}
          </p>
          <div className="flex flex-wrap gap-2">
            {vendorsWithoutProposal.map(vendor => {
              const vid = typeof vendor === 'object' ? vendor._id : vendor;
              const vname = typeof vendor === 'object' ? vendor.name : vid;
              const isSimulating = simulating === vid;
              return (
                <button
                  key={vid}
                  onClick={() => handleSimulate(vendor)}
                  disabled={!!simulating}
                  className="inline-flex items-center gap-1.5 text-xs bg-white border border-amber-200 text-amber-700 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg font-medium disabled:opacity-50 transition-colors"
                >
                  {isSimulating
                    ? <span className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    : <Play className="w-3 h-3" />
                  }
                  {isSimulating ? 'Simulating…' : `Simulate reply from ${vname}`}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {proposals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Inbox className="w-8 h-8 text-gray-200 mb-2" />
          <p className="text-sm text-gray-400">No proposals received yet</p>
          {sentVendors.length === 0 && (
            <p className="text-xs text-gray-400 mt-1">Send the RFP to vendors first</p>
          )}
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {proposals.map(p => {
            const vendorName = p.vendorId?.name || 'Unknown Vendor';
            const isOpen = expanded === p._id;
            return (
              <div key={p._id}>
                <button
                  className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                  onClick={() => setExpanded(isOpen ? null : p._id)}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-sm font-medium text-gray-900 truncate">{vendorName}</span>
                    {p.parsedData?.totalPrice != null && (
                      <span className="text-sm text-gray-700 shrink-0">
                        ${p.parsedData.totalPrice.toLocaleString()}
                      </span>
                    )}
                    {p.parsedData?.deliveryDays != null && (
                      <span className="text-xs text-gray-500 shrink-0">
                        {p.parsedData.deliveryDays} days
                      </span>
                    )}
                    <StatusBadge status={p.status} />
                  </div>
                  {isOpen
                    ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  }
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 bg-gray-50 border-t border-gray-100">
                    {p.parsedData ? (
                      <>
                        <div className="grid grid-cols-2 gap-3 pt-3 text-sm">
                          <div>
                            <span className="text-xs text-gray-500">Total Price</span>
                            <p className="font-medium">
                              {p.parsedData.totalPrice != null
                                ? `$${p.parsedData.totalPrice.toLocaleString()}`
                                : '—'}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Delivery</span>
                            <p className="font-medium">
                              {p.parsedData.deliveryDays != null
                                ? `${p.parsedData.deliveryDays} days`
                                : '—'}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Payment Terms</span>
                            <p className="font-medium">{p.parsedData.paymentTerms || '—'}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Warranty</span>
                            <p className="font-medium">{p.parsedData.warranty || '—'}</p>
                          </div>
                        </div>

                        {p.parsedData.unitPrices?.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-500 mb-1">Unit Prices</p>
                            {p.parsedData.unitPrices.map((up, i) => (
                              <p key={i} className="text-xs text-gray-700">
                                • {up.item}: ${up.price?.toLocaleString()}
                              </p>
                            ))}
                          </div>
                        )}

                        {p.parsedData.additionalTerms && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500">Additional Terms</p>
                            <p className="text-xs text-gray-700">{p.parsedData.additionalTerms}</p>
                          </div>
                        )}

                        {p.aiScore?.overall != null && (
                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-xs text-gray-500">AI Score:</span>
                            <span className="text-sm font-semibold text-blue-600">{p.aiScore.overall}/100</span>
                            {p.aiScore.reasoning && (
                              <span className="text-xs text-gray-400">— {p.aiScore.reasoning}</span>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="pt-3 text-xs text-gray-400">Parsing in progress…</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
