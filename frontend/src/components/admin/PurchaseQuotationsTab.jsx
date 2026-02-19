import { useState } from 'react';

// Purchase quotations list and actions
function PurchaseQuotationsTab({ quotations, counters, lois = [], vendorLookup = {}, componentLookup = {}, onAcceptQuotation, onRequestNegotiation, onAcceptCounter, onRejectCounter, onGoToLois, focusEnquiryId, onClearFocus }) {
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [selectedCounter, setSelectedCounter] = useState(null);
  const [quotationSearch, setQuotationSearch] = useState('');
  const [quotationStatus, setQuotationStatus] = useState('all');
  const [counterSearch, setCounterSearch] = useState('');
  const [counterStatus, setCounterStatus] = useState('all');
  const getQuotationNumber = (quotation) => (
    quotation.quotation_number
    || quotation.quotationNumber
    || quotation.reference
    || `Quotation ${quotation.quotation_id || ''}`
  );
  const getCounterNumber = (counter) => (
    counter.counter_number
    || counter.counterNumber
    || counter.reference
    || `Counter ${counter.counter_id || ''}`
  );
  const getQuotationNextStep = (status) => {
    if (status === 'sent') return 'Await vendor response.';
    if (status === 'negotiating') return 'Review counter quotation.';
    if (status === 'accepted') return 'Create LOI.';
    if (status === 'rejected') return 'Close or reissue.';
    return 'Quotation in progress.';
  };
  const getCounterNextStep = (status) => {
    if (status === 'pending') return 'Review and decide.';
    if (status === 'accepted') return 'Create LOI.';
    if (status === 'rejected') return 'Close or renegotiate.';
    return 'Counter in progress.';
  };

  // Check if LOI already exists for quotation or counter
  const hasLoi = (quotationId, counterId) => {
    return lois.some((loi) => {
      const loiQuotationId = loi.quotation_id || loi.quotationId;
      const loiCounterId = loi.counter_quotation_id || loi.counterQuotationId;
      if (counterId) return String(loiCounterId) === String(counterId);
      return String(loiQuotationId) === String(quotationId);
    });
  };
  const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
  const getStatusColor = (status) => {
    if (status === 'sent' || status === 'pending') return 'bg-blue-100 text-blue-700';
    if (status === 'negotiating') return 'bg-amber-100 text-amber-700';
    if (status === 'accepted') return 'bg-emerald-100 text-emerald-700';
    if (status === 'rejected') return 'bg-rose-100 text-rose-700';
    return 'bg-slate-100 text-slate-700';
  };
  const resolveEnquiryId = (quotation) => quotation.enquiry_id || quotation.enquiryId;
  const focusId = focusEnquiryId ? String(focusEnquiryId) : '';
  const focusQuotations = focusId
    ? quotations.filter((quotation) => String(resolveEnquiryId(quotation)) === focusId)
    : quotations;
  const focusQuotationIds = new Set(focusQuotations.map((quotation) => quotation.quotation_id));
  const filteredQuotations = focusQuotations.filter((quotation) => {
    const number = getQuotationNumber(quotation).toLowerCase();
    const vendor = (vendorLookup[quotation.vendor_id] || quotation.vendor_name || quotation.vendor_id || '').toLowerCase();
    const matchesSearch = number.includes(quotationSearch.toLowerCase()) || vendor.includes(quotationSearch.toLowerCase());
    const matchesStatus = quotationStatus === 'all' || quotation.status === quotationStatus;
    return matchesSearch && matchesStatus;
  });
  const focusCounters = focusId
    ? counters.filter((counter) => focusQuotationIds.has(counter.quotation_id))
    : counters;
  const filteredCounters = focusCounters.filter((counter) => {
    const number = getCounterNumber(counter).toLowerCase();
    const action = (counter.action || '').toLowerCase();
    const matchesSearch = number.includes(counterSearch.toLowerCase()) || action.includes(counterSearch.toLowerCase());
    const matchesStatus = counterStatus === 'all' || counter.status === counterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-slate-900">Purchase Quotations</h2>
        <p className="text-sm text-slate-500">Review vendor quotations and counter proposals.</p>
      </div>

      {focusId && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-amber-900">
            Showing quotations for enquiry <span className="font-semibold">{focusId}</span>.
          </p>
          {onClearFocus && (
            <button
              type="button"
              onClick={onClearFocus}
              className="text-xs font-semibold uppercase text-amber-800 hover:text-amber-900"
            >
              Clear Filter
            </button>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search quotations by number or vendor..."
              value={quotationSearch}
              onChange={(e) => setQuotationSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>
          <select
            value={quotationStatus}
            onChange={(e) => setQuotationStatus(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="sent">Sent</option>
            <option value="negotiating">Negotiating</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Quotations</h3>
          <span className="text-xs font-semibold text-slate-500 uppercase">Total: {filteredQuotations.length}</span>
        </div>
        {filteredQuotations.length === 0 ? (
          <p className="text-sm text-slate-500">No quotations yet.</p>
        ) : (
          <div className="space-y-3">
            {filteredQuotations.map((quotation) => (
              <button
                type="button"
                key={quotation.quotation_id}
                onClick={() => setSelectedQuotation(quotation)}
                className="w-full text-left rounded-xl border border-slate-200 px-4 py-3 hover:border-slate-400 hover:shadow-md hover:bg-slate-50 transition"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{getQuotationNumber(quotation)}</p>
                    <p className="text-xs text-slate-500">
                      {vendorLookup[quotation.vendor_id] || quotation.vendor_name || quotation.vendor_id || 'Vendor'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{getQuotationNextStep(quotation.status)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 justify-between sm:justify-end">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(quotation.status)}`}>
                      {quotation.status || 'new'}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(quotation.total_amount)}</span>
                  </div>
                </div>
                {quotation.status === 'sent' && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAcceptQuotation(quotation.quotation_id);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-green-600 text-white rounded-lg"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRequestNegotiation(quotation.quotation_id);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-amber-600 text-white rounded-lg"
                    >
                      Counter
                    </button>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search counters by number or action..."
              value={counterSearch}
              onChange={(e) => setCounterSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>
          <select
            value={counterStatus}
            onChange={(e) => setCounterStatus(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Counter Quotations</h3>
          <span className="text-xs font-semibold text-slate-500 uppercase">Total: {filteredCounters.length}</span>
        </div>
        {filteredCounters.length === 0 ? (
          <p className="text-sm text-slate-500">No counter quotations yet.</p>
        ) : (
          <div className="space-y-3">
            {filteredCounters.map((counter) => (
              <button
                type="button"
                key={counter.counter_id}
                onClick={() => setSelectedCounter(counter)}
                className="w-full text-left rounded-xl border border-slate-200 px-4 py-3 hover:border-slate-400 hover:shadow-md hover:bg-slate-50 transition"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{getCounterNumber(counter)}</p>
                    <p className="text-xs text-slate-500">Action: {counter.action || '—'}</p>
                    <p className="text-xs text-slate-500 mt-1">{getCounterNextStep(counter.status)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 justify-between sm:justify-end">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(counter.status)}`}>
                      {counter.status || 'new'}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(counter.total_amount)}</span>
                  </div>
                </div>
                {counter.status === 'pending' && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAcceptCounter(counter.counter_id);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-green-600 text-white rounded-lg"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRejectCounter(counter.counter_id);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <p className="text-xs text-slate-500 uppercase">Quotation Details</p>
                <h2 className="text-xl font-semibold text-slate-900">{getQuotationNumber(selectedQuotation)}</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Vendor: {vendorLookup[selectedQuotation.vendor_id] || selectedQuotation.vendor_name || selectedQuotation.vendor_id || 'Vendor'}
                </p>
              </div>
              <button
                onClick={() => setSelectedQuotation(null)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedQuotation.status)}`}>
                    {selectedQuotation.status || 'new'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Total</label>
                  <p className="text-sm text-slate-900">{formatCurrency(selectedQuotation.total_amount)}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Next Step</label>
                  <p className="text-sm text-slate-900">{getQuotationNextStep(selectedQuotation.status)}</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Line Items</h4>
                {selectedQuotation.items?.length ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full min-w-[720px] text-sm">
                      <thead className="text-xs uppercase text-slate-500">
                        <tr className="border-b border-slate-200">
                          <th className="py-2 text-left font-semibold">Component</th>
                          <th className="py-2 text-right font-semibold">Qty</th>
                          <th className="py-2 text-right font-semibold">Unit</th>
                          <th className="py-2 text-right font-semibold">Disc %</th>
                          <th className="py-2 text-right font-semibold">CGST %</th>
                          <th className="py-2 text-right font-semibold">SGST %</th>
                          <th className="py-2 text-right font-semibold">Line Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedQuotation.items.map((item) => (
                          <tr key={item.item_id} className="border-b border-slate-100">
                            <td className="py-2 text-slate-700">{componentLookup[item.component_id] || 'Component'}</td>
                            <td className="py-2 text-right text-slate-700">{item.quantity}</td>
                            <td className="py-2 text-right text-slate-700">₹{item.unit_price}</td>
                            <td className="py-2 text-right text-slate-700">{item.discount_percent || 0}%</td>
                            <td className="py-2 text-right text-slate-700">{item.cgst_percent || 0}%</td>
                            <td className="py-2 text-right text-slate-700">{item.sgst_percent || 0}%</td>
                            <td className="py-2 text-right font-semibold text-slate-900">₹{item.line_total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No items available.</p>
                )}
              </div>
            </div>
            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
              <button
                onClick={() => setSelectedQuotation(null)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Close
              </button>
              {onGoToLois && !hasLoi(selectedQuotation.quotation_id, null) && (
                <button
                  onClick={() => {
                    onGoToLois(selectedQuotation);
                    setSelectedQuotation(null);
                  }}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition"
                >
                  Create LOI
                </button>
              )}
              {hasLoi(selectedQuotation.quotation_id, null) && (
                <span className="px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-lg">
                  LOI Created ✓
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedCounter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <p className="text-xs text-slate-500 uppercase">Counter Quotation</p>
                <h2 className="text-xl font-semibold text-slate-900">{getCounterNumber(selectedCounter)}</h2>
                <p className="text-xs text-slate-500 mt-1">Action: {selectedCounter.action || '—'}</p>
              </div>
              <button
                onClick={() => setSelectedCounter(null)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedCounter.status)}`}>
                    {selectedCounter.status || 'new'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Total</label>
                  <p className="text-sm text-slate-900">{formatCurrency(selectedCounter.total_amount)}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Next Step</label>
                  <p className="text-sm text-slate-900">{getCounterNextStep(selectedCounter.status)}</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Line Items</h4>
                {selectedCounter.items?.length ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full min-w-[720px] text-sm">
                      <thead className="text-xs uppercase text-slate-500">
                        <tr className="border-b border-slate-200">
                          <th className="py-2 text-left font-semibold">Component</th>
                          <th className="py-2 text-right font-semibold">Qty</th>
                          <th className="py-2 text-right font-semibold">Unit</th>
                          <th className="py-2 text-right font-semibold">Disc %</th>
                          <th className="py-2 text-right font-semibold">CGST %</th>
                          <th className="py-2 text-right font-semibold">SGST %</th>
                          <th className="py-2 text-right font-semibold">Line Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCounter.items.map((item) => (
                          <tr key={item.item_id} className="border-b border-slate-100">
                            <td className="py-2 text-slate-700">{componentLookup[item.component_id] || item.component_id}</td>
                            <td className="py-2 text-right text-slate-700">{item.quantity}</td>
                            <td className="py-2 text-right text-slate-700">₹{item.unit_price}</td>
                            <td className="py-2 text-right text-slate-700">{item.discount_percent || 0}%</td>
                            <td className="py-2 text-right text-slate-700">{item.cgst_percent || 0}%</td>
                            <td className="py-2 text-right text-slate-700">{item.sgst_percent || 0}%</td>
                            <td className="py-2 text-right font-semibold text-slate-900">₹{item.line_total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No items available.</p>
                )}
              </div>
            </div>
            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
              <button
                onClick={() => setSelectedCounter(null)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Close
              </button>
              {onGoToLois && selectedCounter.status === 'accepted' && !hasLoi(selectedCounter.quotation_id, selectedCounter.counter_id) && (
                <button
                  onClick={() => {
                    onGoToLois(selectedCounter);
                    setSelectedCounter(null);
                  }}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition"
                >
                  Create LOI
                </button>
              )}
              {hasLoi(selectedCounter.quotation_id, selectedCounter.counter_id) && (
                <span className="px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-lg">
                  LOI Created ✓
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PurchaseQuotationsTab;
