import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import { reportService } from '../../services/reportService';
import PageHeader from '../../components/common/PageHeader';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState({
    institute_name: '',
    institute_tagline: '',
    institute_email: '',
    institute_phone: '',
    institute_address: '',
    currency_symbol: '$',
    allow_public_registration: 'true',
    certificate_completion_threshold: '75',
    attendance_minimum_threshold: '75',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    reportService.getSettings().then((res) => {
      if (res.settings) setSettings((prev) => ({ ...prev, ...res.settings }));
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await reportService.updateSettings(settings);
      toast.success('Institute system settings updated in MySQL!');
    } catch {
      toast.error('Failed to save system settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="System Settings & Academic Policies"
        subtitle="Configure institute identity, academic thresholds, and platform parameters"
      />

      <form
        onSubmit={handleSave}
        className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Institute Official Name"
            value={settings.institute_name}
            onChange={(e) => setSettings({ ...settings, institute_name: e.target.value })}
          />
          <Input
            label="Institute Tagline"
            value={settings.institute_tagline}
            onChange={(e) => setSettings({ ...settings, institute_tagline: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Official Contact Email"
            value={settings.institute_email}
            onChange={(e) => setSettings({ ...settings, institute_email: e.target.value })}
          />
          <Input
            label="Contact Phone"
            value={settings.institute_phone}
            onChange={(e) => setSettings({ ...settings, institute_phone: e.target.value })}
          />
        </div>

        <Input
          label="Campus Address"
          value={settings.institute_address}
          onChange={(e) => setSettings({ ...settings, institute_address: e.target.value })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Certificate Completion Threshold (%)"
            type="number"
            value={settings.certificate_completion_threshold}
            onChange={(e) =>
              setSettings({ ...settings, certificate_completion_threshold: e.target.value })
            }
          />
          <Input
            label="Minimum Attendance Threshold (%)"
            type="number"
            value={settings.attendance_minimum_threshold}
            onChange={(e) =>
              setSettings({ ...settings, attendance_minimum_threshold: e.target.value })
            }
          />
          <Select
            label="Public Self-Registration"
            value={settings.allow_public_registration}
            onChange={(e) =>
              setSettings({ ...settings, allow_public_registration: e.target.value })
            }
          >
            <option value="true">Enabled</option>
            <option value="false">Disabled (Admin Only)</option>
          </Select>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <Button type="submit" loading={saving} icon={Save}>
            Save Institute Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
