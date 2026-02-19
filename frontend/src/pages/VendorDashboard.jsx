/**
 * VendorDashboard - Main dashboard for vendor/supplier interface
 *
 * Features:
 * - Vendor profile management (company info, contact details)
 * - Product/Component management (CRUD operations)
 * - Purchase enquiry handling and quotation submission
 * - Order and invoice management
 * - Payment tracking
 * - Business analytics and performance metrics
 * - Notification system with status-based badges
 *
 * Tabs Available:
 * - overview: Welcome, quick stats, profile management
 * - analytics: Business metrics, performance analytics
 * - components: Product catalog with approval workflow
 * - enquiries: Purchase enquiries from PM
 * - quotations: Vendor quotations submission
 * - lois: Letters of Intent
 * - orders: Received orders
 * - payments: Payment tracking
 * - invoices: Generated invoices
 *
 * Component State Management:
 * - supplier: Vendor profile data
 * - components: Vendor's product catalog
 * - purchaseEnquiries/Quotations/Orders/Payments/Invoices: Workflow data
 * - Form states: For component CRUD, invoicing, quotation submission
 * - UI state: currentPage, modals, loading, errors
 */

// Vendor dashboard with tabbed layout and component CRUD
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { apiUrl } from '../utils/api';
import OverviewTab from '../components/vendor/OverviewTab';
import VendorAnalyticsTab from '../components/vendor/VendorAnalyticsTab';
import ComponentsTab from '../components/vendor/ComponentsTab';
import EnquiriesTab from '../components/vendor/EnquiriesTab';
import QuotationsTab from '../components/vendor/QuotationsTab';
import LoisTab from '../components/vendor/LoisTab';
import OrdersTab from '../components/vendor/OrdersTab';
import PaymentsTab from '../components/vendor/PaymentsTab';
import InvoicesTab from '../components/vendor/InvoicesTab';
import AddComponentModal from '../components/vendor/AddComponentModal';
import FloatingNotice from '../components/FloatingNotice';


// Default form values for add/edit component
const DEFAULT_FORM_DATA = {
  name: '',
  item_no: '',
  description: '',
  specifications: '',
  unit_of_measurement: '',
  hsn_code: '',
  img: '',
  size: '',
  color: '',
  minor_details: '',
  price_per_unit: '',
  cgst: 0,
  sgst: 0,
  discount_percent: 0,
  minimum_order_quantity: 1,
  stock_available: 0,
  lead_time_days: 0,
};

// Build editable account form defaults from supplier profile
const buildAccountFormData = (supplier) => ({
  company_name: supplier?.company_name || '',
  company_tin: supplier?.company_tin || '',
  address: supplier?.address || '',
  contact_person: supplier?.contact_person || '',
  contact_email: supplier?.contact_email || '',
  contact_phone: supplier?.contact_phone || '',
  company_website: supplier?.company_website || '',
});

function VendorDashboard() {
  const navigate = useNavigate();
  const { currentUser, idToken, getIdToken, loading: authLoading } = useAuth();
  
  // ==================== Core Vendor & Navigation State ====================
  const [supplier, setSupplier] = useState(null);
  const [currentPage, setCurrentPage] = useState('overview');
  
  // ==================== Procurement Workflow Data ====================
  const [components, setComponents] = useState([]); // Vendor's product catalog
  const [requiredComponents, setRequiredComponents] = useState([]); // PM's required components list
  const [purchaseEnquiries, setPurchaseEnquiries] = useState([]); // Enquiries from PM
  const [purchaseQuotations, setPurchaseQuotations] = useState([]); // Vendor's submitted quotations
  const [counterQuotations, setCounterQuotations] = useState([]); // PM's counter quotations
  const [purchaseLois, setPurchaseLois] = useState([]); // Letters of Intent
  const [purchaseOrders, setPurchaseOrders] = useState([]); // Confirmed orders
  const [purchasePayments, setPurchasePayments] = useState([]); // Payment records
  const [vendorInvoices, setVendorInvoices] = useState([]); // Invoices generated
  
  // ==================== UI & Form State ====================
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [selectedRequiredComponent, setSelectedRequiredComponent] = useState(null);
  
  // ==================== Form Data State ====================
  const [accountFormData, setAccountFormData] = useState(buildAccountFormData(null));
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [counterQuotationForm, setCounterQuotationForm] = useState({
    quotationId: '',
    action: 'accept',
    expectedDeliveryDate: '',
    validTill: '',
    advancePaymentPercent: 0,
    rejectionReason: '',
    negotiationNotes: '',
  });
  const [counterQuotationItems, setCounterQuotationItems] = useState([]);
  const [vendorQuotationForm, setVendorQuotationForm] = useState({
    enquiryId: '',
    validTill: '',
    expectedDeliveryDate: '',
    advancePaymentPercent: 0,
    notes: '',
  });
  const [vendorQuotationItems, setVendorQuotationItems] = useState([]);
  const [invoiceForm, setInvoiceForm] = useState({
    loiId: '',
    orderId: '',
    companyId: '',
    vendorId: '',
    notes: '',
  });
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [focusQuotationId, setFocusQuotationId] = useState('');
  const [focusLoiId, setFocusLoiId] = useState('');
  const [focusOrderId, setFocusOrderId] = useState('');
  const [prefillInvoiceOrderId, setPrefillInvoiceOrderId] = useState('');

  // ==================== Utility Functions ====================
  
  /** Validate date input - returns true if empty or valid date */
  const isValidDateInput = (value) => (!value || !Number.isNaN(new Date(value).getTime()));

  /** Reset component form to default values with optional overrides */
  const resetFormData = (overrides = {}) => {
    setFormData({ ...DEFAULT_FORM_DATA, ...overrides });
  };

  /** Navigation: Switch to components tab */
  const goToComponents = () => {
    setCurrentPage('components');
  };

  /** Get authorization headers with Firebase ID token */
  const getAuthHeaders = async () => {
    if (idToken) {
      return { Authorization: `Bearer ${idToken}` };
    }
    
    const freshToken = await getIdToken();
    return freshToken ? { Authorization: `Bearer ${freshToken}` } : {};
  };

  // ==================== Data Fetching - Vendor Components ====================
  
  /** Fetch vendor's product catalog with approval status */
  const fetchComponents = async () => {
    if (!currentUser) return;

    const response = await fetch(apiUrl('/api/vendor/components'), {
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch components');
    }

    const data = await response.json();
    setComponents(data.products || []);
  };

  /** Fetch PM's required components list for reference */
  const fetchRequiredComponents = async () => {
    if (!currentUser) return;

    const response = await fetch(apiUrl('/api/vendor/components-required'), {
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch required components');
    }

    const data = await response.json();
    setRequiredComponents(data.requiredComponents || []);
  };

  // ==================== Data Fetching - Purchase Workflow ====================
  
  /** Fetch enquiries from PM for this vendor */
  const fetchPurchaseEnquiries = async (vendorId) => {
    try {
      const response = await fetch(apiUrl(`/api/purchase/enquiries?vendorId=${vendorId}`), {
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch enquiries');
      const data = await response.json();
      setPurchaseEnquiries(data.enquiries || []);
    } catch (err) {
      console.error('Error fetching enquiries:', err);
    }
  };

  /** Fetch vendor's submitted quotations to PM */
  const fetchPurchaseQuotations = async (vendorId) => {
    try {
      const response = await fetch(apiUrl(`/api/purchase/quotations?vendorId=${vendorId}`), {
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch quotations');
      const data = await response.json();
      setPurchaseQuotations(data.quotations || []);
    } catch (err) {
      console.error('Error fetching quotations:', err);
    }
  };

  /** Fetch PM's counter quotations/offers to vendor */
  const fetchCounterQuotations = async (vendorId) => {
    try {
      const response = await fetch(apiUrl(`/api/vendor/counter-quotations?vendorId=${vendorId}`), {
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch counter quotations');
      const data = await response.json();
      setCounterQuotations(data.counters || []);
    } catch (err) {
      console.error('Error fetching counter quotations:', err);
    }
  };

  const fetchPurchaseLois = async (vendorId) => {
    try {
      const response = await fetch(apiUrl(`/api/purchase/lois?vendorId=${vendorId}`), {
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch LOIs');
      const data = await response.json();
      setPurchaseLois(data.lois || []);
    } catch (err) {
      console.error('Error fetching LOIs:', err);
    }
  };

  const fetchPurchaseOrders = async (vendorId) => {
    try {
      const response = await fetch(apiUrl(`/api/purchase/orders?vendorId=${vendorId}`), {
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setPurchaseOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const fetchPurchasePayments = async (vendorId) => {
    try {
      const response = await fetch(apiUrl(`/api/purchase/payments?vendorId=${vendorId}`), {
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch payments');
      const data = await response.json();
      setPurchasePayments(data.payments || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
    }
  };

  const fetchVendorInvoices = async (vendorId) => {
    try {
      const response = await fetch(apiUrl(`/api/vendor/invoices?vendorId=${vendorId}`), {
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch invoices');
      const data = await response.json();
      setVendorInvoices(data.invoices || []);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
  };

  // Session guard and profile bootstrap
  useEffect(() => {
    // Wait for Firebase auth to initialize
    if (authLoading) {
      console.log('⏳ Waiting for Firebase auth to initialize...');
      return;
    }

    // Redirect to login if not authenticated with Firebase
    if (!currentUser) {
      console.log('❌ No Firebase user - redirecting to vendor login');
      navigate('/vendor/login');
      return;
    }

    // Wait for idToken to be available before proceeding
    if (!idToken) {
      console.log('⏳ Waiting for Firebase ID token...');
      return;
    }

    // For now, we'll fetch supplier data from the backend using Firebase token
    // In the future, supplier data should come from Firestore or backend API
    const storedSupplier = localStorage.getItem('supplier');
    if (storedSupplier) {
      try {
        const parsedSupplier = JSON.parse(storedSupplier);
        setSupplier(parsedSupplier);
        setAccountFormData(buildAccountFormData(parsedSupplier));
      } catch (err) {
        console.error('Error parsing supplier data:', err);
      }
    }
  }, [currentUser, authLoading, idToken, navigate]);

  // Load dashboard data when supplier is ready
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!supplier) return;
      try {
        setLoading(true);
        await Promise.all([
          fetchComponents(),
          fetchRequiredComponents(),
          fetchPurchaseEnquiries(supplier.vendor_id),
          fetchPurchaseQuotations(supplier.vendor_id),
          fetchCounterQuotations(supplier.vendor_id),
          fetchPurchaseLois(supplier.vendor_id),
          fetchPurchaseOrders(supplier.vendor_id),
          fetchPurchasePayments(supplier.vendor_id),
          fetchVendorInvoices(supplier.vendor_id),
        ]);
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load dashboard data');
          setTimeout(() => setError(''), 3000);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [supplier]);

  useEffect(() => {
    if (supplier?.supplier_id) {
      setInvoiceForm((prev) => ({
        ...prev,
        vendorId: supplier.vendor_id,
      }));
    }
  }, [supplier]);

  // Listen to sidebar navigation events
  useEffect(() => {
    const handler = (event) => {
      if (event?.detail?.page) {
        setCurrentPage(event.detail.page);
      }
    };

    window.addEventListener('dashboardPageChange', handler);
    return () => window.removeEventListener('dashboardPageChange', handler);
  }, []);

  // Controlled input changes for component form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Controlled input changes for account form
  const handleAccountInputChange = (e) => {
    const { name, value } = e.target;
    setAccountFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCounterQuotationInputChange = (e) => {
    const { name, value } = e.target;
    setCounterQuotationForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVendorQuotationInputChange = (e) => {
    const { name, value } = e.target;
    setVendorQuotationForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInvoiceInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'loiId') {
      const order = purchaseOrders.find((item) => item.loi_id === value);
      if (order) {
        setInvoiceForm((prev) => ({
          ...prev,
          loiId: value,
          orderId: order.order_id,
          companyId: order.company_id || prev.companyId,
          vendorId: order.vendor_id || prev.vendorId,
        }));
        const mappedItems = (order.items || []).map((item) => ({
          componentId: item.component_id,
          orderItemId: item.item_id,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          discountPercent: item.discount_percent || 0,
          cgstPercent: item.cgst_percent || 0,
          sgstPercent: item.sgst_percent || 0,
          lineTotal: (Number(item.unit_price) || 0) * (Number(item.quantity) || 0),
        }));
        setInvoiceItems(mappedItems);
      }
    }

    if (name === 'orderId') {
      const order = purchaseOrders.find((item) => item.order_id === value);
      if (order) {
        setInvoiceForm((prev) => ({
          ...prev,
          orderId: value,
          companyId: order.company_id || prev.companyId,
          vendorId: order.vendor_id || prev.vendorId,
        }));
        const mappedItems = (order.items || []).map((item) => ({
          componentId: item.component_id,
          orderItemId: item.item_id,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          discountPercent: item.discount_percent || 0,
          cgstPercent: item.cgst_percent || 0,
          sgstPercent: item.sgst_percent || 0,
          lineTotal: item.line_total || 0,
        }));
        setInvoiceItems(mappedItems);
      }
    }
  };

  const prefillInvoiceFromOrder = (orderId) => {
    if (!orderId) return;
    const order = purchaseOrders.find((item) => item.order_id === orderId);
    if (!order) return;
    setInvoiceForm((prev) => ({
      ...prev,
      loiId: order.loi_id || prev.loiId,
      orderId,
      companyId: order.company_id || prev.companyId,
      vendorId: order.vendor_id || prev.vendorId,
    }));
    const mappedItems = (order.items || []).map((item) => ({
      componentId: item.component_id,
      orderItemId: item.item_id,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      discountPercent: item.discount_percent || 0,
      cgstPercent: item.cgst_percent || 0,
      sgstPercent: item.sgst_percent || 0,
      lineTotal: (Number(item.unit_price) || 0) * (Number(item.quantity) || 0),
    }));
    setInvoiceItems(mappedItems);
  };

  const handleAddVendorQuotationItem = () => {
    setVendorQuotationItems((prev) => ([
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

  const handleRemoveVendorQuotationItem = (index) => {
    setVendorQuotationItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVendorQuotationItemChange = (index, field, value) => {
    setVendorQuotationItems((prev) =>
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

  const handleAddCounterQuotationItem = () => {
    setCounterQuotationItems((prev) => ([
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

  const handleRemoveCounterQuotationItem = (index) => {
    setCounterQuotationItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCounterQuotationItemChange = (index, field, value) => {
    setCounterQuotationItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const next = { ...item, [field]: value };
        if (field === 'componentId') {
          const component = components.find((entry) => (entry.componentid || entry.id) === value);
          if (component) {
            next.unitPrice = Number(component.price_per_unit) || next.unitPrice;
            next.cgstPercent = Number(component.cgst) || 0;
            next.sgstPercent = Number(component.sgst) || 0;
          }
          const qty = Number(next.quantity) || 0;
          const price = Number(next.unitPrice) || 0;
          next.lineTotal = qty * price;
        }
        if (field === 'quantity' || field === 'unitPrice') {
          const qty = Number(field === 'quantity' ? value : next.quantity) || 0;
          const price = Number(field === 'unitPrice' ? value : next.unitPrice) || 0;
          next.lineTotal = qty * price;
        }
        return next;
      })
    );
  };

  const handleAddInvoiceItem = () => {
    setInvoiceItems((prev) => ([
      ...prev,
      {
        componentId: '',
        orderItemId: '',
        quantity: 1,
        unitPrice: 0,
        discountPercent: 0,
        cgstPercent: 0,
        sgstPercent: 0,
        lineTotal: 0,
      },
    ]));
  };

  const handleRemoveInvoiceItem = (index) => {
    setInvoiceItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInvoiceItemChange = (index, field, value) => {
    setInvoiceItems((prev) =>
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

  // Update vendor profile information
  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(apiUrl('/api/supplier/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify(accountFormData),
      });

      if (!response.ok) throw new Error('Failed to update account');

      const data = await response.json();
      setSupplier(data.supplier);
      localStorage.setItem('supplier', JSON.stringify(data.supplier));
      setAccountFormData(buildAccountFormData(data.supplier));
      setSuccess('Account information updated successfully!');
      setIsEditingAccount(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  // Open the add component modal
  const openAddModal = () => {
    setEditingComponent(null);
    setSelectedRequiredComponent(null);
    resetFormData();
    setShowAddModal(true);
  };

  // Pre-fill add form based on required component
  const handleAddFromRequired = (required) => {
    setEditingComponent(null);
    setSelectedRequiredComponent(required);
    resetFormData({
      name: required?.component_name || required?.title || '',
      description: required?.description || '',
      unit_of_measurement: required?.unit_of_measurement || required?.measurement_unit || '',
    });
    setShowAddModal(true);
  };

  // Load a component into edit mode
  const handleEditComponent = (component) => {
    setEditingComponent(component);
    setSelectedRequiredComponent(null);
    resetFormData({
      name: component.component_name || '',
      item_no: component.item_no || '',
      description: component.description || '',
      specifications: component.specifications || '',
      unit_of_measurement: component.unit_of_measurement || component.measurement_unit || component.unit || '',
      hsn_code: component.hsn_code || '',
      img: component.img || '',
      size: component.size ?? '',
      color: component.color || '',
      minor_details: component.minor_details || '',
      price_per_unit: component.price_per_unit ?? '',
      cgst: component.cgst ?? 0,
      sgst: component.sgst ?? 0,
      discount_percent: component.discount_percent ?? 0,
      minimum_order_quantity: component.minimum_order_quantity ?? 1,
      stock_available: component.stock_available ?? component.current_stock ?? 0,
      lead_time_days: component.lead_time_days ?? 0,
    });
    setShowAddModal(true);
  };

  // Delete a component
  const handleDeleteComponent = async (componentId) => {
    const confirmed = window.confirm('Are you sure you want to delete this component?');
    if (!confirmed) return;

    try {
      const response = await fetch(apiUrl(`/api/vendor/components/${componentId}`), {
        method: 'DELETE',
        headers: await getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to delete component');

      setSuccess('Component deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchComponents();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  // Create or update a component
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        component_name: formData.name,
        item_no: formData.item_no,
        description: formData.description,
        specifications: formData.specifications,
        unit_of_measurement: formData.unit_of_measurement,
        hsn_code: formData.hsn_code,
        img: formData.img,
        size: formData.size ? Number(formData.size) : null,
        color: formData.color,
        minor_details: formData.minor_details,
        price_per_unit: parseFloat(formData.price_per_unit),
        cgst: parseFloat(formData.cgst) || 0,
        sgst: parseFloat(formData.sgst) || 0,
        discount_percent: parseFloat(formData.discount_percent) || 0,
        stock_available: parseInt(formData.stock_available, 10),
        lead_time_days: parseInt(formData.lead_time_days, 10),
        minimum_order_quantity: parseInt(formData.minimum_order_quantity, 10),
        component_code: selectedRequiredComponent?.component_code || undefined,
      };

      if (editingComponent) {
        const response = await fetch(apiUrl(`/api/vendor/components/${editingComponent.componentid}`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(await getAuthHeaders()),
          },
          body: JSON.stringify(submitData),
        });

        if (!response.ok) throw new Error('Failed to update component');

        setSuccess('Component updated successfully!');
        setShowAddModal(false);
        setEditingComponent(null);
      } else {
        const response = await fetch(apiUrl('/api/vendor/components'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(await getAuthHeaders()),
          },
          body: JSON.stringify(submitData),
        });

        if (!response.ok) throw new Error('Failed to add component');

        setSuccess('Component added successfully!');
        setShowAddModal(false);
      }

      resetFormData();
      fetchComponents();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const mapEnquiryItems = (items = []) =>
    items.map((item) => {
      const componentId = item.component_id || item.componentId || '';
      const component = components.find((entry) => (entry.componentid || entry.id) === componentId);
      const unitPrice = Number(component?.price_per_unit) || 0;
      const quantity = Number(item.quantity) || 1;
      return {
        componentId,
        name: component?.component_name || component?.name || 'Component',
        unit: component?.measurement_unit || component?.unit || '',
        quantity,
        unitPrice,
        discountPercent: 0,
        cgstPercent: Number(component?.cgst) || 0,
        sgstPercent: Number(component?.sgst) || 0,
        lineTotal: quantity * unitPrice,
      };
    });

  const handleSelectEnquiryForQuotation = (enquiryId) => {
    const enquiry = purchaseEnquiries.find(
      (item) => String(item.enquiry_id) === String(enquiryId)
    );
    setVendorQuotationForm((prev) => ({
      ...prev,
      enquiryId,
    }));
    setVendorQuotationItems(mapEnquiryItems(enquiry?.items || []));
  };

  const goToQuotationsWithEnquiry = (enquiry) => {
    if (enquiry?.enquiry_id) {
      handleSelectEnquiryForQuotation(enquiry.enquiry_id);
    }
    setCurrentPage('quotations');
  };

  const goToLois = (payload) => {
    const quotationId = payload?.quotation_id || payload?.quotationId || payload;
    setFocusQuotationId(quotationId || '');
    setFocusLoiId('');
    setFocusOrderId('');
    setPrefillInvoiceOrderId('');
    setCurrentPage('lois');
  };
  const goToOrders = (loi) => {
    const loiId = loi?.loi_id || loi?.loiId || loi;
    setFocusQuotationId('');
    setFocusLoiId(loiId || '');
    setFocusOrderId('');
    setPrefillInvoiceOrderId('');
    setCurrentPage('orders');
  };
  const goToPayments = (order) => {
    const orderId = order?.order_id || order?.orderId || order;
    setFocusQuotationId('');
    setFocusLoiId('');
    setFocusOrderId(orderId || '');
    setPrefillInvoiceOrderId('');
    setCurrentPage('payments');
  };
  const goToInvoicesForOrder = (order) => {
    const resolvedId = order?.order_id || order?.orderId || order || '';
    setFocusQuotationId('');
    setFocusLoiId('');
    setFocusOrderId(resolvedId);
    setPrefillInvoiceOrderId(resolvedId);
    prefillInvoiceFromOrder(resolvedId);
    setCurrentPage('invoices');
  };
  const goToInvoicesForPayment = (orderId) => {
    const resolvedId = orderId || '';
    setFocusQuotationId('');
    setFocusLoiId('');
    setFocusOrderId(resolvedId);
    setPrefillInvoiceOrderId(resolvedId);
    prefillInvoiceFromOrder(resolvedId);
    setCurrentPage('invoices');
  };
  const viewInvoice = (invoice, order) => {
    // Navigate to invoices tab and show the specific invoice details
    setFocusOrderId(invoice.order_id || order?.order_id);
    setCurrentPage('invoices');
    // You can add code here to scroll to or highlight the invoice
  };
  const editInvoice = (invoice, order) => {
    // Navigate to invoices tab with the invoice data pre-filled for editing
    setFocusOrderId(invoice.order_id || order?.order_id);
    setPrefillInvoiceOrderId(invoice.order_id || order?.order_id);
    setCurrentPage('invoices');
    // You can add code here to pre-fill the edit form with the invoice data
  };
  const goToPaymentsForInvoice = (orderId) => {
    const resolvedId = orderId || '';
    setFocusQuotationId('');
    setFocusLoiId('');
    setFocusOrderId(resolvedId);
    setPrefillInvoiceOrderId('');
    setCurrentPage('payments');
  };

  const handleVendorQuotationSubmit = async (e) => {
    e.preventDefault();
    try {
      const confirmed = window.confirm('Submit this quotation?');
      if (!confirmed) return;
      if (!isValidDateInput(vendorQuotationForm.validTill) || !isValidDateInput(vendorQuotationForm.expectedDeliveryDate)) {
        throw new Error('Enter valid dates for valid till and expected delivery');
      }
      if (vendorQuotationItems.length === 0) {
        throw new Error('Add at least one quotation item');
      }
      const advancePercent = Number(vendorQuotationForm.advancePaymentPercent) || 0;
      if (advancePercent < 0 || advancePercent > 100) {
        throw new Error('Advance payment percent must be between 0 and 100');
      }
      const payload = {
        enquiryId: vendorQuotationForm.enquiryId,
        items: vendorQuotationItems.map((item) => ({
          componentId: item.componentId,
          quantity: Number(item.quantity) || 0,
          unitPrice: Number(item.unitPrice) || 0,
          discountPercent: Number(item.discountPercent) || 0,
          cgstPercent: Number(item.cgstPercent) || 0,
          sgstPercent: Number(item.sgstPercent) || 0,
          lineTotal: Number(item.lineTotal) || 0,
        })),
        validTill: vendorQuotationForm.validTill || null,
        expectedDeliveryDate: vendorQuotationForm.expectedDeliveryDate || null,
        advancePaymentPercent: advancePercent,
        notes: vendorQuotationForm.notes || null,
      };

      const response = await fetch(apiUrl('/api/vendor/quotation'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create quotation');
      setSuccess('Quotation sent successfully');
      setTimeout(() => setSuccess(''), 3000);
      setVendorQuotationForm({ enquiryId: '', validTill: '', expectedDeliveryDate: '', advancePaymentPercent: 0, notes: '' });
      setVendorQuotationItems([]);
      fetchPurchaseQuotations(supplier.vendor_id);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCounterQuotationSubmit = async (e) => {
    e.preventDefault();
    try {
      const confirmed = window.confirm('Submit this counter quotation?');
      if (!confirmed) return;
      if (!isValidDateInput(counterQuotationForm.validTill) || !isValidDateInput(counterQuotationForm.expectedDeliveryDate)) {
        throw new Error('Enter valid dates for valid till and expected delivery');
      }
      if (counterQuotationForm.action === 'negotiate' && counterQuotationItems.length === 0) {
        throw new Error('Add at least one negotiation item');
      }
      const advancePercent = Number(counterQuotationForm.advancePaymentPercent) || 0;
      if (advancePercent < 0 || advancePercent > 100) {
        throw new Error('Advance payment percent must be between 0 and 100');
      }
      const payload = {
        quotationId: counterQuotationForm.quotationId,
        action: counterQuotationForm.action,
        expectedDeliveryDate: counterQuotationForm.expectedDeliveryDate || null,
        validTill: counterQuotationForm.validTill || null,
        advancePaymentPercent: advancePercent,
        rejectionReason: counterQuotationForm.rejectionReason || null,
        negotiationNotes: counterQuotationForm.negotiationNotes || null,
        items: counterQuotationForm.action === 'negotiate'
          ? counterQuotationItems.map((item) => ({
            componentId: item.componentId,
            quantity: Number(item.quantity) || 0,
            unitPrice: Number(item.unitPrice) || 0,
            discountPercent: Number(item.discountPercent) || 0,
            cgstPercent: Number(item.cgstPercent) || 0,
            sgstPercent: Number(item.sgstPercent) || 0,
            lineTotal: Number(item.lineTotal) || 0,
          }))
          : [],
      };

      const response = await fetch(apiUrl('/api/vendor/counter-quotation'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to submit counter quotation');
      setSuccess('Counter quotation submitted');
      setTimeout(() => setSuccess(''), 3000);
      setCounterQuotationForm({
        quotationId: '',
        action: 'accept',
        expectedDeliveryDate: '',
        validTill: '',
        advancePaymentPercent: 0,
        rejectionReason: '',
        negotiationNotes: '',
      });
      setCounterQuotationItems([]);
      fetchCounterQuotations(supplier.vendor_id);
      fetchPurchaseQuotations(supplier.vendor_id);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleLoiAction = async (loiId, action) => {
    try {
      const confirmed = window.confirm(`Confirm ${action} LOI?`);
      if (!confirmed) return;
      const response = await fetch(apiUrl(`/api/vendor/loi/${loiId}/${action}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update LOI');
      setSuccess(`LOI ${action}ed successfully`);
      setTimeout(() => setSuccess(''), 3000);
      fetchPurchaseLois(supplier.vendor_id);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleOrderConfirm = async (orderId) => {
    try {
      const confirmed = window.confirm('Confirm this order?');
      if (!confirmed) return;
      const response = await fetch(apiUrl(`/api/vendor/order/${orderId}/confirm`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to confirm order');
      setSuccess('Order confirmed');
      setTimeout(() => setSuccess(''), 3000);
      fetchPurchaseOrders(supplier.vendor_id);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handlePaymentReceived = async (paymentId) => {
    try {
      const confirmed = window.confirm('Confirm payment receipt?');
      if (!confirmed) return;
      const receiptReference = window.prompt('Enter receipt reference (optional):') || null;
      const response = await fetch(apiUrl(`/api/vendor/payment/${paymentId}/receipt`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify({ receiptReference }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send payment receipt');
      setSuccess('Payment receipt sent');
      setTimeout(() => setSuccess(''), 3000);
      fetchPurchasePayments(supplier.vendor_id);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    try {
      const confirmed = window.confirm('Submit this invoice?');
      if (!confirmed) return;
      if (!invoiceForm.orderId) {
        throw new Error('Select an order to invoice');
      }
      const existingInvoice = vendorInvoices.some(
        (invoice) => String(invoice.order_id) === String(invoiceForm.orderId)
      );
      if (existingInvoice) {
        throw new Error('Invoice already exists for this order');
      }
      if (invoiceItems.length === 0) {
        throw new Error('Add at least one invoice item');
      }
      const payload = {
        orderId: invoiceForm.orderId,
        companyId: invoiceForm.companyId,
        vendorId: invoiceForm.vendorId || supplier.vendor_id,
        notes: invoiceForm.notes || null,
        items: invoiceItems.map((item) => ({
          componentId: item.componentId,
          orderItemId: item.orderItemId || null,
          quantity: Number(item.quantity) || 0,
          unitPrice: Number(item.unitPrice) || 0,
          discountPercent: Number(item.discountPercent) || 0,
          cgstPercent: Number(item.cgstPercent) || 0,
          sgstPercent: Number(item.sgstPercent) || 0,
          lineTotal: Number(item.lineTotal) || 0,
        })),
      };

      const response = await fetch(apiUrl('/api/vendor/invoice'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create invoice');
      setSuccess('Invoice created successfully');
      setTimeout(() => setSuccess(''), 3000);
      setInvoiceForm({ loiId: '', orderId: '', companyId: '', vendorId: supplier.vendor_id, notes: '' });
      setInvoiceItems([]);
      setPrefillInvoiceOrderId('');
      fetchVendorInvoices(supplier.vendor_id);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  // Map tab to header title/description
  const getPageInfo = () => {
    switch (currentPage) {
      case 'overview':
        return { title: 'Overview', description: 'Welcome to your vendor dashboard' };
      case 'components':
        return { title: 'Manage Components', description: 'View and manage your component inventory' };
      case 'enquiries':
        return { title: 'Enquiries', description: 'Review purchase enquiries from your customer' };
      case 'quotations':
        return { title: 'Quotations', description: 'Review quotations and submit counter offers' };
      case 'lois':
        return { title: 'LOIs', description: 'Accept or reject letters of intent' };
      case 'orders':
        return { title: 'Orders', description: 'Confirm purchase orders' };
      case 'payments':
        return { title: 'Payments', description: 'Track payment status' };
      case 'invoices':
        return { title: 'Invoices', description: 'Create and monitor invoices' };
      default:
        return { title: 'Dashboard', description: 'Vendor Dashboard' };
    }
  };

  const pageInfo = getPageInfo();
  const componentLookup = components.reduce((acc, component) => {
    const componentId = component.componentid || component.component_id || component.id;
    if (!componentId || acc[componentId]) return acc;
    acc[componentId] = component.component_name || component.name || 'Component';
    return acc;
  }, {});

  // Loading state - show loading screen while auth initializes or data loads
  if (authLoading || !idToken || loading || !supplier) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-900 text-lg">
          {authLoading ? 'Initializing...' : !idToken ? 'Authenticating...' : 'Loading dashboard...'}
        </div>
      </div>
    );
  }

  // Calculate notification counts
  const seenEnquiryIds = (() => {
    try {
      return JSON.parse(localStorage.getItem('vendorEnquirySeen') || '[]');
    } catch {
      return [];
    }
  })();
  const enquiriesCount = purchaseEnquiries.filter(
    (e) => ['raised', 'pending', 'new'].includes(e.status) && !seenEnquiryIds.includes(e.enquiry_id)
  ).length;

  const loisCount = purchaseLois.filter((loi) => loi.status === 'sent').length;

  const ordersCount = purchaseOrders.filter(
    (order) => order.status === 'confirmed' && !vendorInvoices.some((inv) => inv.order_id === order.order_id && inv.status !== 'rejected')
  ).length;

  const invoicesCount = vendorInvoices.filter((inv) => ['pending', 'received'].includes(inv.status)).length;

  const paymentReceiptCount = purchasePayments.filter((payment) => payment.status === 'receipt_sent').length;

  return (
    <DashboardLayout
      userType="supplier"
      userName={supplier.company_name}
      userProfile={{
        name: supplier.contact_person || supplier.company_name || 'Vendor',
        role: 'Vendor',
        email: supplier.contact_email || '—',
        company: supplier.company_name || '—',
      }}
      currentPage={pageInfo.title}
      pageDescription={pageInfo.description}
      paymentReceiptCount={paymentReceiptCount}
      enquiriesCount={enquiriesCount}
      loisCount={loisCount}
      ordersCount={ordersCount}
      invoicesCount={invoicesCount}
    >
      <div className="fixed top-10 right-6 z-50 space-y-3">
        <FloatingNotice type="error" message={error} />
        <FloatingNotice type="success" message={success} />
      </div>

      {/* Overview tab - Vendor profile & quick stats */}
      {currentPage === 'overview' && (
        <OverviewTab
          components={components}
          purchaseEnquiries={purchaseEnquiries}
          purchaseOrders={purchaseOrders}
          vendorInvoices={vendorInvoices}
          supplier={supplier}
          isEditingAccount={isEditingAccount}
          accountFormData={accountFormData}
          onAccountInputChange={handleAccountInputChange}
          onUpdateAccount={handleUpdateAccount}
          onCancelEditAccount={() => {
            setIsEditingAccount(false);
            setAccountFormData(buildAccountFormData(supplier));
          }}
          onStartEditAccount={() => setIsEditingAccount(true)}
          onGoToComponents={goToComponents}
        />
      )}

      {/* Analytics tab - Business metrics & performance analytics */}
      {currentPage === 'analytics' && (
        <VendorAnalyticsTab
          components={components}
          purchaseEnquiries={purchaseEnquiries}
          purchaseQuotations={purchaseQuotations}
          purchaseOrders={purchaseOrders}
          purchasePayments={purchasePayments}
          vendorInvoices={vendorInvoices}
        />
      )}

      {/* Components tab */}
      {currentPage === 'components' && (
        <ComponentsTab
          components={components}
          requiredComponents={requiredComponents}
          onOpenAddModal={openAddModal}
          onAddFromRequired={handleAddFromRequired}
          onEditComponent={handleEditComponent}
          onDeleteComponent={handleDeleteComponent}
          onComponentAdded={fetchComponents}
        />
      )}

      {/* Placeholder tabs */}
      {currentPage === 'enquiries' && (
        <EnquiriesTab
          enquiries={purchaseEnquiries}
          componentCatalog={components}
          onCreateQuotation={goToQuotationsWithEnquiry}
          getAuthHeaders={getAuthHeaders}
          onRejectEnquiry={() => fetchPurchaseEnquiries(supplier.vendor_id)}
        />
      )}
      {currentPage === 'quotations' && (
        <QuotationsTab
          quotations={purchaseQuotations}
          counters={counterQuotations}
          enquiries={purchaseEnquiries}
          lois={purchaseLois}
          componentCatalog={components}
          quotationForm={vendorQuotationForm}
          quotationItems={vendorQuotationItems}
          onSelectEnquiry={handleSelectEnquiryForQuotation}
          onQuotationInputChange={handleVendorQuotationInputChange}
          onQuotationItemAdd={handleAddVendorQuotationItem}
          onQuotationItemRemove={handleRemoveVendorQuotationItem}
          onQuotationItemChange={handleVendorQuotationItemChange}
          onQuotationSubmit={handleVendorQuotationSubmit}
          counterForm={counterQuotationForm}
          counterItems={counterQuotationItems}
          onCounterInputChange={handleCounterQuotationInputChange}
          onCounterItemAdd={handleAddCounterQuotationItem}
          onCounterItemRemove={handleRemoveCounterQuotationItem}
          onCounterItemChange={handleCounterQuotationItemChange}
          onCounterSubmit={handleCounterQuotationSubmit}
          onGoToLois={goToLois}
        />
      )}
      {currentPage === 'lois' && (
        <LoisTab
          lois={purchaseLois}
          orders={purchaseOrders}
          invoices={vendorInvoices}
          onAccept={(loiId) => handleLoiAction(loiId, 'accept')}
          onReject={(loiId) => handleLoiAction(loiId, 'reject')}
          onGoToOrders={goToOrders}
          onGoToInvoices={goToInvoicesForOrder}
          focusQuotationId={focusQuotationId}
          onClearFocus={() => setFocusQuotationId('')}
        />
      )}
      {currentPage === 'orders' && (
        <OrdersTab
          orders={purchaseOrders}
          onConfirm={handleOrderConfirm}
          onGoToInvoices={goToInvoicesForOrder}
          onViewInvoice={viewInvoice}
          onEditInvoice={editInvoice}
          focusLoiId={focusLoiId}
          onClearFocus={() => setFocusLoiId('')}
        />
      )}
      {currentPage === 'payments' && (
        <PaymentsTab
          payments={purchasePayments}
          orders={purchaseOrders}
          invoices={vendorInvoices}
          onConfirmReceived={handlePaymentReceived}
          onGoToInvoices={goToInvoicesForPayment}
          focusOrderId={focusOrderId}
          onClearFocus={() => setFocusOrderId('')}
        />
      )}
      {currentPage === 'invoices' && (
        <InvoicesTab
          invoices={vendorInvoices}
          lois={purchaseLois}
          orders={purchaseOrders}
          payments={purchasePayments}
          formData={invoiceForm}
          onInputChange={handleInvoiceInputChange}
          items={invoiceItems}
          componentLookup={componentLookup}
          onAddItem={handleAddInvoiceItem}
          onRemoveItem={handleRemoveInvoiceItem}
          onItemChange={handleInvoiceItemChange}
          onSubmit={handleInvoiceSubmit}
          onGoToPayments={goToPaymentsForInvoice}
          focusOrderId={focusOrderId}
          prefillOrderId={prefillInvoiceOrderId}
          onClearFocus={() => setFocusOrderId('')}
        />
      )}

      {/* Add/Edit component modal */}
      <AddComponentModal
        isOpen={showAddModal}
        editingComponent={editingComponent}
        selectedRequiredComponent={selectedRequiredComponent}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onClose={() => {
          setShowAddModal(false);
          setEditingComponent(null);
          setSelectedRequiredComponent(null);
        }}
      />
    </DashboardLayout>
  );
}

export default VendorDashboard;
