import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { validatePassword } from '../../utils/validators';
import { Lock, CheckCircle2 } from 'lucide-react';

export const ResetPasswordPage = () => {
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const passErr = validatePassword(formData.password);
    const newErrors = {};

    if (passErr) newErrors.password = passErr;
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await authService.resetPassword(formData.password);
      showSuccess('Password reset successfully! Please log in with your new password.');
      navigate('/login');
    } catch (err) {
      showError(err.message || 'Failed to reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold text-slate-900">Reset Your Password</h3>
        <p className="text-xs text-slate-500 mt-1">
          Create a new strong password for your StockSense account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="New Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="••••••••"
          icon={Lock}
          required
        />

        <Input
          label="Confirm New Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          placeholder="••••••••"
          icon={Lock}
          required
        />

        <Button
          type="submit"
          variant="primary"
          loading={submitting}
          icon={CheckCircle2}
          className="w-full mt-2"
        >
          Update Password
        </Button>
      </form>
    </div>
  );
};
