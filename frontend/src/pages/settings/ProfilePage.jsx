import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { User, Mail, Phone, Shield, Camera, Save } from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateUserProfile } = useAuth();
  const { showSuccess } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || 'Alex Morgan',
    email: user?.email || 'alex.morgan@stocksense.io',
    phone: user?.phone || '+91 98765 43210',
    role: user?.role || 'Inventory Manager',
    department: user?.department || 'Operations & Supply Chain',
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      updateUserProfile(formData);
      showSuccess('Profile information updated successfully!');
      setSubmitting(false);
    }, 400);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">User Profile Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">Manage personal details, avatar photo, and account preferences</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Header */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
            <div className="relative group">
              <img
                src={formData.avatar}
                alt={formData.name}
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-blue-100 shadow-md"
              />
              <label className="absolute bottom-0 right-0 p-2 rounded-xl bg-blue-600 text-white shadow-lg cursor-pointer hover:bg-blue-700 transition-colors">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
              </label>
            </div>

            <div className="text-center sm:text-left">
              <h3 className="text-lg font-bold text-slate-900">{formData.name}</h3>
              <p className="text-xs font-semibold text-blue-600">{formData.role}</p>
              <p className="text-xs text-slate-500 mt-0.5">{formData.department}</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              icon={User}
              required
            />

            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
              required
            />

            <Input
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              icon={Phone}
            />

            <Input
              label="Department / Team"
              name="department"
              value={formData.department}
              onChange={handleChange}
              icon={Shield}
            />
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-slate-100">
            <Button type="submit" variant="primary" icon={Save} loading={submitting}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
