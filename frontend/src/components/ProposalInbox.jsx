import { useState } from 'react';
import { ChevronDown, ChevronUp, Inbox, Play, Zap } from 'lucide-react';
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
    <div className="bg-slate-900/80 border border-slate-800/60 rounded-2xl overflow-hidden animate-fade-in-up">
      <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">
          Vendor Proposals
          <span className="ml-2 bg-violet-500/20 text-violet-400 border border-violet-500/30 text-xs px-2 py-0.5 rounded-full">
            {proposals.length}
          </span>
        </h2>
      </div>

      {/* Simulate buttons */}
      {vendorsWithoutProposal.length > 0 && (
        <div className="px-5 py-4 border-b border-slate-800/60 bg-amber-500/5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <p className="text-xs font-semibold text-amber-400">
              {vendorsWithoutProposal.length} vendor{vendorsWithoutProposal.length !== 1 ? 's' : ''} awaiting reply
            </p>
          </div>
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
                  className="inline-flex items-center gap-1.5 text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/40 px-3 py-1.5 rounded-lg font-semibold disabled:opacity-50 transition-all duration-200 hover:-translate-y-0.5"
                >
                  {isSimulating
                    ? <span className="w-3 h-3 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin" />
                    : <Play className="w-3 h-3" />
                  }
                  {isSimulating ? 'Simulating…' : `Simulate: ${vname}`}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {proposals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14">
          <div className="w-12 h-12 bg-slate-800/60 border border-slate-700/40 rounded-2xl flex items-center justify-center mb-3">
            <Inbox className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-sm text-slate-300 font-medium">No proposals received yet</p>
          {sentVendors.length === 0 && (
            <p className="text-xs text-slate-400 mt-1">Send the RFP to vendors first</p>
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-800/40">
          {proposals.map(p => {
            const vendorName = p.vendorId?.name || 'Unknown Vendor';
            const isOpen = expanded === p._id;
            return (
              <div key={p._id} className="animate-fade-in">
                <button
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-all duration-200 text-left group"
                  onClick={() => setExpanded(isOpen ? null : p._id)}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-600/20 to-cyan-500/20 border border-violet-500/20 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-violet-400">{vendorName[0]}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-200 group-hover:text-white truncate transition-colors">{vendorName}</span>
                    {p.parsedData?.totalPrice != null && (
                      <span className="text-sm font-bold text-emerald-400 shrink-0">
                        ${p.parsedData.totalPrice.toLocaleString()}
                      </span>
                    )}
                    {p.parsedData?.deliveryDays != null && (
                      <span className="text-xs text-slate-300 shrink-0 bg-slate-800 border border-slate-700/60 px-2 py-0.5 rounded-full">
                        {p.parsedData.deliveryDays}d delivery
                      </span>
                    )}
                    <StatusBadge status={p.status} />
                  </div>
                  <div className={`w-6 h-6 flex items-center justify-center rounded-lg transition-colors ${isOpen ? 'bg-violet-500/20 text-violet-400' : 'text-slate-400 group-hover:text-slate-400'}`}>
                    {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 bg-slate-800/20 border-t border-slate-800/40 animate-fade-in">
                    {p.parsedData ? (
                      <>
                        <div className="grid grid-cols-2 gap-4 pt-4 text-sm">
                          {[
                            { label: 'Total Price',    val: p.parsedData.totalPrice != null ? `$${p.parsedData.totalPrice.toLocaleString()}` : '—' },
                            { label: 'Delivery',       val: p.parsedData.deliveryDays != null ? `${p.parsedData.deliveryDays} days` : '—' },
                            { label: 'Payment Terms',  val: p.parsedData.paymentTerms || '—' },
                            { label: 'Warranty',       val: p.parsedData.warranty || '—' },
                          ].map(({ label, val }) => (
                            <div key={label} className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3">
                              <p className="text-xs text-slate-300 mb-1">{label}</p>
                              <p className="font-semibold text-slate-200">{val}</p>
                            </div>
                          ))}
                        </div>

                        {p.parsedData.unitPrices?.length > 0 && (
                          <div className="mt-3 bg-slate-800/40 border border-slate-700/40 rounded-xl p-3">
                            <p className="text-xs text-slate-300 mb-2">Unit Prices</p>
                            {p.parsedData.unitPrices.map((up, i) => (
                              <p key={i} className="text-xs text-slate-400">• {up.item}: <span className="text-emerald-400 font-semibold">${up.price?.toLocaleString()}</span></p>
                            ))}
                          </div>
                        )}

                        {p.parsedData.additionalTerms && (
                          <div className="mt-3 bg-slate-800/40 border border-slate-700/40 rounded-xl p-3">
                            <p className="text-xs text-slate-300 mb-1">Additional Terms</p>
                            <p className="text-xs text-slate-400">{p.parsedData.additionalTerms}</p>
                          </div>
                        )}

                        {p.aiScore?.overall != null && (
                          <div className="mt-3 flex items-center gap-3 bg-violet-500/5 border border-violet-500/20 rounded-xl px-3 py-2">
                            <span className="text-xs text-slate-300">AI Score</span>
                            <span className="text-lg font-black text-violet-400">{p.aiScore.overall}<span className="text-xs text-slate-400">/100</span></span>
                            {p.aiScore.reasoning && (
                              <span className="text-xs text-slate-300 italic">— {p.aiScore.reasoning}</span>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="pt-4 text-xs text-slate-300">Parsing in progress…</p>
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
