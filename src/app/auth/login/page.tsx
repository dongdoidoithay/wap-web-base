'use client';

import { useState } from 'react';
import Link from 'next/link';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('Login successful!');
      } else {
        setMessage(data.message || 'Login failed');
      }
    } catch (error) {
      setMessage('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-body-primary">
            Sign in to your account
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-surface shadow-md rounded-lg p-6">
            {message && (
              <div className={`mb-4 p-3 rounded ${
                message.includes('successful') 
                  ? 'bg-success/20 text-success border border-success/20' 
                  : 'bg-error/20 text-error border border-error/20'
              }`}>
                {message}
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
                placeholder="Enter your email"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-body-primary mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-body-secondary">
            Don't have an account?{' '}
            <Link href="/auth/register" className="font-medium text-link hover:text-link-hover transition-colors">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
