import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * OTP Modal Component
 * Reusable modal for OTP verification with 6-digit input
 */
const OtpModal = ({ 
  isOpen, 
  onClose, 
  onVerify, 
  onResend,
  email,
  purpose = 'verification', // 'login' or 'profile-update' or 'verification'
  darkMode = false 
}) => {
  const [otp, setOtp] = useState(['', '', '', '']); // Changed to 4 digits
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen && resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, resendTimer]);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setOtp(['', '', '', '']); // Changed to 4 digits
      setError('');
      setResendTimer(60);
      setCanResend(false);
      // Focus first input
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only last character
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 3) { // Changed to 3 (0-3 for 4 digits)
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4); // Changed to 4
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(Array(4).fill('')).slice(0, 4); // Changed to 4
    setOtp(newOtp);
    
    // Focus last filled input or next empty
    const nextIndex = Math.min(pastedData.length, 3); // Changed to 3
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 4) { // Changed to 4
      setError('Please enter complete 4-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onVerify(otpString);
      // Success - modal will be closed by parent
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '']); // Changed to 4 digits
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    setLoading(true);
    setError('');
    
    try {
      await onResend();
      setOtp(['', '', '', '']); // Changed to 4 digits
      setResendTimer(60);
      setCanResend(false);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getPurposeText = () => {
    switch (purpose) {
      case 'login':
        return 'Login Verification';
      case 'profile-update':
        return 'Profile Update Verification';
      default:
        return 'OTP Verification';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className={`relative w-full max-w-md rounded-2xl shadow-2xl transform transition-all ${
          darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className={`absolute top-4 right-4 p-2 rounded-full transition ${
            darkMode
              ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
              : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
          }`}
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                darkMode ? 'bg-blue-900/30' : 'bg-blue-100'
              }`}
            >
              <span className="text-3xl">📧</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center mb-2">
            {getPurposeText()}
          </h2>

          {/* Description */}
          <p
            className={`text-center mb-6 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            We've sent a 4-digit OTP to{' '}
            <span className="font-semibold">{email}</span>
          </p>

          {/* OTP Input */}
          <div className="flex justify-center gap-2 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={loading}
                className={`w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } ${
                  digit
                    ? darkMode
                      ? 'border-blue-500'
                      : 'border-blue-500'
                    : ''
                } disabled:opacity-50`}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm text-center">
              {error}
            </div>
          )}

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={loading || otp.some((d) => !d)}
            className="w-full py-3 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          {/* Resend OTP */}
          <div className="text-center">
            <p
              className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Didn't receive the code?{' '}
              {canResend ? (
                <button
                  onClick={handleResend}
                  disabled={loading}
                  className="font-semibold text-blue-600 hover:text-blue-700 transition disabled:opacity-50"
                >
                  Resend OTP
                </button>
              ) : (
                <span className="font-semibold">
                  Resend in {resendTimer}s
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpModal;
