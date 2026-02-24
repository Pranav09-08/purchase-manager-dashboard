// Vendor product management (legacy page)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import vendorProductsApi from '../api/vendor/products.api';

function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [supplier, setSupplier] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    companyId: '',
    title: '',
    description: '',
    item_no: '',
    size: '',
    stock: 0,
    discount_percent: 0,
    cgst: 0,
    sgst: 0,
    delivery_terms: 0,
    delivery_time_range: '',
    active: true,
  });

  // Initial load
  useEffect(() => {
    const storedSupplier = localStorage.getItem('supplier');
    if (storedSupplier) {
      try {
        setSupplier(JSON.parse(storedSupplier));
      } catch (err) {
        setSupplier(null);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    if (supplier?.vendor_id) {
      setFormData((prev) => ({
        ...prev,
        companyId: supplier.vendor_id,
      }));
    }
  }, [supplier]);

  // Load vendor products
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await vendorProductsApi.list(token);
      setProducts(data.products || data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Controlled inputs for add form
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Submit new product
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await vendorProductsApi.create(token, formData);
      setSuccess('Product added successfully!');
      setShowAddModal(false);
      setFormData({
        companyId: '',
        title: '',
        description: '',
        item_no: '',
        size: '',
        stock: 0,
        discount_percent: 0,
        cgst: 0,
        sgst: 0,
        delivery_terms: 0,
        delivery_time_range: '',
        active: true,
      });
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  // Clear vendor session
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('supplier');
    navigate('/vendor/login');
  };

  if (loading) {
    return (
      <div className="products-page">
        <div className="loading">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-header">
        <div className="header-content">
          <h1>Product Management</h1>
          <p>Manage your products and inventory</p>
        </div>
        <div className="header-actions">
          <button onClick={() => navigate('/vendor/dashboard')} className="btn-secondary">
            📊 Dashboard
          </button>
          <button onClick={handleLogout} className="btn-logout">
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="products-container">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="section">
          <div className="section-header">
            <div>
              <h2>🛍️ Your Products</h2>
              <p className="section-description">Manage and view your product inventory</p>
            </div>
            <button className="btn-add-product" onClick={() => setShowAddModal(true)}>
              <span className="btn-icon">+</span>
              Add Product
            </button>
          </div>
          {products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No Products Yet</h3>
              <p>Select a category above to add your first product.</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <div key={product.productId} className="product-card">
                  <div className="product-header">
                    <h3>{product.title}</h3>
                    <span className={`category-badge ${product.active ? 'active' : 'inactive'}`}>
                      {product.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="product-details">
                    <p className="description">{product.description}</p>
                    <div className="detail-row">
                      <span className="label">Item No:</span>
                      <span className="value">{product.item_no}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Size:</span>
                      <span className="value">{product.size}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Stock:</span>
                      <span className="value">{product.stock}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Discount:</span>
                      <span className="value">{product.discount_percent}%</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">CGST:</span>
                      <span className="value">{product.cgst}%</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">SGST:</span>
                      <span className="value">{product.sgst}%</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Delivery Terms:</span>
                      <span className="value">{product.delivery_terms} days</span>
                    </div>
                    {product.delivery_time_range && (
                      <div className="detail-row">
                        <span className="label">Delivery Range:</span>
                        <span className="value">{product.delivery_time_range}</span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="label">Created:</span>
                      <span className="value">{product.created_at ? new Date(product.created_at).toLocaleDateString() : '—'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Updated:</span>
                      <span className="value">{product.upated_at ? new Date(product.upated_at).toLocaleDateString() : '—'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Add New Product</h2>
                <p className="modal-subtitle">Create a company product</p>
              </div>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="product-form">
              <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Active</label>
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Product Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter product title"
                />
              </div>

              <div className="form-group">
                <label>Product Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  placeholder="Enter product description"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Item Number *</label>
                  <input
                    type="text"
                    name="item_no"
                    value={formData.item_no}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., ITM-001"
                  />
                </div>

                <div className="form-group">
                  <label>Size *</label>
                  <input
                    type="text"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 10mm, Large"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    min="0"
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label>Delivery Terms (days)</label>
                  <input
                    type="number"
                    name="delivery_terms"
                    value={formData.delivery_terms}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Discount (%)</label>
                  <input
                    type="number"
                    name="discount_percent"
                    value={formData.discount_percent}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label>Delivery Time Range</label>
                  <input
                    type="text"
                    name="delivery_time_range"
                    value={formData.delivery_time_range}
                    onChange={handleInputChange}
                    placeholder="e.g., 2-4 days"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>CGST (%)</label>
                  <input
                    type="number"
                    name="cgst"
                    value={formData.cgst}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label>SGST (%)</label>
                  <input
                    type="number"
                    name="sgst"
                    value={formData.sgst}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0.00"
                  />
                </div>
              </div>

              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  ✓ Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
  );
}

export default Products;
