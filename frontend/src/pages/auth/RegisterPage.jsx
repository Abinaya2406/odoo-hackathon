import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { validateEmail, validatePassword, validateRequired } from '../../utils/validators';
import { User, Mail, Phone, Lock, UserPlus } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
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
    const newErrors = {};

    const nameErr = validateRequired(formData.fullName, 'Full Name');
    if (nameErr) newErrors.fullName = nameErr;

    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

    const passErr = validatePassword(formData.password);
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
      await register(formData);
      showSuccess('Account registered successfully! Welcome to StockSense.');
      navigate('/dashboard');
    } catch (err) {
      showError(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold text-slate-900">Create StockSense Account</h3>
        <p className="text-xs text-slate-500 mt-1">
          Get started with real-time SaaS inventory management
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          error={errors.fullName}
          placeholder="John Doe"
          icon={User}
          required
        />

        <Input
          label="Work Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="john@company.com"
          icon={Mail}
          required
        />

        <Input
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+91 98765 43210"
          icon={Phone}
        />

        <Input
          label="Password"
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
          label="Confirm Password"
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
          icon={UserPlus}
          className="w-full mt-2"
        >
          Create Account
        </Button>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
};
