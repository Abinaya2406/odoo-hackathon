import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { validateEmail, validatePassword } from '../../utils/validators';
import { Mail, Lock, LogIn } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: 'alex.morgan@stocksense.io',
    password: 'password123',
    rememberMe: true
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailErr = validateEmail(formData.email);
    const passErr = validatePassword(formData.password);

    if (emailErr || passErr) {
      setErrors({ email: emailErr, password: passErr });
      return;
    }

    setSubmitting(true);
    try {
      await login(formData.email, formData.password);
      showSuccess('Welcome back! Successfully logged into StockSense.');
      navigate('/dashboard');
    } catch (err) {
      showError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold text-slate-900">Sign in to your account</h3>
        <p className="text-xs text-slate-500 mt-1">
          Access your inventory management control center
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="name@company.com"
          icon={Mail}
          required
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

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <span>Remember me</span>
          </label>

          <Link
            to="/forgot-password"
            className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          loading={submitting}
          icon={LogIn}
          className="w-full mt-2"
        >
          Sign In
        </Button>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
        Don't have a StockSense account?{' '}
        <Link
          to="/register"
          className="font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Create an Account
        </Link>
      </div>
    </div>
  );
};
