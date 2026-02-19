import { useState } from 'react';
import { apiUrl } from '../../utils/api';

// Vendor enquiries list
function EnquiriesTab({ enquiries, componentCatalog = [], onCreateQuotation, getAuthHeaders, onRejectEnquiry }) {
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [enquirySearch, setEnquirySearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [seenEnquiryIds, setSeenEnquiryIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('vendorEnquirySeen') || '[]');
    } catch {
      return [];
    }
  });
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);
  const seenSet = new Set(seenEnquiryIds);
  const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');
  const resolveComponentId = (item) => item.component_id || item.componentId || item.componentid;
  const resolveComponentName = (item, component) => (
    item.component_name
    || item.name
    || component?.component_name
    || component?.name
    || 'Component'
  );
  const resolveGst = (item, component, key) => (
    item[`${key}_percent`]
    ?? item[key]
    ?? item[`${key}Percent`]
    ?? component?.[key]
    ?? 0
  );
  const componentLookup = componentCatalog.reduce((acc, component) => {
    const componentId = component.componentid || component.component_id || component.id;
    if (!componentId || acc[componentId]) return acc;
    acc[componentId] = component;
    return acc;
  }, {});
  const getStatusLabel = (status) => {
    if (status === 'raised') return 'Raised';
    if (status === 'quoted') return 'Quoted';
    if (status === 'accepted') return 'Accepted';
    if (status === 'rejected') return 'Rejected';
    return status || 'New';
  };
  const getStatusColor = (status) => {
    if (status === 'raised') return 'bg-blue-100 text-blue-700';
    if (status === 'quoted') return 'bg-green-100 text-green-700';
    if (status === 'accepted') return 'bg-emerald-100 text-emerald-700';
    if (status === 'rejected') return 'bg-rose-100 text-rose-700';
    return 'bg-slate-100 text-slate-700';
  };
  const filteredEnquiries = enquiries.filter((enquiry) => {
    const title = (enquiry.title || '').toLowerCase();
    const description = (enquiry.description || '').toLowerCase();
    const matchesSearch =
      title.includes(enquirySearch.toLowerCase()) ||
      description.includes(enquirySearch.toLowerCase());
    const matchesStatus = statusFilter === 'all' || enquiry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const unreadCount = filteredEnquiries.filter((enquiry) => !seenSet.has(enquiry.enquiry_id)).length;
  const markEnquirySeen = (enquiryId) => {
    if (!enquiryId || seenSet.has(enquiryId)) return;
    const next = [...seenEnquiryIds, enquiryId];
    setSeenEnquiryIds(next);
    localStorage.setItem('vendorEnquirySeen', JSON.stringify(next));
  };
  const handleRejectEnquiry = async () => {
    if (!selectedEnquiry || !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    setRejectLoading(true);
    try {
      const response = await fetch(
        apiUrl(`/api/purchase/enquiry/${selectedEnquiry.enquiry_id}/reject`),
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(getAuthHeaders ? getAuthHeaders() : {}),
          },
          body: JSON.stringify({ rejectionReason: rejectionReason.trim() }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to reject enquiry');
      
      // Call parent callback if provided
      if (onRejectEnquiry) {
        onRejectEnquiry(data.enquiry);
      }
      
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedEnquiry(null);
      alert('Enquiry rejected successfully');
    } catch (err) {
      alert(err.message || 'Error rejecting enquiry');
    } finally {
      setRejectLoading(false);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-slate-900">Purchase Enquiries</h2>
        <p className="text-sm text-slate-500">
          Review enquiries sent by the purchase manager.
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
              {unreadCount} unread
            </span>
          )}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search enquiries by title or description..."
              value={enquirySearch}
              onChange={(e) => setEnquirySearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          >
            <option value="all">All Enquiries</option>
            <option value="raised">Raised</option>
            <option value="quoted">Quoted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Your Enquiries</h3>
          <span className="text-xs font-semibold text-slate-500 uppercase">Total: {filteredEnquiries.length}</span>
        </div>
        {filteredEnquiries.length === 0 ? (
          <p className="text-sm text-slate-500">No enquiries yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {filteredEnquiries.map((enquiry) => (
              <button
                type="button"
                key={enquiry.enquiry_id}
                onClick={() => {
                  markEnquirySeen(enquiry.enquiry_id);
                  setSelectedEnquiry(enquiry);
                }}
                className="w-full text-left rounded-xl border border-slate-200 px-4 py-3 hover:border-slate-400 hover:shadow-md hover:bg-slate-50 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {enquiry.title || 'Untitled Enquiry'}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {enquiry.description || 'No description'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!seenSet.has(enquiry.enquiry_id) && (
                      <span className="px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-amber-100 text-amber-700">
                        Unread
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${getStatusColor(enquiry.status)}`}>
                      {getStatusLabel(enquiry.status)}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Required: {formatDate(enquiry.required_delivery_date)}</span>
                  <span>Created: {formatDate(enquiry.created_at)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <h2 className="text-xl font-semibold text-slate-900">Enquiry Details</h2>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900">
                      {selectedEnquiry.title || 'Untitled Enquiry'}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">ID: {selectedEnquiry.enquiry_id || selectedEnquiry.id}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${getStatusColor(selectedEnquiry.status)}`}>
                    {getStatusLabel(selectedEnquiry.status)}
                  </span>
                </div>

                {selectedEnquiry.description && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                    <p className="text-sm text-slate-600 p-3 bg-slate-50 rounded-lg">
                      {selectedEnquiry.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Required Delivery Date</label>
                    <p className="text-sm text-slate-900">{formatDate(selectedEnquiry.required_delivery_date)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Source</label>
                    <p className="text-sm text-slate-900 capitalize">{selectedEnquiry.source || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Created Date</label>
                    <p className="text-sm text-slate-900">{formatDate(selectedEnquiry.created_at)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Line Items</h4>
                  {selectedEnquiry.items?.length ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full min-w-[1000px] text-sm">
                        <thead className="text-xs uppercase text-slate-500">
                          <tr className="border-b border-slate-200">
                            <th className="py-2 text-left font-semibold">Component</th>
                            <th className="py-2 text-right font-semibold">Qty</th>
                            <th className="py-2 text-right font-semibold">Unit</th>
                            <th className="py-2 text-right font-semibold">Base Price</th>
                            <th className="py-2 text-right font-semibold">CGST %</th>
                            <th className="py-2 text-right font-semibold">SGST %</th>
                            <th className="py-2 text-right font-semibold">Final Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedEnquiry.items.map((item) => {
                            const component = componentLookup[resolveComponentId(item)] || {};
                            const cgst = resolveGst(item, component, 'cgst');
                            const sgst = resolveGst(item, component, 'sgst');
                            const basePrice = Number(component.price_per_unit) || 0;
                            const cgstAmount = (basePrice * cgst) / 100;
                            const sgstAmount = (basePrice * sgst) / 100;
                            const finalPrice = basePrice + cgstAmount + sgstAmount;
                            return (
                              <tr key={item.item_id || item.component_id} className="border-b border-slate-100">
                                <td className="py-2 text-slate-700">{resolveComponentName(item, component)}</td>
                                <td className="py-2 text-right text-slate-700">{item.quantity}</td>
                                <td className="py-2 text-right text-slate-700">
                                  {item.unit || component.unit_of_measurement || component.measurement_unit || component.unit || '—'}
                                </td>
                                <td className="py-2 text-right text-slate-700">₹{basePrice.toFixed(2)}</td>
                                <td className="py-2 text-right text-slate-700">{cgst}%</td>
                                <td className="py-2 text-right text-slate-700">{sgst}%</td>
                                <td className="py-2 text-right font-semibold text-emerald-700">₹{finalPrice.toFixed(2)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No line items.</p>
                  )}
                </div>
              </div>
              
              {selectedEnquiry.status === 'rejected' && selectedEnquiry.rejection_reason && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-rose-900 mb-2">Rejection Reason:</p>
                  <p className="text-sm text-rose-800">{selectedEnquiry.rejection_reason}</p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4 flex-wrap">
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Close
              </button>
              {selectedEnquiry.status !== 'rejected' && (
                <button
                  onClick={() => {
                    setShowRejectModal(true);
                  }}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition"
                >
                  Reject
                </button>
              )}
              {selectedEnquiry.status !== 'rejected' && (
                <button
                  onClick={() => {
                    if (onCreateQuotation) onCreateQuotation(selectedEnquiry);
                    setSelectedEnquiry(null);
                  }}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition"
                >
                  Create Quotation
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showRejectModal && selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-lg p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Reject Enquiry</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Reason for Rejection
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please explain why you cannot fulfill this enquiry (e.g., components not available, specifications not supported, etc.)"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                rows="4"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectEnquiry}
                disabled={!rejectionReason.trim() || rejectLoading}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {rejectLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnquiriesTab;
