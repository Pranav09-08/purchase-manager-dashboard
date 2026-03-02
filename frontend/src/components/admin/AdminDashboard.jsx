
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../DashboardLayout';
import OverviewTab from './OverviewTab';
import ProductsTab from './ProductsTab';
import ComponentsTab from './ComponentsTab';
import RegistrationsTab from './RegistrationsTab';
import VendorComponentsTab from './VendorComponentsTab';
import PurchaseEnquiriesTab from './PurchaseEnquiriesTab';
import PurchaseQuotationsTab from './PurchaseQuotationsTab';
import PurchaseLoisTab from './PurchaseLoisTab';
import PurchaseOrdersTab from './PurchaseOrdersTab';
import PurchasePaymentsTab from './PurchasePaymentsTab';
import PaymentReceiptsTab from './PaymentReceiptsTab';
import VendorInvoicesTab from './VendorInvoicesTab';
import AnalyticsTab from './AnalyticsTab';
import PurchaseRequestsTab from './PurchaseRequestsTab';
import RegistrationDetailsModal from './RegistrationDetailsModal';

// Import admin APIs
import { listRegistrations, approveRegistration, rejectRegistration } from '../../api/admin/registrations.api';
import { activateComponent, listAllVendorComponents, listComponentVendors, listProductComponents } from '../../api/admin/components.api';
import { listEnquiries } from '../../api/admin/enquiries.api';
import { getAnalytics } from '../../api/admin/analytics.api';
import adminProductsApi from '../../api/admin/products.api';

const tabComponents = {
  overview: OverviewTab,
  products: ProductsTab,
  components: ComponentsTab,
  registrations: RegistrationsTab,
  'vendor-products': VendorComponentsTab,
  'purchase-enquiries': PurchaseEnquiriesTab,
  'purchase-quotations': PurchaseQuotationsTab,
  'purchase-lois': PurchaseLoisTab,
  'purchase-orders': PurchaseOrdersTab,
  'purchase-payments': PurchasePaymentsTab,
  'payment-receipts': PaymentReceiptsTab,
  'vendor-invoices': VendorInvoicesTab,
  analytics: AnalyticsTab,
  'purchase-requests': PurchaseRequestsTab,
};

function AdminDashboard(props) {
  const { currentUser, idToken, getIdToken, loading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [registrationFilter, setRegistrationFilter] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  
  // Data states
  const [registrations, setRegistrations] = useState([]);
  const [vendorComponents, setVendorComponents] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productComponents, setProductComponents] = useState([]);
  const [vendorCounts, setVendorCounts] = useState({});
  const [autoSelectFirstComponent, setAutoSelectFirstComponent] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [overviewStats, setOverviewStats] = useState({
    totalVendors: 0,
    approvedVendors: 0,
    pendingVendors: 0,
    rejectedVendors: 0,
    totalVendorComponents: 0,
    recentRegistrations: [],
  });

  const getStoredAdmin = () => {
    try {
      return JSON.parse(localStorage.getItem('adminUser') || '{}');
    } catch {
      return {};
    }
  };

  // Set admin from currentUser
  useEffect(() => {
    if (currentUser && !authLoading) {
      setAdmin(currentUser);
    }
  }, [currentUser, authLoading]);

  // Fetch all dashboard data
  useEffect(() => {
    if (!currentUser || authLoading) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        let token = idToken;
        if (!token) {
          token = await getIdToken(true);
        }

        if (!token || token.split('.').length !== 3) {
          throw new Error('Invalid authentication token');
        }

        // Fetch all data in parallel
        const [
          registrationsData,
          vendorComponentsData,
          enquiriesData,
          productsData,
          analyticsData,
        ] = await Promise.all([
          listRegistrations(token).catch(() => []),
          listAllVendorComponents(token).catch(() => ({ components: [] })),
          listEnquiries(token).catch(() => ({ enquiries: [] })),
          adminProductsApi.list(token).catch(() => ({ products: [] })),
          getAnalytics(token).catch(() => null),
        ]);

        const regs = Array.isArray(registrationsData) ? registrationsData : [];
        setRegistrations(regs);
        setVendorComponents(vendorComponentsData.components || []);
        setEnquiries(enquiriesData.enquiries || []);
        setProducts(productsData.products || productsData || []);
        setAnalytics(analyticsData);

        // Calculate overview stats
        const recentRegs = regs
          .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
          .slice(0, 5);

        setOverviewStats({
          totalVendors: regs.length,
          approvedVendors: regs.filter(r => r.status === 'approved').length,
          pendingVendors: regs.filter(r => r.status === 'pending').length,
          rejectedVendors: regs.filter(r => r.status === 'rejected').length,
          totalVendorComponents: (vendorComponentsData.components || []).length,
          recentRegistrations: recentRegs,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, idToken, authLoading]);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail && e.detail.page) {
        setCurrentPage(e.detail.page);
      }
    };
    window.addEventListener('dashboardPageChange', handler);
    return () => window.removeEventListener('dashboardPageChange', handler);
  }, []);

  // Navigation handlers
  const handleGoToRegistrations = () => {
    setCurrentPage('registrations');
  };

  const handleGoToVendorComponents = () => {
    setCurrentPage('vendor-products');
  };

  const refreshProducts = async (tokenOverride) => {
    const token = tokenOverride || idToken || await getIdToken(true);
    const productsData = await adminProductsApi.list(token);
    const list = productsData?.products || productsData || [];
    setProducts(list);
    return list;
  };

  const refreshVendorComponents = async (tokenOverride) => {
    const token = tokenOverride || idToken || await getIdToken(true);
    const vendorComponentsData = await listAllVendorComponents(token);
    const components = vendorComponentsData?.components || [];
    setVendorComponents(components);
    return components;
  };

  const getProductId = (product) => product?.productId || product?.productid;

  const loadComponentsForProduct = async (product, tokenOverride) => {
    const productId = getProductId(product);
    if (!productId) {
      setProductComponents([]);
      setVendorCounts({});
      return;
    }

    const token = tokenOverride || idToken || await getIdToken(true);
    const componentsResponse = await listProductComponents(token, productId);
    const components = componentsResponse?.components || [];
    setProductComponents(components);

    const vendorCountPairs = await Promise.all(
      components.map(async (component) => {
        const componentCode = component.component_code || component.componentCode;
        const componentName = component.component_name || component.name;
        try {
          const response = await listComponentVendors(token, {
            componentCode,
            componentName,
          });
          const count = (response?.vendors || []).length;
          return [componentCode || componentName, count];
        } catch {
          return [componentCode || componentName, 0];
        }
      })
    );

    const counts = vendorCountPairs.reduce((acc, [key, count]) => {
      if (key) acc[key] = count;
      return acc;
    }, {});

    setVendorCounts(counts);
  };

  // Registration handlers
  const handleRegistrationFilterChange = (filter) => {
    setRegistrationFilter(filter);
  };

  const handleViewRegistration = (registration) => {
    setSelectedRegistration(registration);
  };

  const handleCloseRegistrationModal = () => {
    setSelectedRegistration(null);
  };

  const handleApproveRegistration = async (vendorId) => {
    try {
      const token = idToken || await getIdToken(true);
      await approveRegistration(token, vendorId);
      
      // Refresh registrations
      const data = await listRegistrations(token);
      const regs = Array.isArray(data) ? data : [];
      setRegistrations(regs);
      
      // Recalculate overview stats
      const recentRegs = regs
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        .slice(0, 5);
      
      setOverviewStats({
        totalVendors: regs.length,
        approvedVendors: regs.filter(r => r.status === 'approved').length,
        pendingVendors: regs.filter(r => r.status === 'pending').length,
        rejectedVendors: regs.filter(r => r.status === 'rejected').length,
        totalVendorComponents: vendorComponents.length,
        recentRegistrations: recentRegs,
      });
      
      // Close modal if open
      setSelectedRegistration(null);
      
      alert('Registration approved successfully');
    } catch (error) {
      alert(error.response?.data?.error || error.message || 'Failed to approve registration');
    }
  };

  const handleRejectRegistration = async (registration) => {
    try {
      const token = idToken || await getIdToken(true);
      await rejectRegistration(token, registration.vendor_id);
      
      // Refresh registrations
      const data = await listRegistrations(token);
      const regs = Array.isArray(data) ? data : [];
      setRegistrations(regs);
      
      // Recalculate overview stats
      const recentRegs = regs
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        .slice(0, 5);
      
      setOverviewStats({
        totalVendors: regs.length,
        approvedVendors: regs.filter(r => r.status === 'approved').length,
        pendingVendors: regs.filter(r => r.status === 'pending').length,
        rejectedVendors: regs.filter(r => r.status === 'rejected').length,
        totalVendorComponents: vendorComponents.length,
        recentRegistrations: recentRegs,
      });
      
      // Close modal if open
      setSelectedRegistration(null);
      
      alert('Registration rejected successfully');
    } catch (error) {
      alert(error.response?.data?.error || error.message || 'Failed to reject registration');
    }
  };

  // Product handlers
  const handleSelectProduct = (product) => {
    const resolvedProduct = typeof product === 'string'
      ? products.find((p) => getProductId(p) === product)
      : product;

    if (!resolvedProduct) {
      setSelectedProduct(null);
      setProductComponents([]);
      setVendorCounts({});
      return;
    }

    setSelectedProduct(resolvedProduct);
    setCurrentPage('components');
    setAutoSelectFirstComponent(false);

    loadComponentsForProduct(resolvedProduct).catch((error) => {
      console.error('Error loading product components:', error);
      setProductComponents([]);
      setVendorCounts({});
    });
  };

  const handleViewVendors = (product) => {
    const resolvedProduct = typeof product === 'string'
      ? products.find((p) => getProductId(p) === product)
      : product;

    if (!resolvedProduct) return;

    setSelectedProduct(resolvedProduct);
    setCurrentPage('components');
    setAutoSelectFirstComponent(true);

    loadComponentsForProduct(resolvedProduct).catch((error) => {
      console.error('Error loading product components for vendor view:', error);
      setProductComponents([]);
      setVendorCounts({});
      setAutoSelectFirstComponent(false);
    });
  };

  const handleCreateProduct = async (payload) => {
    try {
      const token = idToken || await getIdToken(true);
      const adminUser = getStoredAdmin();
      const fallbackCompanyId = products[0]?.companyId;
      const companyId = payload.companyId || adminUser.companyId || fallbackCompanyId;

      if (!companyId) {
        alert('Company ID not found for admin. Please contact support.');
        return;
      }

      const requestPayload = {
        ...payload,
        companyId,
      };

      await adminProductsApi.create(token, requestPayload);
      await refreshProducts(token);
      alert('Product created successfully');
    } catch (error) {
      alert(error.response?.data?.error || error.message || 'Failed to create product');
    }
  };

  const handleUpdateProduct = async (productId, payload) => {
    try {
      const token = idToken || await getIdToken(true);
      await adminProductsApi.update(token, productId, payload);
      const updated = await refreshProducts(token);

      const stillSelected = updated.find((p) => getProductId(p) === getProductId(selectedProduct));
      if (stillSelected) {
        setSelectedProduct(stillSelected);
      }

      alert('Product updated successfully');
    } catch (error) {
      alert(error.response?.data?.error || error.message || 'Failed to update product');
    }
  };

  const handleDeleteProduct = async (product) => {
    const productId = getProductId(product);
    if (!productId) return;
    if (!window.confirm('Delete this product?')) return;

    try {
      const token = idToken || await getIdToken(true);
      await adminProductsApi.remove(token, productId);
      const updated = await refreshProducts(token);

      if (selectedProduct && getProductId(selectedProduct) === productId) {
        setSelectedProduct(null);
        setProductComponents([]);
        setVendorCounts({});
      }

      if (!updated.length) {
        setCurrentPage('products');
      }

      alert('Product deleted successfully');
    } catch (error) {
      alert(error.response?.data?.error || error.message || 'Failed to delete product');
    }
  };

  const handleToggleComponentActive = async (component) => {
    const componentId = component?.componentId || component?.componentid;
    if (!componentId || !selectedProduct) return;

    try {
      const token = idToken || await getIdToken(true);
      const nextActive = !(component?.active ?? true);
      await activateComponent(token, componentId, nextActive);
      await loadComponentsForProduct(selectedProduct, token);
      alert(nextActive ? 'Component activated successfully' : 'Component deactivated successfully');
    } catch (error) {
      alert(error.response?.data?.error || error.message || 'Failed to update component status');
    }
  };

  const TabComponent = tabComponents[currentPage] || OverviewTab;

  // Calculate notification counts
  const registrationsCount = registrations.filter(r => r.status === 'pending').length;
  const vendorProductsCount = vendorComponents.filter(c => c.status === 'pending').length;

  // Filter registrations
  const filteredRegistrations = registrationFilter
    ? registrations.filter(r => r.status === registrationFilter)
    : registrations;

  // Prepare user profile data
  const displayName = admin?.name || admin?.email || currentUser?.email || 'Admin';
  const displayEmail = admin?.email || currentUser?.email || '';

  if (authLoading || loading) {
    return (
      <DashboardLayout 
        userType="admin" 
        currentPage={currentPage}
        userName={displayName}
        userProfile={{
          name: displayName,
          role: 'Purchase Manager',
          email: displayEmail,
        }}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-600">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      userType="admin" 
      currentPage={currentPage}
      userName={displayName}
      userProfile={{
        name: displayName,
        role: 'Purchase Manager',
        email: displayEmail,
      }}
      registrationsCount={registrationsCount}
      vendorProductsCount={vendorProductsCount}
    >
      <TabComponent 
        {...props}
        admin={admin}
        loading={loading}
        registrations={filteredRegistrations}
        filter={registrationFilter}
        onFilterChange={handleRegistrationFilterChange}
        onView={handleViewRegistration}
        onApprove={handleApproveRegistration}
        onReject={handleRejectRegistration}
        products={products}
        selectedProduct={selectedProduct}
        components={productComponents}
        vendorCounts={vendorCounts}
        autoSelectFirstComponent={autoSelectFirstComponent}
        onAutoSelectConsumed={() => setAutoSelectFirstComponent(false)}
        onSelectProduct={handleSelectProduct}
        onCreateProduct={handleCreateProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onActivateComponent={handleToggleComponentActive}
        onViewVendors={handleViewVendors}
        vendorComponents={vendorComponents}
        onRefresh={refreshVendorComponents}
        enquiries={enquiries}
        analytics={analytics}
        data={analytics}
        overviewStats={overviewStats}
        onGoToRegistrations={handleGoToRegistrations}
        onGoToVendorComponents={handleGoToVendorComponents}
      />
      
      <RegistrationDetailsModal
        selectedRegistration={selectedRegistration}
        onClose={handleCloseRegistrationModal}
        onApprove={handleApproveRegistration}
        onReject={() => handleRejectRegistration(selectedRegistration)}
      />
    </DashboardLayout>
  );
}

export default AdminDashboard;
