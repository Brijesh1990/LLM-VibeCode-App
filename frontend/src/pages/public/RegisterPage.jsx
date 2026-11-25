import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { ROLE_HOME_PATHS } from '../../constants';
import RegisterForm from '../../components/forms/RegisterForm';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      const newUser = await register(values);
      toast.success(`Account created! Welcome, ${newUser.full_name}`);
      navigate(ROLE_HOME_PATHS[newUser.role] || '/student/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed. Please check your details.');
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
          <h1 className="text-2xl font-extrabold text-slate-900">Create Institute Account</h1>
          <p className="text-xs text-slate-500 mt-1">
            Enroll in enterprise cohorts and track your academic progress
          </p>
        </div>

        <RegisterForm onSubmit={handleRegister} loading={loading} />

        <div className="text-center text-xs font-semibold text-slate-500 mt-5 pt-4 border-t border-slate-100">
          Already have an account?{' '}
          <Link to="/login" className="text-[#4F46E5] hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
