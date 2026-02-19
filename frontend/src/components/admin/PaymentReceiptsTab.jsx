// Payment receipts view for purchase manager
function PaymentReceiptsTab({ receipts = [], orderLookup = {}, vendorLookup = {} }) {
  const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
  const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');
  const isUrl = (value) => /^https?:\/\//i.test(value || '');

  return (
    <div className="section-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-extrabold text-slate-900">Payment Receipts</h3>
        <span className="text-xs font-semibold text-slate-500 uppercase">Total: {receipts.length}</span>
      </div>
      {receipts.length === 0 ? (
        <div className="text-center py-8 text-slate-600">No receipts received yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full min-w-[720px] text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr className="border-b border-slate-200">
                <th className="py-3 text-left font-semibold">Order</th>
                <th className="py-3 text-left font-semibold">Vendor</th>
                <th className="py-3 text-left font-semibold">Amount</th>
                <th className="py-3 text-left font-semibold">Paid On</th>
                <th className="py-3 text-left font-semibold">Reference</th>
                <th className="py-3 text-left font-semibold">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((payment) => (
                <tr key={payment.payment_id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 text-slate-900 font-semibold whitespace-nowrap">
                    {orderLookup[payment.order_id] || 'Order'}
                  </td>
                  <td className="py-3 text-slate-700 whitespace-nowrap">
                    {vendorLookup[payment.vendor_id] || 'Vendor'}
                  </td>
                  <td className="py-3 text-slate-700 whitespace-nowrap">{formatCurrency(payment.amount)}</td>
                  <td className="py-3 text-slate-600 whitespace-nowrap">{formatDate(payment.payment_date)}</td>
                  <td className="py-3 text-slate-600 whitespace-nowrap">{payment.reference_number || '—'}</td>
                  <td className="py-3 text-slate-700">
                    {payment.notes ? (
                      isUrl(payment.notes) ? (
                        <a
                          href={payment.notes}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-700 font-semibold underline"
                        >
                          View receipt
                        </a>
                      ) : (
                        <span className="font-semibold text-emerald-700">{payment.notes}</span>
                      )
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PaymentReceiptsTab;
