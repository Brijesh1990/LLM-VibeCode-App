import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, KeyRound, ArrowLeft } from 'lucide-react';
import { authService } from '../../services/authService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [issuedToken, setIssuedToken] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      toast.success(res.message || 'Reset instructions generated.');
      if (res.reset_token) {
        setIssuedToken(res.reset_token);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Unable to process request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
      <div
        data-aos="zoom-in"
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-8"
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center mx-auto mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Forgot Password</h1>
          <p className="text-xs text-slate-500 mt-1">
            Enter your registered institute email to generate a secure reset token
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Registered Email Address"
            type="email"
            required
            placeholder="student@lms.com"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" loading={loading} className="w-full py-2.5">
            Generate Password Reset Token
          </Button>
        </form>

        {issuedToken && (
          <div className="mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
            <p className="font-bold text-emerald-900">Reset Token Generated (Valid 30 mins):</p>
            <code className="block mt-1.5 p-2 rounded-lg bg-white border border-emerald-200 font-mono text-emerald-800 break-all">
              {issuedToken}
            </code>
            <Button
              variant="success"
              size="sm"
              className="mt-3 w-full"
              onClick={() => navigate(`/reset-password?token=${encodeURIComponent(issuedToken)}`)}
            >
              Proceed to Reset Password →
            </Button>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#4F46E5]">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
