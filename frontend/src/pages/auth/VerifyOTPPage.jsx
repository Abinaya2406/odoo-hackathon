import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/Button';
import { KeyRound, RotateCcw } from 'lucide-react';

export const VerifyOTPPage = () => {
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [timer, setTimer] = useState(30);
  const [submitting, setSubmitting] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      await authService.forgotPassword('alex.morgan@stocksense.io');
      setTimer(30);
      showSuccess('New 6-digit OTP sent to your email!');
    } catch {
      showError('Failed to resend OTP.');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      showError('Please enter all 6 digits of the OTP code.');
      return;
    }

    setSubmitting(true);
    try {
      await authService.verifyOtp(fullOtp);
      showSuccess('OTP verified successfully!');
      navigate('/reset-password');
    } catch (err) {
      showError(err.message || 'Invalid OTP code.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold text-slate-900">Enter Verification Code</h3>
        <p className="text-xs text-slate-500 mt-1">
          We sent a 6-digit code to alex.morgan@stocksense.io
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-6">
        <div className="flex items-center justify-center gap-2">
          {otp.map((digit, idx) => (
            <input
              key={`otp-digit-${idx}`}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-11 h-12 text-center text-lg font-bold rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            />
          ))}
        </div>

        <Button
          type="submit"
          variant="primary"
          loading={submitting}
          icon={KeyRound}
          className="w-full"
        >
          Verify OTP
        </Button>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
        Didn't receive the code?{' '}
        <button
          type="button"
          disabled={timer > 0}
          onClick={handleResend}
          className="font-bold text-blue-600 hover:text-blue-700 disabled:text-slate-400 inline-flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
        </button>
      </div>
    </div>
  );
};
