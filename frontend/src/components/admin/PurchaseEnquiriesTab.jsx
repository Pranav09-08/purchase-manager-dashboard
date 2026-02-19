import { useEffect, useState } from 'react';

// Purchase enquiries (RFQ) list and create form
function PurchaseEnquiriesTab({
  enquiries,
  quotations = [],
  components,
  vendors = [],
  selectedItems,
  formData,
  onInputChange,
  onAddItem,
  onRemoveItem,
  onItemChange,
  onSubmit,
  onEditEnquiry,
  editingEnquiryId,
  onCancelEdit,
  componentLookup = {},
  componentDetailsLookup = {},
  productLookup = {},
}) {
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [quotationEnquiry, setQuotationEnquiry] = useState(null);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [enquirySearch, setEnquirySearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showErrors, setShowErrors] = useState(false);
  // Reset error flags when form is cleared (after successful submission)
  useEffect(() => {
    // If all key fields are empty, form was just cleared - reset errors
    const isCleared = !formData.vendor && !formData.title && !formData.requiredDeliveryDate;
    if (isCleared && showErrors) {
      setShowErrors(false);
    }
  }, [formData, showErrors]);
  const getEnquiryTitle = (enquiry) => (
    enquiry.title
    || enquiry.enquiry_title
    || enquiry.subject
    || `Enquiry ${enquiry.enquiry_id || ''}`
  );
  const resolveComponentId = (item) => item.component_id || item.componentId || item.componentid;
  const resolveProductName = (item, component) => {
    const directName = (
      item.product_name
      || item.product_title
      || item.productTitle
      || item.product
      || component?.product_name
      || component?.productTitle
    );
    if (directName) return directName;

    const productId = component?.productId || component?.productid;
    if (productId && productLookup[productId]) return productLookup[productId];

    return component?.product_name || component?.component_name || '—';
  };
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
  const resolveEnquiryId = (quotation) => quotation.enquiry_id || quotation.enquiryId;
  const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;
  const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');
  const vendorLookup = vendors.reduce((acc, vendor) => {
    acc[vendor.vendorId] = vendor.label;
    return acc;
  }, {});
  const selectedVendorId = formData.vendorId;
  const filteredComponents = selectedVendorId
    ? components.filter((component) => {
      const componentVendorId = component.vendorid || component.vendor_id;
      return componentVendorId === selectedVendorId;
    })
    : components;
  const getStatusLabel = (status) => {
    if (status === 'quoted') return 'Quoted';
    if (status === 'accepted') return 'Accepted';
    if (status === 'rejected') return 'Rejected by Vendor';
    if (status === 'raised' || status === 'pending' || status === 'new') return 'Pending';
    return 'Pending';
  };
  const getStatusColor = (status) => {
    if (status === 'quoted') return 'bg-emerald-100 text-emerald-700';
    if (status === 'accepted') return 'bg-blue-100 text-blue-700';
    if (status === 'rejected') return 'bg-rose-100 text-rose-700';
    if (status === 'raised' || status === 'pending' || status === 'new') return 'bg-amber-100 text-amber-700';
    return 'bg-slate-100 text-slate-700';
  };
  const getQuotationStatusLabel = (status) => {
    if (status === 'sent') return 'Sent';
    if (status === 'negotiating') return 'Negotiating';
    if (status === 'accepted') return 'Accepted';
    if (status === 'rejected') return 'Rejected';
    return status || 'New';
  };
  const getQuotationStatusColor = (status) => {
    if (status === 'sent') return 'bg-blue-100 text-blue-700';
    if (status === 'negotiating') return 'bg-amber-100 text-amber-700';
    if (status === 'accepted') return 'bg-emerald-100 text-emerald-700';
    if (status === 'rejected') return 'bg-rose-100 text-rose-700';
    return 'bg-slate-100 text-slate-700';
  };
  const filteredEnquiries = enquiries.filter((enquiry) => {
    const title = (getEnquiryTitle(enquiry) || '').toLowerCase();
    const description = (enquiry.description || '').toLowerCase();
    const matchesSearch =
      title.includes(enquirySearch.toLowerCase()) ||
      description.includes(enquirySearch.toLowerCase());
    const status = enquiry.status || 'pending';
    const matchesStatus = statusFilter === 'all'
      || (statusFilter === 'pending' && ['raised', 'pending', 'new'].includes(status))
      || (statusFilter === 'quoted' && status === 'quoted')
      || (statusFilter === 'rejected' && status === 'rejected');
    return matchesSearch && matchesStatus;
  });
  const selectedEnquiryId = quotationEnquiry?.enquiry_id || quotationEnquiry?.enquiryId || '';
  const enquiryQuotations = selectedEnquiryId
    ? quotations.filter((quotation) => String(resolveEnquiryId(quotation)) === String(selectedEnquiryId))
    : [];
  const isBlank = (value) => !String(value ?? '').trim();
  const isQuantityInvalid = (value) => Number(value) <= 0;
  const hasItemErrors = selectedItems.some((item) => (
    isQuantityInvalid(item.quantity) || isBlank(item.specifications)
  ));
  const hasErrors = (
    isBlank(formData.vendorId)
    || isBlank(formData.title)
    || isBlank(formData.description)
    || isBlank(formData.requiredDeliveryDate)
    || isBlank(formData.source)
    || selectedItems.length === 0
    || hasItemErrors
  );
  const handleSubmit = (e) => {
    setShowErrors(true);
    if (hasErrors) {
      e.preventDefault();
      return;
    }
    onSubmit(e);
  };

  useEffect(() => {
    if (editingEnquiryId) {
      setActiveTab('create');
    }
  }, [editingEnquiryId]);

  const handleResubmitEnquiry = (enquiry) => {
    // Load the enquiry for editing with fresh status (resubmit)
    onEditEnquiry(enquiry);
    setActiveTab('create');
    setSelectedEnquiry(null);
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
            All Enquiries
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
            Create Enquiry
          </button>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab('create')}
          className="rounded-xl bg-slate-900 px-6 py-2.5 text-base font-semibold text-white shadow hover:bg-slate-700"
        >
          + Create New Enquiry
        </button>
      </div>

      {activeTab === 'create' && (
        <div>
          <div className="flex flex-col gap-2 mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">{editingEnquiryId ? 'Edit Enquiry' : 'Raise Enquiry'}</h2>
            <p className="text-sm text-slate-500">
              {editingEnquiryId ? 'Update enquiry details before it is quoted.' : 'Choose a vendor and submit your requirements.'}
            </p>
          </div>
          
          {formData._previousRejectionReason && (
            <div className="mb-6 bg-rose-50 border border-rose-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-rose-900 mb-2">Previous Vendor Rejection:</p>
              <p className="text-sm text-rose-800">{formData._previousRejectionReason}</p>
              <p className="text-xs text-rose-700 mt-2 italic">Please address the concerns mentioned above before resubmitting.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900">Enquiry Details</h3>
              <p className="text-sm text-slate-500">Send an RFQ to a vendor.</p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Vendor</label>
            <select
              name="vendorId"
              value={formData.vendorId}
              onChange={onInputChange}
              className={`w-full px-4 py-2 bg-white border rounded-lg text-sm ${showErrors && isBlank(formData.vendorId) ? 'border-rose-500' : 'border-slate-300'}`}
              required
            >
              <option value="">Choose a vendor</option>
              {vendors.map((vendor) => (
                <option key={vendor.vendorId} value={vendor.vendorId}>
                  {vendor.label}
                </option>
              ))}
            </select>
            {showErrors && isBlank(formData.vendorId) && (
              <p className="mt-1 text-xs text-rose-600">Vendor is required.</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={onInputChange}
              className={`w-full px-4 py-2 bg-white border rounded-lg text-sm ${showErrors && isBlank(formData.title) ? 'border-rose-500' : 'border-slate-300'}`}
              required
            />
            {showErrors && isBlank(formData.title) && (
              <p className="mt-1 text-xs text-rose-600">Title is required.</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onInputChange}
              className={`w-full px-4 py-2 bg-white border rounded-lg text-sm ${showErrors && isBlank(formData.description) ? 'border-rose-500' : 'border-slate-300'}`}
              rows="3"
              required
            />
            {showErrors && isBlank(formData.description) && (
              <p className="mt-1 text-xs text-rose-600">Description is required.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Required Delivery Date</label>
            <input
              type="date"
              name="requiredDeliveryDate"
              value={formData.requiredDeliveryDate}
              onChange={onInputChange}
              className={`w-full px-4 py-2 bg-white border rounded-lg text-sm ${showErrors && isBlank(formData.requiredDeliveryDate) ? 'border-rose-500' : 'border-slate-300'}`}
              required
            />
            {showErrors && isBlank(formData.requiredDeliveryDate) && (
              <p className="mt-1 text-xs text-rose-600">Delivery date is required.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Source</label>
            <input
              type="text"
              name="source"
              value={formData.source}
              onChange={onInputChange}
              className={`w-full px-4 py-2 bg-white border rounded-lg text-sm ${showErrors && isBlank(formData.source) ? 'border-rose-500' : 'border-slate-300'}`}
              placeholder="emergency"
              required
            />
            {showErrors && isBlank(formData.source) && (
              <p className="mt-1 text-xs text-rose-600">Source is required.</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Components</label>
            {filteredComponents.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600">
                {selectedVendorId ? 'No components available for this vendor.' : 'No components available.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredComponents.map((component) => {
                  const componentId = component.componentid || component.id;
                  const componentName = component.component_name || component.name;
                  const componentDescription = component.description || '—';
                  const isSelected = selectedItems.some((item) => item.componentId === componentId);
                  return (
                    <div key={componentId} className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{componentName}</p>
                          <p className="text-xs text-slate-500">{componentDescription}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onAddItem(component)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${isSelected ? 'bg-slate-200 text-slate-600' : 'bg-slate-900 text-white'}`}
                          disabled={isSelected}
                        >
                          {isSelected ? 'Added' : 'Add'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Selected Items</label>
            {selectedItems.length === 0 ? (
              <div className={`p-4 bg-slate-50 border rounded-lg text-sm ${showErrors ? 'border-rose-500 text-rose-600' : 'border-slate-200 text-slate-600'}`}>
                Select at least one component.
              </div>
            ) : (
              <div className="space-y-3">
                {selectedItems.map((item) => (
                  <div key={item.componentId} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center bg-white border border-slate-200 rounded-lg p-3">
                    <div className="md:col-span-2">
                      <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => onItemChange(item.componentId, 'quantity', e.target.value)}
                        className={`w-full px-2 py-1.5 border rounded-md text-sm ${showErrors && isQuantityInvalid(item.quantity) ? 'border-rose-500' : 'border-slate-300'}`}
                        required
                      />
                      {showErrors && isQuantityInvalid(item.quantity) && (
                        <p className="mt-1 text-xs text-rose-600">Quantity is required.</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Specifications</label>
                      <input
                        value={item.specifications}
                        onChange={(e) => onItemChange(item.componentId, 'specifications', e.target.value)}
                        className={`w-full px-2 py-1.5 border rounded-md text-sm ${showErrors && isBlank(item.specifications) ? 'border-rose-500' : 'border-slate-300'}`}
                        required
                      />
                      {showErrors && isBlank(item.specifications) && (
                        <p className="mt-1 text-xs text-rose-600">Specifications are required.</p>
                      )}
                    </div>
                    <div className="md:col-span-5 flex justify-end">
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.componentId)}
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
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('all');
                  if (editingEnquiryId && onCancelEdit) onCancelEdit();
                }}
                className="rounded-xl bg-slate-200 px-6 py-3 text-base font-semibold text-slate-900 hover:bg-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-6 py-3 text-base font-semibold text-white hover:bg-slate-800"
              >
                {editingEnquiryId ? 'Update Enquiry' : 'Create Enquiry'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'all' && (
        <div>
          <div className="flex flex-col gap-2 mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">All Enquiries</h2>
            <p className="text-sm text-slate-500">View and manage your enquiries.</p>
          </div>

          <div className="mb-6 bg-white rounded-2xl border border-slate-200 p-4">
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
                <option value="pending">Pending</option>
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
                    onClick={() => setSelectedEnquiry(enquiry)}
                    className="w-full text-left rounded-xl border border-slate-200 px-4 py-3 hover:border-slate-400 hover:shadow-md hover:bg-slate-50 transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {getEnquiryTitle(enquiry)}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {enquiry.description || 'No description'}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${getStatusColor(enquiry.status)}`}>
                        {getStatusLabel(enquiry.status)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                      <span>Vendor: {vendorLookup[enquiry.vendor_id] || enquiry.vendor_name || enquiry.vendor_id || 'Vendor'}</span>
                      <span>Created: {new Date(enquiry.created_at).toLocaleDateString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
                      {getEnquiryTitle(selectedEnquiry)}
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
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Vendor</label>
                    <p className="text-sm text-slate-900">
                      {vendorLookup[selectedEnquiry.vendor_id] || selectedEnquiry.vendor_name || selectedEnquiry.vendor_id || 'Vendor'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Required Delivery Date</label>
                    <p className="text-sm text-slate-900">
                      {selectedEnquiry.required_delivery_date ? new Date(selectedEnquiry.required_delivery_date).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Source</label>
                    <p className="text-sm text-slate-900 capitalize">{selectedEnquiry.source || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Created Date</label>
                    <p className="text-sm text-slate-900">{new Date(selectedEnquiry.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Line Items</h4>
                  {selectedEnquiry.items?.length ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full min-w-[1100px] text-sm">
                        <thead className="text-xs uppercase text-slate-500">
                          <tr className="border-b border-slate-200">
                            <th className="py-2 text-left font-semibold">Product</th>
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
                            const component = componentDetailsLookup[resolveComponentId(item)] || {};
                            const cgst = resolveGst(item, component, 'cgst');
                            const sgst = resolveGst(item, component, 'sgst');
                            const basePrice = Number(component.price_per_unit) || 0;
                            const cgstAmount = (basePrice * cgst) / 100;
                            const sgstAmount = (basePrice * sgst) / 100;
                            const finalPrice = basePrice + cgstAmount + sgstAmount;
                            return (
                              <tr key={item.item_id || item.component_id} className="border-b border-slate-100">
                                <td className="py-2 text-slate-700">{resolveProductName(item, component)}</td>
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
                  <p className="text-sm font-semibold text-rose-900 mb-2">Vendor Rejection Reason:</p>
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
              {selectedEnquiry.status === 'rejected' && onEditEnquiry && (
                <button
                  onClick={() => {
                    handleResubmitEnquiry(selectedEnquiry);
                  }}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 transition"
                >
                  Resubmit with Changes
                </button>
              )}
              {onEditEnquiry && ['pending', 'raised', 'new'].includes(selectedEnquiry.status || 'pending') && (
                <button
                  onClick={() => {
                    onEditEnquiry(selectedEnquiry);
                    setSelectedEnquiry(null);
                    setActiveTab('create');
                  }}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 transition"
                >
                  Edit Enquiry
                </button>
              )}
              {selectedEnquiry.status !== 'rejected' && (
                <button
                  onClick={() => {
                    setQuotationEnquiry(selectedEnquiry);
                    setShowQuotationModal(true);
                    setSelectedEnquiry(null);
                  }}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition"
                >
                  View Quotations
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showQuotationModal && quotationEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <p className="text-xs text-slate-500 uppercase">Quotations</p>
                <h2 className="text-xl font-semibold text-slate-900">
                  {getEnquiryTitle(quotationEnquiry)}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowQuotationModal(false);
                  setQuotationEnquiry(null);
                }}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {enquiryQuotations.length === 0 ? (
                <p className="text-sm text-slate-500">Quotation is not raised yet.</p>
              ) : (
                <div className="space-y-3">
                  {enquiryQuotations.map((quotation) => (
                    <div
                      key={quotation.quotation_id}
                      className="rounded-xl border border-slate-200 px-4 py-3"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {quotation.quotation_number || `Quotation ${quotation.quotation_id}`}
                          </p>
                          <p className="text-xs text-slate-500">
                            Vendor: {vendorLookup[quotation.vendor_id] || quotation.vendor_name || quotation.vendor_id || 'Vendor'}
                          </p>
                          <p className="text-xs text-slate-500">
                            Date: {formatDate(quotation.created_at)}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 justify-between sm:justify-end">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getQuotationStatusColor(quotation.status)}`}>
                            {getQuotationStatusLabel(quotation.status)}
                          </span>
                          <span className="text-sm font-semibold text-slate-900">
                            {formatCurrency(quotation.total_amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
              <button
                onClick={() => {
                  setShowQuotationModal(false);
                  setQuotationEnquiry(null);
                }}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PurchaseEnquiriesTab;
