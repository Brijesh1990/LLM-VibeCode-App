import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Save, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import PageHeader from '../../components/common/PageHeader';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [profile, setProfile] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bio: user?.bio || '',
    department: user?.department || '',
    specialization: user?.specialization || '',
  });
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await authService.updateProfile(profile);
      await refreshProfile();
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    try {
      await authService.changePassword(passwords);
      setPasswords({ current_password: '', new_password: '' });
      toast.success('Password changed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Password update failed.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="My Profile & Security Settings"
        subtitle="Manage your personal information, academic bio, and account password"
      />

      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 flex items-center gap-4">
        <Avatar name={user?.full_name} size="xl" />
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-indigo-50 text-[#4F46E5]">
            {user?.role}
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 mt-1">{user?.full_name}</h3>
          <p className="text-xs text-slate-500">{user?.email}</p>
        </div>
      </div>

      <form
        onSubmit={handleProfileSave}
        className="bg-white rounded-2xl p-6 border border-slate-200/80 space-y-4"
      >
        <h3 className="text-base font-bold text-slate-900">Personal Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            required
            value={profile.full_name}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
          />
          <Input
            label="Phone Number"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          />
        </div>
        <Input
          label="Address / Location"
          value={profile.address}
          onChange={(e) => setProfile({ ...profile, address: e.target.value })}
        />
        {user?.role === 'instructor' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Department"
              value={profile.department}
              onChange={(e) => setProfile({ ...profile, department: e.target.value })}
            />
            <Input
              label="Specialization"
              value={profile.specialization}
              onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
            />
          </div>
        )}
        <Textarea
          label="Bio"
          rows={3}
          value={profile.bio}
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
        />
        <div className="flex justify-end">
          <Button type="submit" loading={savingProfile} icon={Save}>
            Save Profile Changes
          </Button>
        </div>
      </form>

      <form
        onSubmit={handlePasswordChange}
        className="bg-white rounded-2xl p-6 border border-slate-200/80 space-y-4"
      >
        <h3 className="text-base font-bold text-slate-900">Change Account Password</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Current Password"
            type="password"
            required
            value={passwords.current_password}
            onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
          />
          <Input
            label="New Password (Min 6 chars)"
            type="password"
            required
            minLength={6}
            value={passwords.new_password}
            onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="secondary" loading={savingPassword} icon={Lock}>
            Update Password
          </Button>
        </div>
      </form>
    </div>
  );
}
