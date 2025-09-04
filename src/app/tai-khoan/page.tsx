'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SEOHead } from '@/components/seo-head'; // Added SEOHead import
import { useDomain } from '@/hooks/use-domain'; // Added useDomain import

const DashboardPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const domainConfig = useDomain(); // Added domainConfig

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/verify');
        const data = await response.json();
        
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          router.push('/auth/login?redirect=/dashboard');
        }
      } catch (error) {
        router.push('/auth/login?redirect=/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/auth/login');
    }
  };

  if (isLoading) {
    return (
      <>
        {/* Added SEOHead for loading state */}
        <SEOHead 
          title="Đang tải..."
          description="Đang tải thông tin tài khoản"
        />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-pulse">
            <div className="h-8 w-32 bg-primary/20 rounded mb-4"></div>
            <div className="h-4 w-48 bg-primary/10 rounded"></div>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <>
      {/* Added SEOHead for dashboard page */}
      <SEOHead 
        title={`Dashboard - ${domainConfig?.name || 'Trang cá nhân'}`}
        description="Quản lý tài khoản và cài đặt cá nhân"
        canonical={`https://${domainConfig?.domain || 'localhost'}/tai-khoan`}
      />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-surface shadow border-b border-default">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-body-primary">Dashboard</h1>
              <div className="flex items-center space-x-4">
                <span className="text-body-secondary">Welcome, {user.username}!</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-error hover:bg-error/90 rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Info Card */}
            <div className="bg-surface rounded-lg shadow-md p-6 border border-default">
              <h2 className="text-lg font-semibold text-body-primary mb-4">User Information</h2>
              <div className="space-y-2">
                <div>
                  <span className="text-body-secondary">Email:</span>
                  <span className="ml-2 text-body-primary">{user.email}</span>
                </div>
                <div>
                  <span className="text-body-secondary">Username:</span>
                  <span className="ml-2 text-body-primary">{user.username}</span>
                </div>
                <div>
                  <span className="text-body-secondary">Role:</span>
                  <span className="ml-2 text-body-primary capitalize">{user.role || 'User'}</span>
                </div>
                <div>
                  <span className="text-body-secondary">Member since:</span>
                  <span className="ml-2 text-body-primary">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-surface rounded-lg shadow-md p-6 border border-default">
              <h2 className="text-lg font-semibold text-body-primary mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link 
                  href="/profile" 
                  className="block w-full text-left px-4 py-2 text-sm text-body-primary bg-background hover:bg-primary/10 rounded-md border border-default transition-colors"
                >
                  Edit Profile
                </Link>
                <Link 
                  href="/settings" 
                  className="block w-full text-left px-4 py-2 text-sm text-body-primary bg-background hover:bg-primary/10 rounded-md border border-default transition-colors"
                >
                  Account Settings
                </Link>
                <Link 
                  href="/admin" 
                  className="block w-full text-left px-4 py-2 text-sm text-body-primary bg-background hover:bg-primary/10 rounded-md border border-default transition-colors"
                >
                  Admin Panel
                </Link>
              </div>
            </div>

            {/* Statistics Card */}
            <div className="bg-surface rounded-lg shadow-md p-6 border border-default">
              <h2 className="text-lg font-semibold text-body-primary mb-4">Account Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-body-secondary">Login Count:</span>
                  <span className="text-primary font-semibold">1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-secondary">Last Login:</span>
                  <span className="text-body-primary">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Just now'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-secondary">Email Verified:</span>
                  <span className={`font-semibold ${user.isEmailVerified ? 'text-success' : 'text-warning'}`}>
                    {user.isEmailVerified ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="mt-8 bg-surface rounded-lg shadow-md p-6 border border-default">
            <h2 className="text-xl font-semibold text-body-primary mb-4">
              🎉 Welcome to your Dashboard!
            </h2>
            <p className="text-body-secondary mb-4">
              You have successfully logged in to your account. This is a protected route that requires authentication.
              From here, you can manage your profile, view your account information, and access various features.
            </p>
            <div className="flex space-x-4">
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md transition-colors"
              >
                Go to Homepage
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 text-sm font-medium text-body-primary bg-background hover:bg-primary/10 rounded-md border border-default transition-colors"
              >
                Create Another Account
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default DashboardPage;