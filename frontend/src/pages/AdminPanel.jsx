// Handler for cancelling Enquiry edit
const handleCancelEnquiryEdit = () => {
  setEditingEnquiryId(null);
  setEnquiryForm({
    companyId: '',
    vendorId: '',
    title: '',
    description: '',
    requiredDeliveryDate: '',
    source: 'emergency',
    planningRequestId: '',
  });
  setEnquiryItems([]);
};
// Handler for editing Enquiry
const handleEditEnquiry = (enquiry) => {
  setEditingEnquiryId(enquiry.enquiry_id || enquiry.id || '');
  setEnquiryForm({
    companyId: enquiry.company_id || '',
    vendorId: enquiry.vendor_id || '',
    title: enquiry.title || '',
    description: enquiry.description || '',
    requiredDeliveryDate: enquiry.required_delivery_date || '',
    source: enquiry.source || 'emergency',
    planningRequestId: enquiry.planning_request_id || '',
  });
  setEnquiryItems(enquiry.items || []);
};
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import {
  listRegistrations,
  approveRegistration,
  rejectRegistration,
  updateCertificateStatus
} from '../api/admin/registrations.api';
import adminProductsApi from '../api/admin/products.api';
import {
  listRequiredComponents,
  createRequiredComponent,
  updateRequiredComponent,
  deleteRequiredComponent
} from '../api/admin/requiredComponents.api';
import {
  listEnquiries,
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  rejectEnquiry
} from '../api/admin/enquiries.api';
import {
  listQuotations,
  createQuotation,
  updateQuotation,
  acceptQuotation,
  negotiateQuotation
} from '../api/admin/quotations.api';
import {
  listCounterQuotations,
  acceptCounterQuotation,
  rejectCounterQuotation
} from '../api/admin/counterQuotations.api';
import {
  listLois,
  createLoi,
  updateLoi,
  resubmitLoi
} from '../api/admin/lois.api';
import {
  listOrders,
  createOrder
} from '../api/admin/orders.api';
import {
  listPayments,
  createPayment,
  completePayment,
  failPayment
} from '../api/admin/payments.api';
import {
  listInvoices,
  invoiceAction
} from '../api/admin/invoices.api';
import { listRequests } from '../api/admin/requests.api';
import { getAnalytics } from '../api/admin/analytics.api';
import { activateComponent } from '../api/admin/components.api';
import {
  listClients,
  createClient,
  getClientById,
  updateClient,
  updateClientStatus
} from '../api/admin/clients.api';
import { useAuth } from '../contexts/AuthContext';
import OverviewTab from '../components/admin/OverviewTab';
import ProductsTab from '../components/admin/ProductsTab';
import ComponentsTab from '../components/admin/ComponentsTab';
import RequiredComponentsTab from '../components/admin/RequiredComponentsTab';
import RegistrationsTab from '../components/admin/RegistrationsTab';
import VendorComponentsTab from '../components/admin/VendorComponentsTab';
import PurchaseEnquiriesTab from '../components/admin/PurchaseEnquiriesTab';
import PurchaseQuotationsTab from '../components/admin/PurchaseQuotationsTab';
import PurchaseLoisTab from '../components/admin/PurchaseLoisTab';
import PurchaseOrdersTab from '../components/admin/PurchaseOrdersTab';
import PurchasePaymentsTab from '../components/admin/PurchasePaymentsTab';
import PaymentReceiptsTab from '../components/admin/PaymentReceiptsTab';
import VendorInvoicesTab from '../components/admin/VendorInvoicesTab';
import AnalyticsTab from '../components/admin/AnalyticsTab';
import PurchaseRequestsTab from '../components/admin/PurchaseRequestsTab';
import RegistrationDetailsModal from '../components/admin/RegistrationDetailsModal';
import RejectModal from '../components/admin/RejectModal';
import FloatingNotice from '../components/FloatingNotice';

function AdminPanel() {
  const navigate = useNavigate();
  const { currentUser, idToken, getIdToken, loading: authLoading } = useAuth();
  // Core session/user state
  const [adminUser, setAdminUser] = useState(null);
  // Navigation state for sidebar tabs
  const [currentPage, setCurrentPage] = useState('overview');
  // Data collections
  const [registrations, setRegistrations] = useState([]);
  const [vendorProducts, setVendorProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [components, setComponents] = useState([]);
  const [autoSelectFirstComponent, setAutoSelectFirstComponent] = useState(false);
  const [requiredRequests, setRequiredRequests] = useState([]);
  const [purchaseEnquiries, setPurchaseEnquiries] = useState([]);
  const [purchaseQuotations, setPurchaseQuotations] = useState([]);
  const [counterQuotations, setCounterQuotations] = useState([]);
  const [purchaseLois, setPurchaseLois] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [purchasePayments, setPurchasePayments] = useState([]);
  const [vendorInvoices, setVendorInvoices] = useState([]);
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  // Selection and modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  // UI feedback state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // Registration review state
  const [filter, setFilter] = useState('pending');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  // Required components form state
  const [requestForm, setRequestForm] = useState({
    name: '',
    description: '',
  });
  const [editingRequiredId, setEditingRequiredId] = useState(null);
  const [enquiryForm, setEnquiryForm] = useState({
    companyId: '',
    vendorId: '',
    title: '',
    description: '',
    requiredDeliveryDate: '',
    source: 'emergency',
    planningRequestId: '',
  });
  const [enquiryItems, setEnquiryItems] = useState([]);
  const [editingEnquiryId, setEditingEnquiryId] = useState(null);
  const [quotationForm, setQuotationForm] = useState({
    enquiryId: '',
    vendorId: '',
    validTill: '',
    expectedDeliveryDate: '',
    advancePaymentPercent: 0,
    notes: '',
  });
  const [quotationItems, setQuotationItems] = useState([]);
  const [loiForm, setLoiForm] = useState({
    quotationId: '',
    counterQuotationId: '',
    totalAmount: '',
    advancePaymentPercent: 0,
    expectedDeliveryDate: '',
    termsAndConditions: '',
  });
  const [editingLoiId, setEditingLoiId] = useState(null);
  const [orderForm, setOrderForm] = useState({
    loiId: '',
    expectedDeliveryDate: '',
    termsAndConditions: '',
  });
  const [orderItems, setOrderItems] = useState([]);
  const [paymentForm, setPaymentForm] = useState({
    orderId: '',
    phase: '',
    amount: '',
    paymentMode: '',
    dueDate: '',
  });
  const [focusQuotationId, setFocusQuotationId] = useState('');
  const [focusCounterId, setFocusCounterId] = useState('');
  const [focusLoiId, setFocusLoiId] = useState('');
  const [focusOrderId, setFocusOrderId] = useState('');
  const [prefillOrderId, setPrefillOrderId] = useState('');
  // Overview cards stats
  const [overviewStats, setOverviewStats] = useState({
    totalSuppliers: 0,
    approvedSuppliers: 0,
    pendingSuppliers: 0,
    rejectedSuppliers: 0,
    totalVendorProducts: 0,
    recentRegistrations: []
  });

  const isValidDateInput = (value) => (!value || !Number.isNaN(new Date(value).getTime()));

  useEffect(() => {
    // Wait for Firebase auth to initialize
    if (authLoading) {
      console.log('⏳ Waiting for Firebase auth to initialize...');
      return;
    }

    // Firebase auth state guard
    console.log('🔍 AdminPanel mounted - checking Firebase auth:');
    console.log('  currentUser:', !!currentUser);
    console.log('  idToken exists:', !!idToken);

    if (!currentUser) {
      console.error('❌ No Firebase user - redirecting to login');
      navigate('/admin/login');
      return;
    }

    // Wait for idToken to be available before fetching data
    if (!idToken) {
      console.log('⏳ Waiting for Firebase ID token...');
      return;
    }

    // Load admin user data from localStorage (set during login)
    const userData = localStorage.getItem('adminUser');
    if (userData) {
      try {
        setAdminUser(JSON.parse(userData));
      } catch (err) {
        console.error('❌ Failed to parse adminUser:', err);
      }
    }

    // Initial data load
    console.log('📲 Starting data fetches...');
    fetchRegistrations();
    fetchVendorProducts();
    fetchProducts();
    fetchRequiredRequests();
    fetchPurchaseEnquiries();
    fetchPurchaseQuotations();
    fetchCounterQuotations();
    fetchPurchaseLois();
    fetchPurchaseOrders();
    fetchPurchasePayments();
    fetchVendorInvoices();
    fetchPurchaseRequests();
    fetchAnalytics();
    setLoading(false);
  }, [currentUser, authLoading, idToken, navigate]);

  useEffect(() => {
    // Keep overview stats up to date
    if (!loading) {
      fetchOverviewStats();
    }
  }, [registrations, vendorProducts, loading]);

  useEffect(() => {
    // Refetch when filter changes
    fetchRegistrations();
  }, [filter]);

  useEffect(() => {
    // DashboardLayout navigation event bridge
    const handlePageChange = (e) => {
      setCurrentPage(e.detail.page);
    };

    window.addEventListener('dashboardPageChange', handlePageChange);
    return () => window.removeEventListener('dashboardPageChange', handlePageChange);
  }, []);

  useEffect(() => {
    if (currentPage !== 'purchase-payments' && currentPage !== 'payment-receipts') return;
    const receiptIds = purchasePayments
      .filter((payment) => payment.status === 'receipt_sent')
      .map((payment) => String(payment.payment_id));
    const seenIds = JSON.parse(localStorage.getItem('seenPaymentReceipts') || '[]');
    const updated = Array.from(new Set([...seenIds, ...receiptIds]));
    localStorage.setItem('seenPaymentReceipts', JSON.stringify(updated));
  }, [currentPage, purchasePayments]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const token = idToken || (await getIdToken());
      const data = await listRegistrations(token, filter);
      setRegistrations(data || []);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorProducts = async () => {
    try {
      const token = idToken || (await getIdToken());
      // Fetch vendor components using the correct API
      const { listVendorComponents } = await import('../api/vendor/components.api');
      const data = await listVendorComponents(token);
      setVendorProducts(Array.isArray(data?.products) ? data.products : []);
    } catch (err) {
      console.error('Error fetching vendor components:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = idToken || (await getIdToken());
      const data = await adminProductsApi.list(token);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchRequiredRequests = async () => {
    try {
      const token = idToken || (await getIdToken());
      const data = await listRequiredComponents(token);
      setRequiredRequests(data.components || []);
    } catch (err) {
      console.error('Error fetching required components:', err);
    }
  };

  // Build auth headers using Firebase ID token
  const getAuthHeaders = async () => {
    let token = idToken;
    if (!token) {
      token = await getIdToken();
    }
    if (token && typeof token === 'string' && token.length > 0) {
      return { Authorization: `Bearer ${token}` };
    }
    // If token is missing or invalid, auto-redirect to login
    navigate('/admin/login');
    return {};
  };

  const fetchPurchaseEnquiries = async () => {
    try {
      const token = idToken || (await getIdToken());
      const data = await listEnquiries(token);
      setPurchaseEnquiries(data.enquiries || []);
    } catch (err) {
      console.error('Error fetching enquiries:', err);
    }
  };

  const fetchPurchaseQuotations = async () => {
    try {
      const token = idToken || (await getIdToken());
      const data = await listQuotations(token);
      setPurchaseQuotations(data.quotations || []);
    } catch (err) {
      console.error('Error fetching quotations:', err);
    }
  };

  const fetchCounterQuotations = async () => {
    try {
      const token = idToken || (await getIdToken());
      const data = await listCounterQuotations(token);
      setCounterQuotations(data.counters || []);
    } catch (err) {
      console.error('Error fetching counter quotations:', err);
    }
  };

  const fetchPurchaseLois = async () => {
    try {
      const token = idToken || (await getIdToken());
      const data = await listLois(token);
      setPurchaseLois(data.lois || []);
    } catch (err) {
      console.error('Error fetching LOIs:', err);
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      const token = idToken || (await getIdToken());
      const data = await listOrders(token);
      setPurchaseOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const fetchPurchasePayments = async () => {
    try {
      const token = idToken || (await getIdToken());
      const data = await listPayments(token);
      setPurchasePayments(data.payments || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
    }
  };

  const fetchVendorInvoices = async () => {
    try {
      const token = idToken || (await getIdToken());
      const data = await listInvoices(token);
      setVendorInvoices(data.invoices || []);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
  };

  const fetchPurchaseRequests = async () => {
    try {
      const token = idToken || (await getIdToken());
      const data = await listRequests(token);
      setPurchaseRequests(data || []);
    } catch (err) {
      console.error('Error fetching planning requests:', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = idToken || (await getIdToken());
      const data = await getAnalytics(token);
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  const fetchComponents = async (productId) => {
    // Load components for a specific product
    if (!productId) return;
    try {
      const token = idToken || (await getIdToken());
      // Assuming adminProductsApi.getById returns product details including components
      const productData = await adminProductsApi.getById(token, productId);
      setComponents(productData.components || []);
    } catch (err) {
      console.error('Error fetching components:', err);
    }
  };

  const handleActivateComponent = async (component) => {
    const componentId = component?.componentId || component?.componentid;
    if (!componentId) return;
    try {
      const token = idToken || (await getIdToken());
      const data = await activateComponent(token, componentId);
      setSuccess('Component activated');
      setTimeout(() => setSuccess(''), 3000);
      if (selectedProduct?.productId || selectedProduct?.productid) {
        fetchComponents(selectedProduct.productId || selectedProduct.productid);
      }
    } catch (err) {
      setError(err.message || 'Failed to activate component');
      setTimeout(() => setError(''), 3000);
    }
  };

  const fetchOverviewStats = async () => {
    // Compute stats for overview cards
    try {
      // Fetch all registrations to calculate stats
      const token = localStorage.getItem('token');
      const allRegistrations = await listRegistrations(token);
      if (!Array.isArray(allRegistrations)) {
        console.error('Error fetching overview stats:', allRegistrations?.error || allRegistrations);
        return;
      }
      const approved = allRegistrations.filter(r => r.status === 'approved').length;
      const pending = allRegistrations.filter(r => r.status === 'pending').length;
      const rejected = allRegistrations.filter(r => r.status === 'rejected').length;
      // Get recent registrations (last 5)
      const recent = allRegistrations
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      setOverviewStats(prev => ({
        ...prev,
        totalSuppliers: allRegistrations.length,
        approvedSuppliers: approved,
        pendingSuppliers: pending,
        rejectedSuppliers: rejected,
        totalVendorProducts: vendorProducts.length,
        recentRegistrations: recent
      }));
    } catch (err) {
      console.error('Error fetching overview stats:', err);
    }
  };

  const handleSelectProduct = (product) => {
    // Select product and jump to components view
    setSelectedProduct(product);
    fetchComponents(product.productId);
    setCurrentPage('components');
  };

  const handleApprove = async (supplierId) => {
    // Approve a supplier registration
    if (window.confirm('Are you sure you want to approve this registration?')) {
      try {
        const token = idToken || (await getIdToken());
        const data = await approveRegistration(token, supplierId);
        if (data.error) {
          setError(data.error || 'Failed to approve registration');
          return;
        }
        setRegistrations((prev) =>
          prev.map((reg) =>
            (reg.vendor_id || reg.supplier_id) === supplierId
              ? { ...reg, status: 'approved', approved_at: new Date().toISOString() }
              : reg
          )
        );
        setSuccess('Registration approved successfully');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.message || 'An error occurred');
      }
    }
  };

  const handleReject = async () => {
    // Reject a supplier registration
    if (!selectedRegistration) return;

    try {
      const token = idToken || (await getIdToken());
      const supplierId = selectedRegistration.vendor_id || selectedRegistration.supplier_id;
      const data = await rejectRegistration(token, supplierId, rejectReason);
      if (data.error) {
        setError(data.error || 'Failed to reject registration');
        return;
      }

      setRegistrations((prev) =>
        prev.map((reg) =>
          (reg.vendor_id || reg.supplier_id) === (selectedRegistration.vendor_id || selectedRegistration.supplier_id)
            ? { ...reg, status: 'rejected' }
            : reg
        )
      );
      setSuccess('Registration rejected successfully');
      setTimeout(() => setSuccess(''), 3000);
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedRegistration(null);
    } catch (err) {
      setError(err.message || 'An error occurred');
    }
  };

  const handleUpdateCertificateStatus = async (supplierId, status) => {
    if (!supplierId) return;
    try {
      const token = idToken || (await getIdToken());
      const data = await updateCertificateStatus(token, supplierId, status);
      if (data.error) {
        setError(data.error || 'Failed to update certificate status');
        return;
      }
      setRegistrations((prev) =>
        prev.map((reg) =>
          (reg.vendor_id || reg.supplier_id) === supplierId
            ? { ...reg, certificate_status: data.data?.certificate_status }
            : reg
        )
      );
      if (selectedRegistration && (selectedRegistration.vendor_id === supplierId || selectedRegistration.supplier_id === supplierId)) {
        setSelectedRegistration((prev) => ({
          ...prev,
          certificate_status: data.data?.certificate_status,
        }));
      }
      setSuccess('Certificate status updated');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'An error occurred');
    }
  };

  const getPageInfo = () => {
    // Map tab to header title/description
    switch (currentPage) {
      case 'overview':
        return { title: 'Dashboard Overview', description: 'Monitor system activity and manage supplier ecosystem' };
      case 'products':
        return { title: 'Company Products', description: 'Read-only list of products for your company' };
      case 'components':
        return { title: 'Product Components', description: 'Manage components for selected product' };
      case 'required-components':
        return { title: 'Add Components', description: 'Create components visible to all vendors' };
      case 'purchase-enquiries':
        return { title: 'Purchase Enquiries', description: 'Create and track RFQs' };
      case 'purchase-quotations':
        return { title: 'Purchase Quotations', description: 'Send quotations to vendors' };
      case 'purchase-lois':
        return { title: 'Purchase LOIs', description: 'Issue letters of intent' };
      case 'purchase-orders':
        return { title: 'Purchase Orders', description: 'Create and manage orders' };
      case 'purchase-payments':
        return { title: 'Purchase Payments', description: 'Track payments' };
      case 'payment-receipts':
        return { title: 'Payment Receipts', description: 'Review submitted payment receipts' };
      case 'vendor-invoices':
        return { title: 'Vendor Invoices', description: 'Review vendor invoices' };
      case 'purchase-requests':
        return { title: 'Purchase Requests', description: 'Planning manager requests for procurement' };
      case 'analytics':
        return { title: 'Analytics', description: 'Procurement insights and KPIs' };
      case 'registrations':
        return { title: 'Supplier Registrations', description: 'Review and manage supplier registration requests' };
      case 'vendor-products':
        return { title: 'Vendor Components', description: 'View components provided by vendors' };
      default:
        return { title: 'Dashboard', description: 'Purchase Manager Dashboard' };
    }
  };

  const handleRequestInputChange = (e) => {
    // Controlled form fields for required components
    const { name, value } = e.target;
    setRequestForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEnquiryInputChange = (e) => {
    const { name, value } = e.target;
    setEnquiryForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'vendorId') {
      setEnquiryItems([]);
    }
  };

  const handleAddEnquiryItem = (component) => {
    const componentId = component?.componentid || component?.id;
    const componentVendorId = component?.vendorid || component?.vendor_id;
    if (!componentId) return;
    if (componentVendorId && enquiryForm.vendorId && componentVendorId !== enquiryForm.vendorId) {
      setError('Selected component belongs to a different vendor. Please create a separate enquiry.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (componentVendorId && !enquiryForm.vendorId) {
      setEnquiryForm((prev) => ({
        ...prev,
        vendorId: componentVendorId,
      }));
    }
    setEnquiryItems((prev) => {
      if (prev.some((item) => item.componentId === componentId)) return prev;
      return [
        ...prev,
        {
          componentId,
          name: component.component_name || component.name,
          quantity: 1,
          unit: component.unit_of_measurement || component.measurement_unit || component.measurementUnit || '',
          specifications: component.specifications || '',
        },
      ];
    });
  };

  const handleRemoveEnquiryItem = (componentId) => {
    setEnquiryItems((prev) => prev.filter((item) => item.componentId !== componentId));
  };

  const handleEnquiryItemChange = (componentId, field, value) => {
    setEnquiryItems((prev) =>
      prev.map((item) =>
        item.componentId === componentId
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  const handleQuotationInputChange = (e) => {
    const { name, value } = e.target;
    setQuotationForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddQuotationItem = () => {
    setQuotationItems((prev) => ([
      ...prev,
      {
        componentId: '',
        quantity: 1,
        unitPrice: 0,
        discountPercent: 0,
        cgstPercent: 0,
        sgstPercent: 0,
        lineTotal: 0,
      },
    ]));
  };

  const handleRemoveQuotationItem = (index) => {
    setQuotationItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuotationItemChange = (index, field, value) => {
    setQuotationItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const next = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          const qty = Number(field === 'quantity' ? value : next.quantity) || 0;
          const price = Number(field === 'unitPrice' ? value : next.unitPrice) || 0;
          next.lineTotal = qty * price;
        }
        return next;
      })
    );
  };

  const handleLoiInputChange = (e) => {
    const { name, value } = e.target;
    setLoiForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOrderInputChange = (e) => {
    const { name, value } = e.target;
    setOrderForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddOrderItem = () => {
    setOrderItems((prev) => ([
      ...prev,
      {
        componentId: '',
        quantity: 1,
        unitPrice: 0,
        discountPercent: 0,
        cgstPercent: 0,
        sgstPercent: 0,
        lineTotal: 0,
      },
    ]));
  };

  const handleRemoveOrderItem = (index) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOrderItemChange = (index, field, value) => {
    setOrderItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const next = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          const qty = Number(field === 'quantity' ? value : next.quantity) || 0;
          const price = Number(field === 'unitPrice' ? value : next.unitPrice) || 0;
          next.lineTotal = qty * price;
        }
        return next;
      })
    );
  };

  const handlePaymentInputChange = async (e) => {
    const { name, value } = e.target;
    setPaymentForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-populate amount when orderId or phase changes
    if ((name === 'orderId' || name === 'phase') && value) {
      const orderId = name === 'orderId' ? value : paymentForm.orderId;
      const phase = name === 'phase' ? value : paymentForm.phase;

      if (orderId && phase) {
        try {
          const token = idToken || (await getIdToken());
          // You may need to add a new API function for payment summary if not present
          const { data } = await apiClient.get(`/api/purchase/payment/order/${orderId}/summary`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (data && data.summary) {
            const { remaining, advancePayment, orderAmount } = data.summary;
            const advanceExpected = advancePayment?.expected || 0;

            let suggestedAmount = 0;
            if (phase === 'advance') {
              suggestedAmount = advanceExpected;
            } else if (phase === 'final') {
              suggestedAmount = remaining > 0 ? remaining : 0;
            }

            setPaymentForm((prev) => ({
              ...prev,
              amount: suggestedAmount.toFixed(2),
            }));
          }
        } catch (err) {
          console.error('Error fetching payment summary:', err);
        }
      }
    }
  };

  const handleCreateRequiredComponent = async (e) => {
    // Create or update a required component
    e.preventDefault();
    if (!requestForm.name) {
      setError('Component name is required');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const payload = {
        name: requestForm.name,
        description: requestForm.description,
      };
      const token = idToken || (await getIdToken());
      let data;
      if (editingRequiredId) {
        data = await updateRequiredComponent(token, editingRequiredId, payload);
      } else {
        data = await createRequiredComponent(token, payload);
      }
      if (data.error) {
        setError(data.error || 'Failed to create required component');
        setTimeout(() => setError(''), 3000);
        return;
      }
      setSuccess(editingRequiredId ? 'Component updated successfully!' : 'Component added successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setRequestForm({ name: '', description: '' });
      setEditingRequiredId(null);
      fetchRequiredRequests();
    } catch (err) {
      setError(err.message || 'Failed to create required component');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteRequiredComponent = async (requestId) => {
    // Delete a required component
    const confirmed = window.confirm('Delete this required component?');
    if (!confirmed) return;

    try {
      const token = idToken || (await getIdToken());
      const data = await deleteRequiredComponent(token, requestId);
      if (data.error) throw new Error(data.error || 'Failed to delete required component');
      setSuccess('Component deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchRequiredRequests();
    } catch (err) {
      setError(err.message || 'Failed to delete required component');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    try {
      const confirmed = window.confirm(editingEnquiryId ? 'Update this enquiry?' : 'Submit this enquiry?');
      if (!confirmed) return;
      if (!isValidDateInput(enquiryForm.requiredDeliveryDate)) {
        throw new Error('Enter a valid required delivery date');
      }
      if (enquiryItems.length === 0) {
        throw new Error('Please select at least one component');
      }
      const payload = {
        companyId: enquiryForm.companyId || null,
        vendorId: enquiryForm.vendorId,
        title: enquiryForm.title,
        description: enquiryForm.description,
        requiredDeliveryDate: enquiryForm.requiredDeliveryDate || null,
        source: enquiryForm.source || 'emergency',
        planningRequestId: enquiryForm.planningRequestId || null,
        items: enquiryItems.map((item) => ({
          componentId: item.componentId,
          quantity: Number(item.quantity) || 1,
          unit: item.unit || null,
          specifications: item.specifications || null,
        })),
      };
      const token = idToken || (await getIdToken());
      let data;
      if (editingEnquiryId) {
        // Update existing enquiry
        const { updateEnquiry } = await import('../api/admin/enquiries.api');
        data = await updateEnquiry(token, editingEnquiryId, payload);
      } else {
        // Create new enquiry
        const { createEnquiry } = await import('../api/admin/enquiries.api');
        data = await createEnquiry(token, payload);
      }
      setSuccess(editingEnquiryId ? 'Enquiry updated successfully' : 'Enquiry created successfully');
      setTimeout(() => setSuccess(''), 3000);
      setEnquiryForm({ companyId: '', vendorId: '', title: '', description: '', requiredDeliveryDate: '', source: 'emergency', planningRequestId: '' });
      setEnquiryItems([]);
      setEditingEnquiryId(null);
      fetchPurchaseEnquiries();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleQuotationSubmit = async (e) => {
    e.preventDefault();
    try {
      const confirmed = window.confirm('Submit this quotation?');
      if (!confirmed) return;
      if (!isValidDateInput(quotationForm.validTill) || !isValidDateInput(quotationForm.expectedDeliveryDate)) {
        throw new Error('Enter valid dates for valid till and expected delivery');
      }
      if (quotationItems.length === 0) {
        throw new Error('Add at least one quotation item');
      }
      const advancePercent = Number(quotationForm.advancePaymentPercent) || 0;
      if (advancePercent < 0 || advancePercent > 100) {
        throw new Error('Advance payment percent must be between 0 and 100');
      }
      const payload = {
        enquiryId: quotationForm.enquiryId,
        vendorId: quotationForm.vendorId,
        validTill: quotationForm.validTill || null,
        expectedDeliveryDate: quotationForm.expectedDeliveryDate || null,
        advancePaymentPercent: advancePercent,
        notes: quotationForm.notes || null,
        items: quotationItems.map((item) => ({
          componentId: item.componentId,
          quantity: Number(item.quantity) || 0,
          unitPrice: Number(item.unitPrice) || 0,
          discountPercent: Number(item.discountPercent) || 0,
          cgstPercent: Number(item.cgstPercent) || 0,
          sgstPercent: Number(item.sgstPercent) || 0,
          lineTotal: Number(item.lineTotal) || 0,
        })),
      };
      const token = idToken || (await getIdToken());
      const { createQuotation } = await import('../api/admin/quotations.api');
      await createQuotation(token, payload);
      setSuccess('Quotation created successfully');
      setTimeout(() => setSuccess(''), 3000);
      setQuotationForm({ enquiryId: '', vendorId: '', validTill: '', expectedDeliveryDate: '', advancePaymentPercent: 0, notes: '' });
      setQuotationItems([]);
      fetchPurchaseQuotations();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleLoiSubmit = async (e) => {
    e.preventDefault();
    try {
      const confirmed = window.confirm(editingLoiId ? 'Update this LOI?' : 'Submit this LOI?');
      if (!confirmed) return;
      if (!isValidDateInput(loiForm.expectedDeliveryDate)) {
        throw new Error('Enter a valid expected delivery date');
      }
      const advancePercent = Number(loiForm.advancePaymentPercent) || 0;
      if (advancePercent < 0 || advancePercent > 100) {
        throw new Error('Advance payment percent must be between 0 and 100');
      }
      const payload = {
        quotationId: loiForm.quotationId,
        counterQuotationId: loiForm.counterQuotationId || null,
        totalAmount: Number(loiForm.totalAmount),
        advancePaymentPercent: advancePercent,
        expectedDeliveryDate: loiForm.expectedDeliveryDate || null,
        termsAndConditions: loiForm.termsAndConditions || null,
      };
      const token = idToken || (await getIdToken());
      let data;
      if (editingLoiId) {
        const { updateLoi } = await import('../api/admin/lois.api');
        data = await updateLoi(token, editingLoiId, payload);
      } else {
        const { createLoi } = await import('../api/admin/lois.api');
        data = await createLoi(token, payload);
      }
      setSuccess(editingLoiId ? 'LOI updated successfully' : 'LOI created successfully');
      setTimeout(() => setSuccess(''), 3000);
      setLoiForm({ quotationId: '', counterQuotationId: '', totalAmount: '', advancePaymentPercent: 0, expectedDeliveryDate: '', termsAndConditions: '' });
      setEditingLoiId(null);
      fetchPurchaseLois();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleResubmitLoi = async (loiId) => {
    if (!loiId) return;
    if (!window.confirm('Resubmit this LOI to the vendor?')) return;
    try {
      const response = await fetch(apiUrl(`/api/purchase/loi/${loiId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify({ status: 'sent' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to resubmit LOI');
      setSuccess('LOI resubmitted');
      setTimeout(() => setSuccess(''), 3000);
      fetchPurchaseLois();
    } catch (err) {
      setError(err.message || 'Failed to resubmit LOI');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleAcceptCounterQuotation = async (counterId) => {
    try {
      const confirmed = window.confirm('Accept this counter quotation?');
      if (!confirmed) return;
      const response = await fetch(apiUrl(`/api/vendor/counter-quotation/${counterId}/accept`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to accept counter quotation');
      setSuccess('Counter quotation accepted');
      setTimeout(() => setSuccess(''), 3000);
      fetchCounterQuotations();
      fetchPurchaseQuotations();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRejectCounterQuotation = async (counterId) => {
    try {
      const confirmed = window.confirm('Reject this counter quotation?');
      if (!confirmed) return;
      const response = await fetch(apiUrl(`/api/vendor/counter-quotation/${counterId}/reject`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to reject counter quotation');
      setSuccess('Counter quotation rejected');
      setTimeout(() => setSuccess(''), 3000);
      fetchCounterQuotations();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleAcceptQuotation = async (quotationId) => {
    try {
      const confirmed = window.confirm('Accept this quotation?');
      if (!confirmed) return;
      const token = idToken || (await getIdToken());
      const data = await acceptQuotation(token, quotationId);
      if (data.error) throw new Error(data.error || 'Failed to accept quotation');
      setSuccess('Quotation accepted');
      setTimeout(() => setSuccess(''), 3000);
      fetchPurchaseQuotations();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRequestNegotiation = async (quotationId) => {
    try {
      const confirmed = window.confirm('Request negotiation for this quotation?');
      if (!confirmed) return;
      const notes = window.prompt('Enter negotiation notes (optional):') || null;
      const token = idToken || (await getIdToken());
      const data = await negotiateQuotation(token, quotationId, notes);
      if (data.error) throw new Error(data.error || 'Failed to request negotiation');
      setSuccess('Negotiation requested');
      setTimeout(() => setSuccess(''), 3000);
      fetchPurchaseQuotations();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSelectQuotationForLoi = (quotationId) => {
    const quotation = purchaseQuotations.find((item) => item.quotation_id === quotationId);
    if (!quotation) return;
    setLoiForm((prev) => ({
      ...prev,
      quotationId,
      counterQuotationId: '',
      totalAmount: quotation.total_amount || prev.totalAmount,
      advancePaymentPercent: quotation.advance_payment_percent || 0,
      expectedDeliveryDate: quotation.expected_delivery_date || prev.expectedDeliveryDate,
    }));
  };

  const handleSelectCounterForLoi = (counterId) => {
    const counter = counterQuotations.find((item) => item.counter_id === counterId);
    if (!counter) return;
    setLoiForm((prev) => ({
      ...prev,
      quotationId: counter.quotation_id || prev.quotationId,
      counterQuotationId: counterId,
      totalAmount: counter.total_amount || prev.totalAmount,
      advancePaymentPercent: counter.advance_payment_percent || 0,
      expectedDeliveryDate: counter.expected_delivery_date || prev.expectedDeliveryDate,
    }));
  };

  const handleRaiseEnquiryFromRequest = (request) => {
    const requestVendorId = request.vendorid || request.vendor_id || request.vendorId || '';
    setEnquiryForm((prev) => ({
      ...prev,
      companyId: request.companyid || request.companyId || prev.companyId,
      vendorId: requestVendorId || prev.vendorId,
      title: request.request_type || 'Purchase Request',
      description: request.description || '',
      source: 'planning',
      planningRequestId: request.requestid || request.requestId || '',
    }));
    if (requestVendorId) {
      setEnquiryItems([]);
    }
    setCurrentPage('purchase-enquiries');
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    try {
      const confirmed = window.confirm('Create this order?');
      if (!confirmed) return;
      if (!isValidDateInput(orderForm.expectedDeliveryDate)) {
        throw new Error('Enter a valid expected delivery date');
      }
      if (orderItems.length === 0) {
        throw new Error('Add at least one order item');
      }
      const payload = {
        loiId: orderForm.loiId,
        expectedDeliveryDate: orderForm.expectedDeliveryDate || null,
        termsAndConditions: orderForm.termsAndConditions || null,
        items: orderItems.map((item) => ({
          componentId: item.componentId,
          quantity: Number(item.quantity) || 0,
          unitPrice: Number(item.unitPrice) || 0,
          discountPercent: Number(item.discountPercent) || 0,
          cgstPercent: Number(item.cgstPercent) || 0,
          sgstPercent: Number(item.sgstPercent) || 0,
          lineTotal: Number(item.lineTotal) || 0,
        })),
      };
      const token = idToken || (await getIdToken());
      const { createOrder } = await import('../api/admin/orders.api');
      await createOrder(token, payload);
      setSuccess('Order created successfully');
      setTimeout(() => setSuccess(''), 3000);
      setOrderForm({ loiId: '', expectedDeliveryDate: '', termsAndConditions: '' });
      setOrderItems([]);
      fetchPurchaseOrders();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      const confirmed = window.confirm('Create this payment?');
      if (!confirmed) return;
      if (!isValidDateInput(paymentForm.dueDate)) {
        throw new Error('Enter a valid due date');
      }
      const amountValue = Number(paymentForm.amount) || 0;
      if (amountValue <= 0) {
        throw new Error('Enter a valid payment amount');
      }
      const invoice = vendorInvoices.find((entry) => String(entry.order_id) === String(paymentForm.orderId));
      const order = purchaseOrders.find((entry) => String(entry.order_id) === String(paymentForm.orderId));
      const totalTarget = Number(invoice?.total_amount || order?.total_amount || 0);
      const totalPaid = purchasePayments
        .filter((payment) => String(payment.order_id) === String(paymentForm.orderId) && payment.status !== 'failed')
        .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
      const remaining = totalTarget - totalPaid;
      if (amountValue > remaining + 0.01) {
        throw new Error(`Amount exceeds remaining balance. Remaining: ${remaining.toFixed(2)}`);
      }
      const payload = {
        orderId: paymentForm.orderId,
        phase: paymentForm.phase,
        amount: amountValue,
        paymentMode: paymentForm.paymentMode || null,
        dueDate: paymentForm.dueDate || null,
      };
      const token = idToken || (await getIdToken());
      const { createPayment } = await import('../api/admin/payments.api');
      await createPayment(token, payload);
      setSuccess('Payment created successfully');
      setTimeout(() => setSuccess(''), 3000);
      setPaymentForm({ orderId: '', phase: '', amount: '', paymentMode: '', dueDate: '' });
      setPrefillOrderId('');
      fetchPurchasePayments();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handlePaymentComplete = async (paymentId) => {
    try {
      const token = idToken || (await getIdToken());
      const { completePayment } = await import('../api/admin/payments.api');
      await completePayment(token, paymentId);
      setSuccess('Payment marked completed');
      setTimeout(() => setSuccess(''), 3000);
      fetchPurchasePayments();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handlePaymentFail = async (paymentId) => {
    try {
      const token = idToken || (await getIdToken());
      const { failPayment } = await import('../api/admin/payments.api');
      await failPayment(token, paymentId);
      setSuccess('Payment marked failed');
      setTimeout(() => setSuccess(''), 3000);
      fetchPurchasePayments();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleInvoiceAction = async (invoiceId, action) => {
    try {
      const token = idToken || (await getIdToken());
      const data = await invoiceAction(token, invoiceId, action);
      if (data.error) throw new Error(data.error || 'Failed to update invoice');
      setSuccess('Invoice updated');
      setTimeout(() => setSuccess(''), 3000);
      fetchVendorInvoices();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleGenerateOrderFromLoi = async (loi) => {
    try {
      const quotationId = loi?.quotation_id;
      if (!quotationId) throw new Error('Quotation missing on LOI');

      const quotationResponse = await fetch(apiUrl(`/api/purchase/quotation/${quotationId}`), {
        headers: await getAuthHeaders(),
      });
      const quotationData = await quotationResponse.json();
      if (!quotationResponse.ok) throw new Error(quotationData.error || 'Failed to load quotation');

      const quotation = quotationData.quotation;
      const items = (quotation?.items || []).map((item) => ({
        componentId: item.component_id,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        discountPercent: item.discount_percent || 0,
        cgstPercent: item.cgst_percent || 0,
        sgstPercent: item.sgst_percent || 0,
        lineTotal: (item.unit_price || 0) * (item.quantity || 0),
      }));

      if (items.length === 0) throw new Error('Quotation has no items');

      const response = await fetch(apiUrl('/api/purchase/order'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify({
          loiId: loi.loi_id,
          vendorId: loi.vendor_id,
          expectedDeliveryDate: loi.expected_delivery_date || null,
          termsAndConditions: loi.terms_and_conditions || null,
          items,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create order');
      setSuccess('Order generated from LOI');
      setTimeout(() => setSuccess(''), 3000);
      fetchPurchaseOrders();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const goToLois = (payload) => {
    const quotationId = payload?.quotation_id || payload?.quotationId || '';
    const counterId = payload?.counter_id || payload?.counterId || '';
    setFocusQuotationId(quotationId || (payload?.quotation_id ? String(payload.quotation_id) : ''));
    setFocusCounterId(counterId || (payload?.counter_id ? String(payload.counter_id) : ''));
    setFocusLoiId('');
    setFocusOrderId('');
    setPrefillOrderId('');
    // Async logic moved to handleGenerateOrderFromLoi
  };
  const goToOrders = (loi) => {
    const loiId = loi?.loi_id || loi?.loiId || loi;
    setFocusQuotationId('');
    setFocusCounterId('');
    setFocusLoiId(loiId || '');
    setFocusOrderId('');
    setPrefillOrderId('');
    setCurrentPage('purchase-orders');
  };
  const goToPaymentsForOrder = (order) => {
    const orderId = order?.order_id || order?.orderId || order;
    setFocusQuotationId('');
    setFocusCounterId('');
    setFocusLoiId('');
    setFocusOrderId(orderId || '');
    setPrefillOrderId(orderId || '');
    setPaymentForm((prev) => ({
      ...prev,
      orderId: orderId || '',
    }));
    setCurrentPage('purchase-payments');
  };
  const goToPaymentsForInvoice = (order) => {
    const orderId = order?.order_id || order?.orderId || order;
    setFocusQuotationId('');
    setFocusCounterId('');
    setFocusLoiId('');
    setFocusOrderId(orderId || '');
    setPrefillOrderId(orderId || '');
    setPaymentForm((prev) => ({
      ...prev,
      orderId: orderId || '',
    }));
    setCurrentPage('purchase-payments');
  };
  const goToInvoices = (order) => {
    const orderId = order?.order_id || order?.orderId || order;
    setFocusQuotationId('');
    setFocusCounterId('');
    setFocusLoiId('');
    setFocusOrderId(orderId || '');
    setPrefillOrderId('');
    setCurrentPage('vendor-invoices');
  };

  const pageInfo = getPageInfo();

  const vendorOptions = vendorProducts.reduce((acc, component) => {
    const vendorId = component.vendorid || component.vendor_id;
    if (!vendorId || acc.some((item) => item.vendorId === vendorId)) return acc;
    const label = component.vendorregistration?.company_name
      || component.vendorregistration?.contact_person
      || `Vendor ${vendorId}`;
    acc.push({ vendorId, label });
    return acc;
  }, []);

  const filteredVendorComponents = enquiryForm.vendorId
    ? vendorProducts.filter((component) => {
      const componentVendorId = component.vendorid || component.vendor_id;
      return componentVendorId === enquiryForm.vendorId;
    })
    : [];

  const vendorLookup = vendorProducts.reduce((acc, component) => {
    const vendorId = component.vendorid || component.vendor_id;
    if (!vendorId || acc[vendorId]) return acc;
    acc[vendorId] = component.vendorregistration?.company_name
      || component.vendorregistration?.contact_person
      || 'Vendor';
    return acc;
  }, {});

  const componentLookup = vendorProducts.reduce((acc, component) => {
    const componentId = component.componentid || component.id;
    if (!componentId || acc[componentId]) return acc;
    acc[componentId] = component.component_name || component.name || 'Component';
    return acc;
  }, {});

  const componentDetailsLookup = vendorProducts.reduce((acc, component) => {
    const componentId = component.componentid || component.id;
    if (!componentId || acc[componentId]) return acc;
    acc[componentId] = component;
    return acc;
  }, {});

  const productLookup = products.reduce((acc, product) => {
    const productId = product.productId || product.productid;
    if (!productId || acc[productId]) return acc;
    acc[productId] = product.title || product.name || 'Product';
    return acc;
  }, {});

  const componentVendorCounts = vendorProducts.reduce((acc, component) => {
    const componentCode = component.component_code || component.componentCode;
    if (!componentCode) return acc;
    acc[componentCode] = (acc[componentCode] || 0) + 1;
    return acc;
  }, {});

  const orderLookup = purchaseOrders.reduce((acc, order) => {
    acc[order.order_id] = order.order_number || 'Order';
    return acc;
  }, {});

  // Calculate notification badge counts for PM
  // 1. Enquiries rejected by vendors (need resubmission)
  const enquiriesCount = purchaseEnquiries.filter(
    (e) => e.status === 'rejected'
  ).length;

  // 2. Quotations/Counter-quotations pending review
  const quotationsCount = (() => {
    const sentQuotations = purchaseQuotations.filter((q) => q.status === 'sent').length;
    const sentCounterQuotations = counterQuotations.filter((cq) => cq.status === 'sent').length;
    return sentQuotations + sentCounterQuotations;
  })();

  // 3. LOIs accepted by vendors (ready to create orders)
  const loisCount = purchaseLois.filter(
    (loi) => loi.status === 'accepted'
  ).length;

  // 4. Orders with invoices received (need to process payment)
  const ordersCount = vendorInvoices.filter(
    (inv) => ['received'].includes(inv.status)
  ).length;

  // 5. Invoices pending/received (need action)
  const invoicesCount = vendorInvoices.filter(
    (inv) => ['pending', 'received'].includes(inv.status)
  ).length;

  // 6. Payment receipts sent by vendors
  const receiptIds = purchasePayments
    .filter((payment) => payment.status === 'receipt_sent')
    .map((payment) => String(payment.payment_id));
  const seenReceiptIds = JSON.parse(localStorage.getItem('seenPaymentReceipts') || '[]');
  const receiptCount = receiptIds.filter((id) => !seenReceiptIds.includes(id)).length;

  // Show loading screen while auth initializes or token is loading
  if (authLoading || !idToken) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-900 text-lg">
          {authLoading ? 'Initializing...' : 'Authenticating...'}
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      userType="admin"
      userName={adminUser?.email || 'Purchase Manager'}
      userProfile={{
        name: adminUser?.username || adminUser?.email || 'Purchase Manager',
        role: 'Purchase Manager',
        email: adminUser?.email || adminUser?.username || '—',
        company: adminUser?.company_name || adminUser?.company || '—',
      }}
      currentPage={pageInfo.title}
      pageDescription={pageInfo.description}
      paymentReceiptCount={receiptCount}
      enquiriesCount={enquiriesCount}
      loisCount={loisCount}
      ordersCount={ordersCount}
      invoicesCount={invoicesCount}
    >
      <div className="fixed top-10 right-6 z-50 space-y-3">
        <FloatingNotice type="error" message={error} />
        <FloatingNotice type="success" message={success} />
      </div>

      {currentPage === 'overview' && (
        /* Overview cards + recent activity */
        <OverviewTab
          overviewStats={overviewStats}
          onGoToRegistrations={(reg) => {
            if (reg) {
              setSelectedRegistration(reg);
            }
            setCurrentPage('registrations');
          }}
          onGoToVendorProducts={() => setCurrentPage('vendor-products')}
        />
      )}

      {currentPage === 'products' && (
        /* Read-only product catalog */
        <ProductsTab
          products={products}
          onSelectProduct={(product) => {
            setSelectedProduct(product);
            fetchComponents(product.productId || product.productid);
            setCurrentPage('components');
          }}
          onViewVendors={(product) => {
            setSelectedProduct(product);
            setAutoSelectFirstComponent(true);
            fetchComponents(product.productId || product.productid);
            setCurrentPage('components');
          }}
        />
      )}

      {currentPage === 'components' && (
        /* Product-specific component view */
        <ComponentsTab
          products={products}
          selectedProduct={selectedProduct}
          components={components}
          vendorCounts={componentVendorCounts}
          autoSelectFirstComponent={autoSelectFirstComponent}
          onAutoSelectConsumed={() => setAutoSelectFirstComponent(false)}
          onSelectProduct={(productId) => {
            const product = products.find((p) => (p.productId || p.productid) === productId);
            setSelectedProduct(product || null);
            fetchComponents(productId);
          }}
          onActivateComponent={handleActivateComponent}
        />
      )}

      {currentPage === 'required-components' && (
        /* Required components CRUD */
        <RequiredComponentsTab
          requestForm={requestForm}
          editingRequiredId={editingRequiredId}
          requiredRequests={requiredRequests}
          onInputChange={handleRequestInputChange}
          onSubmit={handleCreateRequiredComponent}
          onCancelEdit={() => {
            setEditingRequiredId(null);
            setRequestForm({ name: '', description: '' });
          }}
          onEdit={(req) => {
            setEditingRequiredId(req.id);
            setRequestForm({ name: req.name || '', description: req.description || '' });
          }}
          onDelete={handleDeleteRequiredComponent}
        />
      )}

      {currentPage === 'purchase-enquiries' && (
        <div className="procurement-view">
          <PurchaseEnquiriesTab
            enquiries={purchaseEnquiries}
            quotations={purchaseQuotations}
            components={filteredVendorComponents}
            vendors={vendorOptions}
            selectedItems={enquiryItems}
            formData={enquiryForm}
            onInputChange={handleEnquiryInputChange}
            onAddItem={handleAddEnquiryItem}
            onRemoveItem={handleRemoveEnquiryItem}
            onItemChange={handleEnquiryItemChange}
            onSubmit={handleEnquirySubmit}
            onEditEnquiry={handleEditEnquiry}
            editingEnquiryId={editingEnquiryId}
            onCancelEdit={handleCancelEnquiryEdit}
            componentLookup={componentLookup}
            componentDetailsLookup={componentDetailsLookup}
            productLookup={productLookup}
          />
        </div>
      )}

      {currentPage === 'purchase-quotations' && (
        <div className="procurement-view">
          <PurchaseQuotationsTab
            quotations={purchaseQuotations}
            counters={counterQuotations}
            lois={purchaseLois}
            vendorLookup={vendorLookup}
            componentLookup={componentLookup}
            onAcceptQuotation={handleAcceptQuotation}
            onRequestNegotiation={handleRequestNegotiation}
            onAcceptCounter={handleAcceptCounterQuotation}
            onRejectCounter={handleRejectCounterQuotation}
            onGoToLois={goToLois}
          />
        </div>
      )}

      {currentPage === 'purchase-lois' && (
        <div className="procurement-view">
          <PurchaseLoisTab
            lois={purchaseLois}
            quotations={purchaseQuotations}
            counters={counterQuotations}
            orders={purchaseOrders}
            vendorLookup={vendorLookup}
            formData={loiForm}
            onInputChange={handleLoiInputChange}
            onSelectQuotation={handleSelectQuotationForLoi}
            onSelectCounter={handleSelectCounterForLoi}
            onSubmit={handleLoiSubmit}
            onGenerateOrder={handleGenerateOrderFromLoi}
            onGoToOrders={goToOrders}
            onResubmitLoi={handleResubmitLoi}
            onEditLoi={handleEditLoi}
            editingLoiId={editingLoiId}
            focusQuotationId={focusQuotationId}
            focusCounterId={focusCounterId}
            onClearFocus={() => {
              setFocusQuotationId('');
              setFocusCounterId('');
            }}
          />
        </div>
      )}

      {currentPage === 'purchase-orders' && (
        <div className="procurement-view">
          <PurchaseOrdersTab
            orders={purchaseOrders}
            vendorLookup={vendorLookup}
            onGoToInvoices={goToInvoices}
            focusLoiId={focusLoiId}
            onClearFocus={() => setFocusLoiId('')}
          />
        </div>
      )}

      {currentPage === 'purchase-payments' && (
        <div className="procurement-view">
          <PurchasePaymentsTab
            payments={purchasePayments}
            orders={purchaseOrders}
            invoices={vendorInvoices}
            formData={paymentForm}
            onInputChange={handlePaymentInputChange}
            onSubmit={handlePaymentSubmit}
            onComplete={handlePaymentComplete}
            onFail={handlePaymentFail}
            onGoToInvoices={goToInvoices}
            focusOrderId={focusOrderId}
            prefillOrderId={prefillOrderId}
            onClearFocus={() => {
              setFocusOrderId('');
              setPrefillOrderId('');
            }}
          />
        </div>
      )}

      {currentPage === 'payment-receipts' && (
        <div className="procurement-view">
          <PaymentReceiptsTab
            receipts={purchasePayments.filter((payment) => payment.status === 'receipt_sent')}
            orderLookup={orderLookup}
            vendorLookup={vendorLookup}
          />
        </div>
      )}

      {currentPage === 'purchase-requests' && (
        <div className="procurement-view">
          <PurchaseRequestsTab
            requests={purchaseRequests}
            onRaiseEnquiry={handleRaiseEnquiryFromRequest}
          />
        </div>
      )}

      {currentPage === 'analytics' && (
        <AnalyticsTab data={analyticsData} />
      )}

      {currentPage === 'vendor-invoices' && (
        <div className="procurement-view">
          <VendorInvoicesTab
            invoices={vendorInvoices}
            payments={purchasePayments}
            vendorLookup={vendorLookup}
            componentLookup={componentLookup}
            orderLookup={orderLookup}
            onMarkReceived={(invoiceId) => handleInvoiceAction(invoiceId, 'received')}
            onAccept={(invoiceId) => handleInvoiceAction(invoiceId, 'accept')}
            onReject={(invoiceId) => handleInvoiceAction(invoiceId, 'reject')}
            onMarkPaid={(invoiceId) => handleInvoiceAction(invoiceId, 'paid')}
            onGoToPayments={goToPaymentsForInvoice}
            focusOrderId={focusOrderId}
            onClearFocus={() => setFocusOrderId('')}
          />
        </div>
      )}

      {currentPage === 'registrations' && (
        /* Supplier registration review */
        <RegistrationsTab
          filter={filter}
          loading={loading}
          registrations={registrations}
          onFilterChange={setFilter}
          onView={(registration) => setSelectedRegistration(registration)}
          onApprove={handleApprove}
          onReject={(registration) => {
            setSelectedRegistration(registration);
            setShowRejectModal(true);
          }}
        />
      )}


      {/* Vendor component submissions */}
      {currentPage === 'vendor-products' && <VendorComponentsTab vendorProducts={vendorProducts} onRefresh={fetchVendorProducts} getAuthHeaders={getAuthHeaders} />}

      {/* Modals */}
      {selectedRegistration && !showRejectModal && (
        <RegistrationDetailsModal
          selectedRegistration={selectedRegistration}
          onClose={() => setSelectedRegistration(null)}
          onApprove={(supplierId) => {
            handleApprove(supplierId);
            setSelectedRegistration(null);
          }}
          onReject={() => setShowRejectModal(true)}
          onApproveCertificate={(supplierId) => handleUpdateCertificateStatus(supplierId, 'approved')}
          onRejectCertificate={(supplierId) => handleUpdateCertificateStatus(supplierId, 'rejected')}
        />
      )}

      {showRejectModal && selectedRegistration && (
        <RejectModal
          selectedRegistration={selectedRegistration}
          rejectReason={rejectReason}
          onRejectReasonChange={setRejectReason}
          onConfirmReject={handleReject}
          onCancel={() => setShowRejectModal(false)}
        />
      )}

    </DashboardLayout>
  );
}

export default AdminPanel;
