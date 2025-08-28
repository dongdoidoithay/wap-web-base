'use client';

import { useState } from 'react';
import Link from 'next/link';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setErrors({});

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('Registration successful! You can now sign in.');
        setFormData({ email: '', username: '', password: '', confirmPassword: '' });
      } else {
        if (data.errors) {
          setErrors(data.errors);
        }
        setMessage(data.message || 'Registration failed');
      }
    } catch (error) {
      setMessage('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-body-primary">
            Create your account
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
                Email address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
                  errors.email ? 'border-error' : 'border-default'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && <p className="mt-1 text-sm text-error">{errors.email}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-body-primary mb-2">
                Username *
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
                  errors.username ? 'border-error' : 'border-default'
                }`}
                placeholder="Choose a username"
              />
              {errors.username && <p className="mt-1 text-sm text-error">{errors.username}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-body-primary mb-2">
                Password *
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
                placeholder="Create a password"
              />
              {errors.password && <p className="mt-1 text-sm text-error">{errors.password}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-body-primary mb-2">
                Confirm Password *
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
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-error">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-body-secondary">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-link hover:text-link-hover transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
