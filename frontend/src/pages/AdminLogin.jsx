// Admin (purchase manager) login page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { useAuth } from '../contexts/AuthContext';

function AdminLogin() {
  const navigate = useNavigate();
  const { loginWithCustomToken, currentUser, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-redirect if already logged in
  useEffect(() => {
    if (!authLoading && currentUser) {
      navigate('/admin/dashboard');
    }
  }, [currentUser, authLoading, navigate]);

  // Controlled form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Firebase-based admin authentication
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Step 1: Verify credentials with backend (gets custom token)
      const { data } = await apiClient.post('/api/auth/admin-login', {
        email: formData.email,
        password: formData.password,
      });
      console.log('✅ Login response received:', { message: data.message, hasCustomToken: !!data.customToken });

      // Step 2: Sign in to Firebase with custom token
      await loginWithCustomToken(data.customToken);

      console.log('✅ Firebase authentication successful');

      // Step 3: Store admin info (optional, Firebase manages session)
      if (data.admin) {
        localStorage.setItem('adminUser', JSON.stringify(data.admin));
      }

      // Redirect to dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-8 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-text-light">Admin Login</h1>
            <p className="text-sm text-text-medium mt-1">Access the administration panel</p>
          </div>
          <div className="text-2xl">🛡️</div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-900 border border-red-700 text-red-200 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-text-light mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter email"
              autoComplete="email"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-text-light placeholder-slate-500 focus:outline-none focus:border-primary-blue"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-text-light mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter password"
              autoComplete="current-password"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-text-light placeholder-slate-500 focus:outline-none focus:border-primary-blue"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-primary-indigo text-white rounded-lg hover:bg-indigo-600 font-semibold transition-colors disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Login as Admin'}
          </button>
        </form>

        <div className="mt-6 text-sm text-text-medium">
          <a className="text-text-light font-semibold hover:text-white" href="/vendor/login">
            Back to Vendor Login
          </a>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
