import { useEffect, useState } from 'react';

// Purchase LOI list and create form
function PurchaseLoisTab({ lois, quotations, counters, orders = [], vendorLookup = {}, formData, onInputChange, onSelectQuotation, onSelectCounter, onSubmit, onGenerateOrder, onGoToOrders, onResubmitLoi, onEditLoi, editingLoiId, focusQuotationId, focusCounterId, onClearFocus }) {
  const [selectedLoi, setSelectedLoi] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [loiSearch, setLoiSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('date_desc');
  const [showErrors, setShowErrors] = useState(false);
  const quotationLookup = quotations.reduce((acc, quotation) => {
    acc[quotation.quotation_id] = quotation.quotation_number;
    return acc;
  }, {});
  useEffect(() => {
    if (formData.quotationId || formData.counterQuotationId) {
      setActiveTab('create');
    }
  }, [formData.quotationId, formData.counterQuotationId]);
  useEffect(() => {
    if (editingLoiId) {
      setActiveTab('create');
    }
  }, [editingLoiId]);
  // Reset error flags when form is cleared (after successful submission)
  // Check if form is in cleared/initial state by checking multiple fields
  useEffect(() => {
    // If all key fields are empty, form was just cleared - reset errors
    const isCleared = !formData.quotationId && !formData.totalAmount && !formData.expectedDeliveryDate;
    if (isCleared && showErrors) {
      setShowErrors(false);
    }
  }, [formData, showErrors]);
  const getNextStep = (status) => {
    if (status === 'sent') return 'Waiting for vendor response.';
    if (status === 'accepted') return 'Generate the purchase order.';
    if (status === 'rejected') return 'Review and decide next action.';
    if (status === 'confirmed') return 'Order generated.';
    return 'LOI in progress.';
  };
  const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
  const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');
  const getStatusColor = (status) => {
    if (status === 'sent') return 'bg-blue-100 text-blue-700';
    if (status === 'accepted') return 'bg-emerald-100 text-emerald-700';
    if (status === 'rejected') return 'bg-rose-100 text-rose-700';
    if (status === 'confirmed') return 'bg-indigo-100 text-indigo-700';
    return 'bg-slate-100 text-slate-700';
  };

  // Check if order already exists for LOI
  const hasOrder = (loiId) => {
    return orders.some((order) => {
      const orderLoiId = order.loi_id || order.loiId;
      return String(orderLoiId) === String(loiId);
    });
  };
  const resolveQuotationId = (loi) => loi.quotation_id || loi.quotationId;
  const resolveCounterId = (loi) => loi.counter_quotation_id || loi.counterQuotationId;
  const focusQuoteId = focusQuotationId ? String(focusQuotationId) : '';
  const focusCounter = focusCounterId ? String(focusCounterId) : '';
  const focusLois = (focusQuoteId || focusCounter)
    ? lois.filter((loi) => {
      if (focusCounter) return String(resolveCounterId(loi)) === focusCounter;
      return String(resolveQuotationId(loi)) === focusQuoteId;
    })
    : lois;
  const filteredLois = focusLois.filter((loi) => {
    const number = (loi.loi_number || '').toLowerCase();
    const vendor = (vendorLookup[loi.vendor_id] || '').toLowerCase();
    const matchesSearch = number.includes(loiSearch.toLowerCase()) || vendor.includes(loiSearch.toLowerCase());
    const matchesStatus = statusFilter === 'all' || loi.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const sortedLois = [...filteredLois].sort((a, b) => {
    const aDate = new Date(a.loi_date || a.created_at || 0).getTime();
    const bDate = new Date(b.loi_date || b.created_at || 0).getTime();
    const aVendor = (vendorLookup[a.vendor_id] || '').toLowerCase();
    const bVendor = (vendorLookup[b.vendor_id] || '').toLowerCase();

    switch (sortOrder) {
      case 'date_asc':
        return aDate - bDate;
      case 'vendor_asc':
        return aVendor.localeCompare(bVendor);
      case 'vendor_desc':
        return bVendor.localeCompare(aVendor);
      default:
        return bDate - aDate;
    }
  });
  const isBlank = (value) => !String(value ?? '').trim();
  const isNumberBlank = (value) => value === '' || value === null || Number.isNaN(Number(value));
  const hasErrors = (
    isBlank(formData.quotationId)
    || isNumberBlank(formData.totalAmount)
    || isNumberBlank(formData.advancePaymentPercent)
    || isBlank(formData.expectedDeliveryDate)
    || isBlank(formData.termsAndConditions)
  );
  const handleSubmit = (e) => {
    setShowErrors(true);
    if (hasErrors) {
      e.preventDefault();
      return;
    }
    onSubmit(e);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`pb-3 px-2 font-semibold text-sm transition border-b-2 ${
              activeTab === 'all'
                ? 'text-slate-900 border-slate-900'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            All LOIs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`pb-3 px-2 font-semibold text-sm transition border-b-2 ${
              activeTab === 'create'
                ? 'text-slate-900 border-slate-900'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            Create LOI
          </button>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab('create')}
          className="rounded-xl bg-slate-900 px-6 py-2.5 text-base font-semibold text-white shadow hover:bg-slate-700"
        >
          + Create New LOI
        </button>
      </div>

      {(focusQuoteId || focusCounter) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-amber-900">
            Showing LOIs for {focusCounter ? 'counter quotation' : 'quotation'}{' '}
            <span className="font-semibold">{focusCounter || focusQuoteId}</span>.
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

      {activeTab === 'create' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex flex-col gap-2 mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">{editingLoiId ? 'Edit LOI' : 'Create LOI'}</h2>
            <p className="text-sm text-slate-500">
              {editingLoiId ? 'Update LOI details before vendor approval.' : 'Issue a letter of intent to a vendor.'}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Select Quotation</label>
              <select
                value={formData.quotationId}
                onChange={(e) => onSelectQuotation(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg ${showErrors && isBlank(formData.quotationId) ? 'border-rose-500' : 'border-slate-300'}`}
                required
              >
                <option value="">Select quotation</option>
                {quotations.map((quotation) => (
                  <option key={quotation.quotation_id} value={quotation.quotation_id}>
                    {quotation.quotation_number} · {vendorLookup[quotation.vendor_id] || 'Vendor'}
                  </option>
                ))}
              </select>
              {showErrors && isBlank(formData.quotationId) && (
                <p className="mt-1 text-xs text-rose-600">Quotation is required.</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Select Counter Quotation <span className="text-xs text-slate-500">(optional)</span></label>
              <select
                value={formData.counterQuotationId}
                onChange={(e) => onSelectCounter(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              >
                <option value="">Select counter quotation</option>
                {counters.map((counter) => (
                  <option key={counter.counter_id} value={counter.counter_id}>
                    {counter.counter_number} · {vendorLookup[counter.vendor_id] || 'Vendor'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Total Amount</label>
              <input
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={onInputChange}
                className={`w-full px-4 py-2 border rounded-lg ${showErrors && isNumberBlank(formData.totalAmount) ? 'border-rose-500' : 'border-slate-300'}`}
                required
              />
              {showErrors && isNumberBlank(formData.totalAmount) && (
                <p className="mt-1 text-xs text-rose-600">Total amount is required.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Advance Payment %</label>
              <input
                type="number"
                min="0"
                max="100"
                name="advancePaymentPercent"
                value={formData.advancePaymentPercent}
                onChange={onInputChange}
                className={`w-full px-4 py-2 border rounded-lg ${showErrors && isNumberBlank(formData.advancePaymentPercent) ? 'border-rose-500' : 'border-slate-300'}`}
                required
              />
              {showErrors && isNumberBlank(formData.advancePaymentPercent) && (
                <p className="mt-1 text-xs text-rose-600">Advance payment percent is required.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Expected Delivery Date</label>
              <input
                type="date"
                name="expectedDeliveryDate"
                value={formData.expectedDeliveryDate}
                onChange={onInputChange}
                className={`w-full px-4 py-2 border rounded-lg ${showErrors && isBlank(formData.expectedDeliveryDate) ? 'border-rose-500' : 'border-slate-300'}`}
                required
              />
              {showErrors && isBlank(formData.expectedDeliveryDate) && (
                <p className="mt-1 text-xs text-rose-600">Expected delivery date is required.</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Terms & Conditions</label>
              <textarea
                name="termsAndConditions"
                value={formData.termsAndConditions}
                onChange={onInputChange}
                className={`w-full px-4 py-2 border rounded-lg ${showErrors && isBlank(formData.termsAndConditions) ? 'border-rose-500' : 'border-slate-300'}`}
                rows="3"
                required
              />
              {showErrors && isBlank(formData.termsAndConditions) && (
                <p className="mt-1 text-xs text-rose-600">Terms and conditions are required.</p>
              )}
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button className="px-5 py-2.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800">
                {editingLoiId ? 'Update LOI' : 'Create LOI'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'all' && (
        <>
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search LOIs by number or vendor..."
                  value={loiSearch}
                  onChange={(e) => setLoiSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="sent">Sent</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="confirmed">Confirmed</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              >
                <option value="date_desc">Newest first</option>
                <option value="date_asc">Oldest first</option>
                <option value="vendor_asc">Vendor A-Z</option>
                <option value="vendor_desc">Vendor Z-A</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">LOIs</h3>
              <span className="text-xs font-semibold text-slate-500 uppercase">Total: {filteredLois.length}</span>
            </div>
            {sortedLois.length === 0 ? (
              <p className="text-sm text-slate-500">No LOIs yet.</p>
            ) : (
              <div className="space-y-3">
                {sortedLois.map((loi) => (
                  <button
                    type="button"
                    key={loi.loi_id}
                    onClick={() => setSelectedLoi(loi)}
                    className="w-full text-left rounded-xl border border-slate-200 px-4 py-3 hover:border-slate-400 hover:shadow-md hover:bg-slate-50 transition"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{loi.loi_number}</p>
                        <p className="text-xs text-slate-500">
                          {vendorLookup[loi.vendor_id] || 'Vendor'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{getNextStep(loi.status)}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 justify-between sm:justify-end">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(loi.status)}`}>
                          {loi.status || 'new'}
                        </span>
                        <span className="text-sm font-semibold text-slate-900">{formatCurrency(loi.total_amount)}</span>
                      </div>
                    </div>
                    {loi.status === 'accepted' && !hasOrder(loi.loi_id) && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onGenerateOrder(loi);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg"
                        >
                          Generate Order
                        </button>
                      </div>
                    )}
                    {hasOrder(loi.loi_id) && (
                      <div className="mt-3">
                        <span className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg inline-block">
                          Order Created ✓
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {selectedLoi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <p className="text-xs text-slate-500 uppercase">LOI Details</p>
                <h2 className="text-xl font-semibold text-slate-900">{selectedLoi.loi_number}</h2>
                <p className="text-xs text-slate-500 mt-1">Vendor: {vendorLookup[selectedLoi.vendor_id] || 'Vendor'}</p>
              </div>
              <button
                onClick={() => setSelectedLoi(null)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Quotation</label>
                  <p className="text-sm text-slate-900">{quotationLookup[selectedLoi.quotation_id] || 'Quotation'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedLoi.status)}`}>
                    {selectedLoi.status || 'new'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Total</label>
                  <p className="text-sm text-slate-900">{formatCurrency(selectedLoi.total_amount)}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Expected Delivery</label>
                  <p className="text-sm text-slate-900">{formatDate(selectedLoi.expected_delivery_date)}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Terms & Conditions</label>
                <p className="text-sm text-slate-600 p-3 bg-slate-50 rounded-lg">
                  {selectedLoi.terms_and_conditions || '—'}
                </p>
              </div>
            </div>
            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
              <button
                onClick={() => setSelectedLoi(null)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Close
              </button>
              {onGoToOrders && !hasOrder(selectedLoi.loi_id) && (
                <button
                  onClick={() => {
                    onGoToOrders(selectedLoi);
                    setSelectedLoi(null);
                  }}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition"
                >
                  Create Order
                </button>
              )}
              {onEditLoi && ['sent', 'rejected'].includes(selectedLoi.status || 'sent') && (
                <button
                  onClick={() => {
                    onEditLoi(selectedLoi);
                    setSelectedLoi(null);
                    setActiveTab('create');
                  }}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 transition"
                >
                  Edit LOI
                </button>
              )}
              {hasOrder(selectedLoi.loi_id) && (
                <span className="px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-lg">
                  Order Created ✓
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PurchaseLoisTab;
