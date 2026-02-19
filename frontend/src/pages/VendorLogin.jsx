// Vendor authentication page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiUrl } from '../utils/api';

function VendorLogin() {
  const navigate = useNavigate();
  const { loginWithCustomToken, currentUser, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    contact_email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-redirect if already logged in
  useEffect(() => {
    if (!authLoading && currentUser) {
      navigate('/vendor/dashboard');
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

  // Authenticate vendor with Firebase (using custom token flow)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Step 1: Verify credentials with backend (gets custom token)
      const response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact_email: formData.contact_email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      console.log('✅ Login response received:', { message: data.message, hasCustomToken: !!data.customToken });

      // Step 2: Sign in to Firebase with custom token
      await loginWithCustomToken(data.customToken);

      console.log('✅ Firebase authentication successful');

      // Step 3: Store vendor info (optional, Firebase manages session)
      if (data.vendor) {
        localStorage.setItem('supplier', JSON.stringify(data.vendor));
      }

      // Navigate to dashboard
      navigate('/vendor/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-8 shadow-xl">
        <h1 className="text-2xl font-extrabold text-text-light">Vendor Login</h1>
        <p className="text-sm text-text-medium mt-1">Access your vendor dashboard</p>

        {error && (
          <div className="mt-4 p-3 bg-red-900 border border-red-700 text-red-200 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="contact_email" className="block text-sm font-semibold text-text-light mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="contact_email"
              name="contact_email"
              value={formData.contact_email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
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
              placeholder="Enter your password"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-text-light placeholder-slate-500 focus:outline-none focus:border-primary-blue"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-primary-indigo text-white rounded-lg hover:bg-indigo-600 font-semibold transition-colors disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 space-y-2 text-sm text-text-medium">
          <p>
            Don't have an account?{' '}
            <a className="text-text-light font-semibold hover:text-white" href="/vendor/register">
              Register here
            </a>
          </p>
          <p>
            <a className="text-text-light font-semibold hover:text-white" href="/admin/login">
              Admin Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default VendorLogin;
