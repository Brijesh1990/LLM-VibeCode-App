import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ROLE_HOME_PATHS } from '../../constants';
import LoginForm from '../../components/forms/LoginForm';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const loggedUser = await login(values.email, values.password);
      toast.success(`Welcome back, ${loggedUser.full_name}!`);
      const redirectUrl = searchParams.get('redirect');
      if (redirectUrl) {
        navigate(redirectUrl, { replace: true });
      } else {
        navigate(ROLE_HOME_PATHS[loggedUser.role] || '/student/dashboard', { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
      <div
        data-aos="zoom-in"
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-md w-full p-8"
      >
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#4F46E5] via-[#8B5CF6] to-[#06B6D4] flex items-center justify-center text-white font-black text-lg shadow-md">
              NX
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">Sign In to NexusLMS</h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your Admin, Instructor, or Student learning portal
          </p>
        </div>

        <LoginForm onSubmit={handleLogin} loading={loading} />

        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mt-5 pt-4 border-t border-slate-100">
          <Link to="/forgot-password" className="hover:text-[#4F46E5]">
            Forgot Password?
          </Link>
          <Link to="/register" className="text-[#4F46E5] hover:underline">
            Create Account →
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link
            to="/verify-certificate/CERT-2026-01005"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"
          >
            <ShieldCheck className="w-4 h-4 text-[#16A34A]" /> Verify a Certificate Publicly
          </Link>
        </div>
      </div>
    </div>
  );
}
