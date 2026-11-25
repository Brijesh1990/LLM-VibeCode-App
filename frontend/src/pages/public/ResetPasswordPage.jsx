import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Lock, KeyRound } from 'lucide-react';
import { authService } from '../../services/authService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.resetPassword({ token, new_password: newPassword });
      toast.success(res.message || 'Password reset complete!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid or expired reset token.');
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
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Set New Password</h1>
          <p className="text-xs text-slate-500 mt-1">
            Provide your reset token and choose a new password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Reset Token"
            required
            icon={KeyRound}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste reset token"
          />
          <Input
            label="New Password"
            type="password"
            required
            minLength={6}
            icon={Lock}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 6 characters"
          />
          <Button type="submit" loading={loading} className="w-full py-2.5">
            Reset Password
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <Link to="/login" className="text-xs font-semibold text-[#4F46E5] hover:underline">
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
