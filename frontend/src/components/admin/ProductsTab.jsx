// Read-only product list for purchase manager
function ProductsTab({ products, onSelectProduct, onViewVendors }) {
  return (
    <div className="space-y-6">
      {products.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <div className="text-5xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Products Found</h3>
          <p className="text-slate-600">Products will appear here once created.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.productId || product.productid} className="data-card flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="data-title break-words">{product.title}</h4>
                  <p className="data-subtitle break-words">{product.item_no ? `Item No: ${product.item_no}` : 'Company product'}</p>
                </div>
                <span className={`data-pill ${product.active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {product.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="data-grid">
                <div className="data-kv">
                  <span className="data-label">Item No</span>
                  <span className="data-value">{product.item_no || '—'}</span>
                </div>
                <div className="data-kv">
                  <span className="data-label">Size</span>
                  <span className="data-value">{product.size || '—'}</span>
                </div>
                <div className="data-kv">
                  <span className="data-label">Stock</span>
                  <span className="data-value">{product.stock ?? 0}</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onSelectProduct(product)}
                    className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800"
                  >
                    Components
                  </button>
                  <button
                    onClick={() => onViewVendors(product)}
                    className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50"
                  >
                    View Vendors
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductsTab;
