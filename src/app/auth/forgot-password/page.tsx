'use client';

import { useState } from 'react';
import Link from 'next/link';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('Password reset instructions sent to your email.');
        if (data.resetToken) {
          setResetToken(data.resetToken);
        }
        setEmail('');
      } else {
        setMessage(data.message || 'Failed to send reset instructions');
      }
    } catch (error) {
      setMessage('An error occurred during password reset request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-body-primary">
            Forgot your password?
          </h2>
          <p className="mt-2 text-center text-sm text-body-secondary">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-surface shadow-md rounded-lg p-6">
            {message && (
              <div className={`mb-4 p-3 rounded ${
                message.includes('sent') 
                  ? 'bg-success/20 text-success border border-success/20' 
                  : 'bg-error/20 text-error border border-error/20'
              }`}>
                {message}
              </div>
            )}

            {resetToken && process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-3 rounded bg-info/20 text-info border border-info/20">
                <p className="text-sm">
                  <strong>Development:</strong> Reset token is <code className="bg-background px-1 rounded">{resetToken}</code>
                </p>
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-body-primary mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="Enter your email address"
              />
              <p className="mt-1 text-xs text-body-secondary">
                We'll send password reset instructions to this email
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Sending instructions...' : 'Send Reset Instructions'}
            </button>
          </div>
        </form>

        <div className="text-center space-y-2">
          <p className="text-sm text-body-secondary">
            Remember your password?{' '}
            <Link href="/auth/login" className="font-medium text-link hover:text-link-hover transition-colors">
              Sign in here
            </Link>
          </p>
          <p className="text-sm text-body-secondary">
            Don't have an account?{' '}
            <Link href="/auth/register" className="font-medium text-link hover:text-link-hover transition-colors">
              Create account
            </Link>
          </p>
          {resetToken && (
            <p className="text-sm text-body-secondary">
              <Link 
                href={`/auth/reset-password?token=${resetToken}`} 
                className="font-medium text-success hover:text-success transition-colors"
              >
                Go to reset password (Development)
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;