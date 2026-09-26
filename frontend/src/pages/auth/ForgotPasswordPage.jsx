import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { validateEmail } from '../../utils/validators';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('alex.morgan@stocksense.io');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }

    setSubmitting(true);
    try {
      await authService.forgotPassword(email);
      showSuccess('Verification code sent to your email address!');
      navigate('/verify-otp');
    } catch (err) {
      showError(err.message || 'Failed to send OTP.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold text-slate-900">Forgot Password</h3>
        <p className="text-xs text-slate-500 mt-1">
          Enter your email address to receive a 6-digit verification OTP.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Registered Email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          error={error}
          placeholder="name@company.com"
          icon={Mail}
          required
        />

        <Button
          type="submit"
          variant="primary"
          loading={submitting}
          icon={Send}
          className="w-full mt-2"
        >
          Send OTP Code
        </Button>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-100 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </div>
  );
};
