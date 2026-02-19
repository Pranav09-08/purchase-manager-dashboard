import { useEffect, useState } from 'react';

// Vendor invoices list and create form
function InvoicesTab({ invoices, lois, orders, payments = [], formData, items, componentLookup = {}, onInputChange, onAddItem, onRemoveItem, onItemChange, onSubmit, onGoToPayments, focusOrderId, prefillOrderId, onClearFocus }) {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedInvoiceForPayments, setSelectedInvoiceForPayments] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showErrors, setShowErrors] = useState(false);
  // Reset error flags when form is cleared (after successful submission)
  // Check if form is in cleared/initial state by checking multiple fields
  useEffect(() => {
    // If all key fields are empty, form was just cleared - reset errors
    const isCleared = !formData.loiId && !formData.orderId && !formData.companyId;
    if (isCleared && showErrors) {
      setShowErrors(false);
    }
  }, [formData, showErrors]);
  const orderLookup = orders.reduce((acc, order) => {
    acc[order.order_id] = order.order_number || 'Order';
    return acc;
  }, {});
  const invoicedOrders = invoices.reduce((acc, invoice) => {
    acc[invoice.order_id] = invoice.status;
    return acc;
  }, {});
  const paymentTotals = payments.reduce((acc, payment) => {
    if (payment.status === 'failed') return acc;
    const key = String(payment.order_id);
    const amount = parseFloat(payment.amount || 0);
    acc[key] = (acc[key] || 0) + amount;
    return acc;
  }, {});
  const eligibleOrders = orders.filter((order) => (
    order.status === 'confirmed' && !invoicedOrders[order.order_id]
  ));
  useEffect(() => {
    if (prefillOrderId) {
      setActiveTab('create');
    }
  }, [prefillOrderId]);
  const getNextStep = (status, pending = null) => {
    // If pending is provided and = 0, show closed status
    if (pending !== null && pending <= 0.01) {
      return 'Invoice settled and closed.';
    }
    if (status === 'pending') return 'Await purchase manager review.';
    if (status === 'received') return 'Await acceptance.';
    if (status === 'accepted') return 'Await payment.';
    if (status === 'paid') return 'Invoice settled.';
    if (status === 'rejected') return 'Submit a revised invoice.';
    return 'Invoice in progress.';
  };
  const formatCurrency = (value) => `₹${Number(value || 0).toFixed(2)}`;
  const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');
  const getStatusColor = (status, pending = null) => {
    // If pending = 0, show as indigo (closed/settled)
    if (pending !== null && pending <= 0.01) return 'bg-indigo-100 text-indigo-700';
    if (status === 'pending' || status === 'received') return 'bg-blue-100 text-blue-700';
    if (status === 'accepted') return 'bg-emerald-100 text-emerald-700';
    if (status === 'paid') return 'bg-indigo-100 text-indigo-700';
    if (status === 'rejected') return 'bg-rose-100 text-rose-700';
    return 'bg-slate-100 text-slate-700';
  };
  const getDisplayStatus = (status, pending = null) => {
    if (pending !== null && pending <= 0.01) return 'closed';
    return status;
  };
  const focusId = focusOrderId ? String(focusOrderId) : '';
  const focusInvoices = focusId
    ? invoices.filter((invoice) => String(invoice.order_id) === focusId)
    : invoices;
  const filteredInvoices = focusInvoices.filter((invoice) => {
    const number = (invoice.invoice_number || '').toLowerCase();
    const orderNumber = (orderLookup[invoice.order_id] || '').toLowerCase();
    const matchesSearch = number.includes(invoiceSearch.toLowerCase()) || orderNumber.includes(invoiceSearch.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const isBlank = (value) => !String(value ?? '').trim();
  const isNumberBlank = (value) => value === '' || value === null || Number.isNaN(Number(value));
  const isQuantityInvalid = (value) => Number(value) <= 0;
  const itemErrors = items.some((item) => (
    isQuantityInvalid(item.quantity)
    || isNumberBlank(item.unitPrice)
    || isNumberBlank(item.discountPercent)
    || isNumberBlank(item.cgstPercent)
    || isNumberBlank(item.sgstPercent)
  ));
  const hasErrors = (
    isBlank(formData.orderId)
    || items.length === 0
    || itemErrors
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
            All Invoices
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
            Create Invoice
          </button>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab('create')}
          className="rounded-xl bg-slate-900 px-6 py-2.5 text-base font-semibold text-white shadow hover:bg-slate-700"
        >
          + Create Invoice
        </button>
      </div>

      {focusId && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-amber-900">
            Showing invoices for order <span className="font-semibold">{focusId}</span>.
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
            <h3 className="text-2xl font-semibold text-slate-900">Create Invoice</h3>
            <p className="text-sm text-slate-500">Generate an invoice for a confirmed order.</p>
          </div>
          {eligibleOrders.length === 0 ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600">
              No confirmed orders available for invoicing.
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select LOI <span className="text-xs text-slate-500">(optional)</span></label>
            <select
              name="loiId"
              value={formData.loiId || ''}
              onChange={onInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
            >
              <option value="">Select LOI</option>
              {lois.map((loi) => (
                <option key={loi.loi_id} value={loi.loi_id}>
                  {loi.loi_number} ({loi.status})
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Order</label>
            <select
              name="orderId"
              value={formData.orderId}
              onChange={onInputChange}
              className={`w-full px-4 py-2 border rounded-lg ${showErrors && isBlank(formData.orderId) ? 'border-rose-500' : 'border-slate-300'}`}
              required
            >
              <option value="">Select order</option>
              {eligibleOrders.map((order) => (
                <option key={order.order_id} value={order.order_id}>
                  {order.order_number} ({order.status})
                </option>
              ))}
            </select>
            {showErrors && isBlank(formData.orderId) && (
              <p className="mt-1 text-xs text-rose-600">Order is required.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Notes <span className="text-xs text-slate-500">(optional)</span></label>
            <input
              name="notes"
              value={formData.notes}
              onChange={onInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-700">Items</label>
              <button
                type="button"
                onClick={onAddItem}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white"
              >
                Add Item
              </button>
            </div>
            {items.length === 0 ? (
              <div className={`p-4 bg-slate-50 border rounded-lg text-sm ${showErrors ? 'border-rose-500 text-rose-600' : 'border-slate-200 text-slate-600'}`}>
                Add at least one item.
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={`${item.componentId}-${index}`} className="grid grid-cols-1 md:grid-cols-8 gap-3 bg-white border border-slate-200 rounded-lg p-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => onItemChange(index, 'quantity', e.target.value)}
                        className={`w-full px-2 py-1.5 border rounded-md ${showErrors && isQuantityInvalid(item.quantity) ? 'border-rose-500' : 'border-slate-300'}`}
                        required
                      />
                      {showErrors && isQuantityInvalid(item.quantity) && (
                        <p className="mt-1 text-xs text-rose-600">Qty is required.</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Unit Price</label>
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => onItemChange(index, 'unitPrice', e.target.value)}
                        className={`w-full px-2 py-1.5 border rounded-md ${showErrors && isNumberBlank(item.unitPrice) ? 'border-rose-500' : 'border-slate-300'}`}
                        required
                      />
                      {showErrors && isNumberBlank(item.unitPrice) && (
                        <p className="mt-1 text-xs text-rose-600">Unit price is required.</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Discount %</label>
                      <input
                        type="number"
                        min="0"
                        value={item.discountPercent}
                        onChange={(e) => onItemChange(index, 'discountPercent', e.target.value)}
                        className={`w-full px-2 py-1.5 border rounded-md ${showErrors && isNumberBlank(item.discountPercent) ? 'border-rose-500' : 'border-slate-300'}`}
                        required
                      />
                      {showErrors && isNumberBlank(item.discountPercent) && (
                        <p className="mt-1 text-xs text-rose-600">Discount is required.</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">CGST %</label>
                      <input
                        type="number"
                        min="0"
                        value={item.cgstPercent}
                        onChange={(e) => onItemChange(index, 'cgstPercent', e.target.value)}
                        className={`w-full px-2 py-1.5 border rounded-md ${showErrors && isNumberBlank(item.cgstPercent) ? 'border-rose-500' : 'border-slate-300'}`}
                        required
                      />
                      {showErrors && isNumberBlank(item.cgstPercent) && (
                        <p className="mt-1 text-xs text-rose-600">CGST is required.</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">SGST %</label>
                      <input
                        type="number"
                        min="0"
                        value={item.sgstPercent}
                        onChange={(e) => onItemChange(index, 'sgstPercent', e.target.value)}
                        className={`w-full px-2 py-1.5 border rounded-md ${showErrors && isNumberBlank(item.sgstPercent) ? 'border-rose-500' : 'border-slate-300'}`}
                        required
                      />
                      {showErrors && isNumberBlank(item.sgstPercent) && (
                        <p className="mt-1 text-xs text-rose-600">SGST is required.</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Line Total (pre-tax)</label>
                      <input
                        type="number"
                        min="0"
                        value={item.lineTotal}
                        readOnly
                        className="w-full px-2 py-1.5 border rounded-md bg-slate-50 text-slate-700"
                      />
                    </div>
                    <div className="md:col-span-8 flex justify-end">
                      <button
                        type="button"
                        onClick={() => onRemoveItem(index)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 text-white"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button className="px-5 py-2.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800">Create Invoice</button>
          </div>
          </form>
          )}
        </div>
      )}

      {activeTab === 'all' && (
        <>
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search invoices by number or order..."
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="received">Received</option>
                <option value="accepted">Accepted</option>
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Your Invoices</h3>
              <span className="text-xs font-semibold text-slate-500 uppercase">Total: {filteredInvoices.length}</span>
            </div>
            {filteredInvoices.length === 0 ? (
              <p className="text-sm text-slate-500">No invoices yet.</p>
            ) : (
              <div className="space-y-3">
                {filteredInvoices.map((invoice) => {
                  const totalPaid = paymentTotals[String(invoice.order_id)] || 0;
                  const totalAmount = Number(invoice.total_amount || 0);
                  const pending = Math.max(0, totalAmount - totalPaid);
                  return (
                  <button
                    type="button"
                    key={invoice.invoice_id}
                    onClick={() => setSelectedInvoice(invoice)}
                    className="w-full text-left rounded-xl border border-slate-200 px-4 py-3 hover:border-slate-400 hover:shadow-md hover:bg-slate-50 transition"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{invoice.invoice_number}</p>
                        <p className="text-xs text-slate-500">Order: {orderLookup[invoice.order_id] || 'Order'}</p>
                        <p className="text-xs text-slate-500 mt-1">{getNextStep(invoice.status, pending)}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 justify-between sm:justify-end">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(invoice.status, pending)}`}>
                          {getDisplayStatus(invoice.status, pending)}
                        </span>
                        <span className="text-sm font-semibold text-slate-900">{formatCurrency(invoice.total_amount)}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">Invoice date: {formatDate(invoice.invoice_date)}</div>
                  </button>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-4xl rounded-2xl bg-white shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <p className="text-xs text-slate-500 uppercase">Invoice Details</p>
                <h4 className="text-lg font-bold text-slate-900">{selectedInvoice.invoice_number}</h4>
                <p className="text-xs text-slate-500 mt-1">Order: {orderLookup[selectedInvoice.order_id] || 'Order'}</p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {(() => {
                const totalPaid = paymentTotals[String(selectedInvoice.order_id)] || 0;
                const totalAmount = Number(selectedInvoice.total_amount || 0);
                const pending = Math.max(0, totalAmount - totalPaid);
                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                      <p className="text-xs text-slate-500">Total Amount</p>
                      <p className="font-semibold text-slate-900">{formatCurrency(totalAmount)}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                      <p className="text-xs text-slate-500">Paid</p>
                      <p className="font-semibold text-slate-900">{formatCurrency(totalPaid)}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                      <p className="text-xs text-slate-500">Pending</p>
                      <p className="font-semibold text-slate-900">{formatCurrency(pending)}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                      <p className="text-xs text-slate-500">Payment Status</p>
                      <p className="font-semibold text-slate-900">{pending <= 0.01 ? 'Settled' : 'Open'}</p>
                    </div>
                  </div>
                );
              })()}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  <p className="text-xs text-slate-500">Status</p>
                  <span className={`inline-flex px-3 py-1 mt-1 rounded-full text-xs font-semibold ${getStatusColor(selectedInvoice.status)}`}>
                    {selectedInvoice.status || 'new'}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  <p className="text-xs text-slate-500">Invoice Date</p>
                  <p className="font-semibold text-slate-900">{formatDate(selectedInvoice.invoice_date)}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  <p className="text-xs text-slate-500">Total</p>
                  <p className="font-semibold text-slate-900">{formatCurrency(selectedInvoice.total_amount)}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  <p className="text-xs text-slate-500">Subtotal</p>
                  <p className="font-semibold text-slate-900">{formatCurrency(selectedInvoice.subtotal)}</p>
                </div>
              </div>

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
                    {(selectedInvoice.items || []).length === 0 ? (
                      <tr>
                        <td className="py-3 text-slate-500" colSpan={7}>No line items.</td>
                      </tr>
                    ) : (
                      (selectedInvoice.items || []).map((item) => (
                        <tr key={item.item_id} className="border-b border-slate-100">
                          <td className="py-2 text-slate-700">
                            {componentLookup[item.component_id] || 'Component'}
                          </td>
                          <td className="py-2 text-right text-slate-700">{item.quantity}</td>
                          <td className="py-2 text-right text-slate-700">{formatCurrency(item.unit_price)}</td>
                          <td className="py-2 text-right text-slate-700">{item.discount_percent || 0}%</td>
                          <td className="py-2 text-right text-slate-700">{item.cgst_percent || 0}%</td>
                          <td className="py-2 text-right text-slate-700">{item.sgst_percent || 0}%</td>
                          <td className="py-2 text-right font-semibold text-slate-900">{formatCurrency(item.line_total)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  <p className="text-xs text-slate-500">Total Discount</p>
                  <p className="font-semibold text-slate-900">{formatCurrency(selectedInvoice.total_discount)}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  <p className="text-xs text-slate-500">Total CGST</p>
                  <p className="font-semibold text-slate-900">{formatCurrency(selectedInvoice.total_cgst)}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  <p className="text-xs text-slate-500">Total SGST</p>
                  <p className="font-semibold text-slate-900">{formatCurrency(selectedInvoice.total_sgst)}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  <p className="text-xs text-slate-500">Payable</p>
                  <p className="font-semibold text-slate-900">{formatCurrency(selectedInvoice.total_amount)}</p>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div className="text-sm text-slate-600">Notes: {selectedInvoice.notes}</div>
              )}
              {(() => {
                const totalPaid = paymentTotals[String(selectedInvoice.order_id)] || 0;
                const totalAmount = Number(selectedInvoice.total_amount || 0);
                const pending = Math.max(0, totalAmount - totalPaid);
                return (
                  <div className="text-sm text-slate-600">Next: {getNextStep(selectedInvoice.status, pending)}</div>
                );
              })()}
            </div>
            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Close
              </button>
              {(() => {
                const totalPaid = paymentTotals[String(selectedInvoice.order_id)] || 0;
                const totalAmount = Number(selectedInvoice.total_amount || 0);
                const pending = Math.max(0, totalAmount - totalPaid);
                const isSettled = pending <= 0.01;

                if (isSettled) {
                  return (
                    <button
                      onClick={() => setSelectedInvoiceForPayments(selectedInvoice.invoice_id)}
                      className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition"
                    >
                      View Payments Received
                    </button>
                  );
                }

                return (
                  onGoToPayments && (
                    <button
                      onClick={() => {
                        onGoToPayments(selectedInvoice.order_id);
                        setSelectedInvoice(null);
                      }}
                      className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition"
                    >
                      View Payments
                    </button>
                  )
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {selectedInvoiceForPayments && (() => {
        const invoice = invoices.find((inv) => String(inv.invoice_id) === String(selectedInvoiceForPayments));
        if (!invoice) return null;

        const orderId = invoice.order_id;
        const invoicePayments = payments.filter((p) => String(p.order_id) === String(orderId) && p.status !== 'failed');

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-3xl rounded-2xl bg-white shadow-lg max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase">Payments Received</p>
                  <h2 className="text-xl font-semibold text-slate-900">Invoice {invoice.invoice_number || invoice.invoice_id}</h2>
                </div>
                <button
                  onClick={() => setSelectedInvoiceForPayments(null)}
                  className="text-slate-400 hover:text-slate-600 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                {invoicePayments.length === 0 ? (
                  <p className="text-sm text-slate-500">No payments received for this invoice.</p>
                ) : (
                  <div className="space-y-3">
                    {invoicePayments.map((payment) => (
                      <div key={payment.payment_id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{formatCurrency(payment.amount)}</p>
                            <p className="text-xs text-slate-600 mt-1">Phase: {payment.phase || '—'}</p>
                            <p className="text-xs text-slate-600">Mode: {payment.payment_mode || '—'}</p>
                            <p className="text-xs text-slate-600">Paid: {formatDate(payment.payment_date)}</p>
                            {payment.reference_number && (
                              <p className="text-xs text-slate-600">Ref: {payment.reference_number}</p>
                            )}
                          </div>
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(payment.status)}`}>
                            {payment.status || 'new'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
                <button
                  onClick={() => setSelectedInvoiceForPayments(null)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default InvoicesTab;
