// Application route map for vendor and admin flows
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VendorLogin from './pages/VendorLogin';
import VendorRegister from './pages/VendorRegister';
import AdminLogin from './pages/AdminLogin';
import VendorDashboard from './pages/VendorDashboard';
import AdminPanel from './pages/AdminPanel';
import Products from './pages/Products';

function App() {
  return (
    <Router>
      <Routes>
        {/* Vendor routes */}
        <Route path="/vendor/login" element={<VendorLogin />} />
        <Route path="/vendor/register" element={<VendorRegister />} />
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />
        <Route path="/vendor/products" element={<Products />} />
        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminPanel />} />
        {/* Default route */}
        <Route path="/" element={<VendorLogin />} />
      </Routes>
    </Router>
  );
}

export default App;
