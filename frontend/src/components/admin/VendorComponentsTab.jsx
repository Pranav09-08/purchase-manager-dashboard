import { useState } from 'react';
import { approveVendorComponent, rejectVendorComponent } from '../../api/vendor/components.api';

// Vendor submitted components list with approval workflow
function VendorComponentsTab({ vendorProducts, onRefresh, getAuthHeaders })  {
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status) => {
    if (status === 'pending') return 'bg-amber-100 text-amber-700';
    if (status === 'approved') return 'bg-emerald-100 text-emerald-700';
    if (status === 'rejected') return 'bg-rose-100 text-rose-700';
    return 'bg-slate-100 text-slate-700';
  };

  const getStatusLabel = (status) => {
    if (status === 'pending') return 'Pending Review';
    if (status === 'approved') return 'Approved';
    if (status === 'rejected') return 'Rejected';
    return status || 'Unknown';
  };

  const handleApprove = async (componentId) => {
    if (!confirm('Approve this component for purchase?')) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await approveVendorComponent(token, componentId);
      alert('Component approved successfully!');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error approving component:', error);
      alert('Failed to approve component. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await rejectVendorComponent(token, showRejectModal, rejectionReason.trim());
      alert('Component rejected. Vendor will be notified.');
      setShowRejectModal(null);
      setRejectionReason('');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error rejecting component:', error);
      alert('Failed to reject component. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredComponents = vendorProducts.filter((component) => {
    if (statusFilter === 'all') return true;
    return component.status === statusFilter;
  });

  const pendingCount = vendorProducts.filter(c => c.status === 'pending').length;
  const approvedCount = vendorProducts.filter(c => c.status === 'approved').length;
  const rejectedCount = vendorProducts.filter(c => c.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Status Filters */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          All ({vendorProducts.length})
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            statusFilter === 'pending'
              ? 'bg-amber-600 text-white'
              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setStatusFilter('approved')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            statusFilter === 'approved'
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          }`}
        >
          Approved ({approvedCount})
        </button>
        <button
          onClick={() => setStatusFilter('rejected')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            statusFilter === 'rejected'
              ? 'bg-rose-600 text-white'
              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
          }`}
        >
          Rejected ({rejectedCount})
        </button>
      </div>

      {filteredComponents.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <div className="text-6xl mb-4">🧩</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {statusFilter === 'all' ? 'No Vendor Components Yet' : `No ${getStatusLabel(statusFilter)} Components`}
          </h3>
          <p className="text-slate-600">
            {statusFilter === 'all' 
              ? 'Vendor components will appear here once available.' 
              : `No components with status "${getStatusLabel(statusFilter)}"`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredComponents.map((component) => (
            <div key={component.componentid} className="data-card relative">
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span className={`data-pill ${getStatusColor(component.status)}`}>
                  {getStatusLabel(component.status)}
                </span>
              </div>

              <div className="flex items-start justify-between gap-3 pr-24">
                <div>
                  <h4 className="data-title">{component.component_name}</h4>
                  <p className="data-subtitle">
                    {component.vendorregistration?.contact_person || component.vendorregistration?.company_name || '—'}
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-600 mt-3">
                Company: {component.Company?.company_name || '—'}
              </p>

              {/* Rejection Reason */}
              {component.status === 'rejected' && component.rejection_reason && (
                <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                  <p className="text-xs font-semibold text-rose-900 mb-1">Rejection Reason:</p>
                  <p className="text-sm text-rose-700">{component.rejection_reason}</p>
                </div>
              )}

              {/* Submission Count */}
              {component.submission_count > 1 && (
                <p className="text-xs text-slate-500 mt-2">
                  Resubmitted {component.submission_count} times
                </p>
              )}

              <div className="data-grid">
                <div className="data-kv">
                  <span className="data-label">Stock</span>
                  <span className="data-value">{component.current_stock ?? component.stock_available ?? 0}</span>
                </div>
                <div className="data-kv">
                  <span className="data-label">Unit</span>
                  <span className="data-value">
                    {component.unit_of_measurement || component.measurement_unit || component.unit || '—'}
                  </span>
                </div>
                <div className="data-kv">
                  <span className="data-label">Base Price</span>
                  <span className="data-value">₹{component.price_per_unit || 0}</span>
                </div>
                <div className="data-kv">
                  <span className="data-label">Final Price</span>
                  <span className="data-value">
                    ₹{(
                      (Number(component.price_per_unit) || 0) *
                      (1 + ((Number(component.cgst) || 0) + (Number(component.sgst) || 0)) / 100)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons for Pending Components */}
              {component.status === 'pending' && (
                <div className="mt-4 flex gap-2">
                 <button
                    onClick={() => handleApprove(component.componentid)}
                    disabled={loading}
                    className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => {
                      setShowRejectModal(component.componentid);
                      setRejectionReason('');
                    }}
                    disabled={loading}
                    className="flex-1 bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-rose-700 transition disabled:opacity-50"
                  >
                    ✗ Reject
                  </button>
                </div>
              )}

              {/* View Details Button */}
              <button
                onClick={() => setSelectedComponent(component)}
                className="mt-3 w-full text-sm text-slate-600 hover:text-slate-900 font-medium transition"
              >
                View Details →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Reject Component</h3>
            <p className="text-sm text-slate-600 mb-4">
              Please provide a reason for rejecting this component. The vendor will see this message.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Price is too high for this specification, or Quality standards not met..."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm resize-none"
              rows={4}
              required
            />
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectionReason('');
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={loading || !rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition disabled:opacity-50"
              >
                {loading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Component Details Modal */}
      {selectedComponent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-xl shadow-2xl w-[90vw] h-[95vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 flex items-start justify-between border-b border-slate-200 bg-white px-5 py-3">
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-slate-900">{selectedComponent.component_name}</h3>
                <p className="text-base text-slate-500 mt-1">ID: {selectedComponent.componentid}</p>
              </div>
              <button
                onClick={() => setSelectedComponent(null)}
                className="text-slate-400 hover:text-slate-600 text-3xl leading-none ml-4"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-2">
              {/* Status */}
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-lg font-semibold ${getStatusColor(selectedComponent.status)}`}>
                  {getStatusLabel(selectedComponent.status)}
                </span>
              </div>

              {selectedComponent.status === 'rejected' && selectedComponent.rejection_reason && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                  <p className="text-base font-semibold text-rose-900 mb-1">Rejection Reason:</p>
                  <p className="text-base text-rose-700">{selectedComponent.rejection_reason}</p>
                </div>
              )}

              {/* Image Preview */}
              {selectedComponent.img && (
                <div className="py-1">
                  <p className="text-sm font-semibold text-slate-600 mb-1">Image</p>
                  <img src={selectedComponent.img} alt={selectedComponent.component_name} className="h-40 w-40 object-cover rounded-lg border border-slate-200" />
                </div>
              )}

              {/* Vendor & Company Info */}
              <div className="bg-slate-50 rounded-lg p-3 py-2">
                <h4 className="text-lg font-semibold text-slate-900 mb-2">Vendor Information</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Vendor ID</p>
                    <p className="text-base text-slate-900 font-medium">{selectedComponent.vendorid || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Vendor Company</p>
                    <p className="text-base text-slate-900 font-medium">{selectedComponent.vendorregistration?.company_name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Company ID</p>
                    <p className="text-base text-slate-900 font-medium">{selectedComponent.companyid || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Basic Details */}
              <div className="bg-blue-50 rounded-lg p-3 py-2">
                <h4 className="text-lg font-semibold text-slate-900 mb-2">Basic Details</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Item No</p>
                    <p className="text-base text-slate-900 font-medium">{selectedComponent.item_no || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Component Code</p>
                    <p className="text-base text-slate-900 font-medium">{selectedComponent.component_code || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Unit of Measurement</p>
                    <p className="text-base text-slate-900 font-medium">{selectedComponent.unit_of_measurement || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Size</p>
                    <p className="text-base text-slate-900 font-medium">{selectedComponent.size || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Color</p>
                    <p className="text-base text-slate-900 font-medium">{selectedComponent.color || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600">HSN Code</p>
                    <p className="text-base text-slate-900 font-medium">{selectedComponent.hsn_code || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Pricing & Tax */}
              <div className="bg-emerald-50 rounded-lg p-3 py-2">
                <h4 className="text-lg font-semibold text-slate-900 mb-2">Pricing & Tax Information</h4>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Price per Unit</p>
                    <p className="text-base font-bold text-emerald-700">₹{(selectedComponent.price_per_unit || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Discount %</p>
                    <p className="text-base font-medium text-slate-900">{(selectedComponent.discount_percent || 0).toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600">CGST %</p>
                    <p className="text-base font-medium text-slate-900">{(selectedComponent.cgst || 0).toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600">SGST %</p>
                    <p className="text-base font-medium text-slate-900">{(selectedComponent.sgst || 0).toFixed(2)}%</p>
                  </div>
                </div>
              </div>

              {/* Inventory & Orders */}
              <div className="bg-amber-50 rounded-lg p-3 py-2">
                <h4 className="text-lg font-semibold text-slate-900 mb-2">Inventory & Order Details</h4>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Stock Available</p>
                    <p className="text-base font-bold text-amber-700">{selectedComponent.stock_available ?? 0} units</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Min Order Qty</p>
                    <p className="text-base font-medium text-slate-900">{selectedComponent.minimum_order_quantity || 1} units</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Lead Time Days</p>
                    <p className="text-base font-medium text-slate-900">{selectedComponent.lead_time_days || 0} days</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Active Status</p>
                    <p className="text-sm">
                      <span className={`inline-block px-2 py-1 rounded text-base font-semibold ${selectedComponent.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                        {selectedComponent.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Descriptions */}
              {selectedComponent.description && (
                <div className="py-1">
                  <p className="text-sm font-semibold text-slate-600 mb-1">Description</p>
                  <p className="text-base text-slate-700 p-2 bg-slate-50 rounded-lg">{selectedComponent.description}</p>
                </div>
              )}

              {selectedComponent.specifications && (
                <div className="py-1">
                  <p className="text-sm font-semibold text-slate-600 mb-1">Specifications</p>
                  <p className="text-base text-slate-700 p-2 bg-slate-50 rounded-lg">{selectedComponent.specifications}</p>
                </div>
              )}

              {selectedComponent.minor_details && (
                <div className="py-1">
                  <p className="text-sm font-semibold text-slate-600 mb-1">Minor Details</p>
                  <p className="text-base text-slate-700 p-2 bg-slate-50 rounded-lg">{selectedComponent.minor_details}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="bg-slate-50 rounded-lg p-3 py-2">
                <h4 className="text-lg font-semibold text-slate-900 mb-2">System Information</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Created At</p>
                    <p className="text-base text-slate-700">{new Date(selectedComponent.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Updated At</p>
                    <p className="text-base text-slate-700">{new Date(selectedComponent.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedComponent.status === 'pending' && (
                <div className="flex gap-3 pt-3 border-t">
                  <button
                    onClick={() => {
                      handleApprove(selectedComponent.componentid);
                      setSelectedComponent(null);
                    }}
                    disabled={loading}
                    className="flex-1 bg-emerald-600 text-white px-4 py-3 rounded-lg font-bold text-lg hover:bg-emerald-700 transition disabled:opacity-50"
                  >
                    ✓ Approve Component
                  </button>
                  <button
                    onClick={() => {
                      setShowRejectModal(selectedComponent.componentid);
                      setSelectedComponent(null);
                    }}
                    disabled={loading}
                    className="flex-1 bg-rose-600 text-white px-4 py-3 rounded-lg font-bold text-lg hover:bg-rose-700 transition disabled:opacity-50"
                  >
                    ✗ Reject Component
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VendorComponentsTab;
