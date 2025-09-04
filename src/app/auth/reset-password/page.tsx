'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SEOHead } from '@/components/seo-head'; // Added SEOHead import
import { useDomain } from '@/hooks/use-domain'; // Added useDomain import

const ResetPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    token: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const domainConfig = useDomain(); // Added domainConfig

  // Get token from URL
  useEffect(() => {
    const token = searchParams?.get('token');
    if (token) {
      setFormData(prev => ({ ...prev, token }));
      setTokenValid(true);
    } else {
      setTokenValid(false);
      setMessage('Invalid or missing reset token. Please request a new password reset.');
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!formData.token) {
      setMessage('Invalid reset token');
      return;
    }
    
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('Password reset successfully! Redirecting to login...');
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        setTimeout(() => {
          router.push('/auth/login?message=Password reset successfully');
        }, 2000);
      } else {
        setMessage(data.message || 'Failed to reset password');
      }
    } catch (error) {
      setMessage('An error occurred while resetting your password');
    } finally {
      setIsLoading(false);
    }
  };

  // Show error if token is invalid
  if (tokenValid === false) {
    return (
      <>
        {/* Added SEOHead for reset password page (invalid token) */}
        <SEOHead 
          title={`Đặt lại mật khẩu - ${domainConfig?.name || 'Trang web'}`}
          description="Đặt lại mật khẩu tài khoản của bạn"
          canonical={`https://${domainConfig?.domain || 'localhost'}/auth/reset-password`}
          noindex={true}
        />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md w-full space-y-8">
            <div>
              <h1 className="sr-only">Liên kết đặt lại mật khẩu không hợp lệ</h1>
            </div>
            <div className="bg-surface shadow-md rounded-lg p-6">
              <div className="mb-4 p-3 rounded bg-error/20 text-error border border-error/20">
                Invalid or expired reset token. Please request a new password reset.
              </div>
              <div className="text-center space-y-4">
                <Link 
                  href="/auth/forgot-password"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  Request New Reset
                </Link>
                <div>
                  <Link 
                    href="/auth/login" 
                    className="font-medium text-link hover:text-link-hover transition-colors"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Added SEOHead for reset password page */}
      <SEOHead 
        title={`Đặt lại mật khẩu - ${domainConfig?.name || 'Trang web'}`}
        description="Đặt lại mật khẩu tài khoản của bạn"
        canonical={`https://${domainConfig?.domain || 'localhost'}/auth/reset-password`}
      />
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h1 className="sr-only">Đặt lại mật khẩu</h1>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-body-primary">
              Reset your password
            </h2>
            <p className="mt-2 text-center text-sm text-body-secondary">
              Enter your new password below.
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="bg-surface shadow-md rounded-lg p-6">
              {message && (
                <div className={`mb-4 p-3 rounded ${
                  message.includes('successfully') 
                    ? 'bg-success/20 text-success border border-success/20' 
                    : 'bg-error/20 text-error border border-error/20'
                }`}>
                  {message}
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-body-primary mb-2">
                  New Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
                    errors.password ? 'border-error' : 'border-default'
                  }`}
                  placeholder="Enter your new password"
                />
                {errors.password && <p className="mt-1 text-sm text-error">{errors.password}</p>}
                <p className="mt-1 text-xs text-body-secondary">
                  At least 8 characters with uppercase, lowercase, and number
                </p>
              </div>

              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-body-primary mb-2">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
                    errors.confirmPassword ? 'border-error' : 'border-default'
                  }`}
                  placeholder="Confirm your new password"
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-error">{errors.confirmPassword}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading || !tokenValid}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Resetting password...' : 'Reset Password'}
              </button>
            </div>
          </form>

          <div className="text-center space-y-2">
            <p className="text-sm text-body-secondary">
              Remember your password?{' '}
              <Link 
                href="/auth/login" 
                className="font-medium text-link hover:text-link-hover transition-colors"
              >
                Sign in here
              </Link>
            </p>
            <p className="text-sm text-body-secondary">
              Need a new reset link?{' '}
              <Link 
                href="/auth/forgot-password" 
                className="font-medium text-link hover:text-link-hover transition-colors"
              >
                Request again
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;