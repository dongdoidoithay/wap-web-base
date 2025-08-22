'use client';

import { useState, useEffect } from 'react';
import { DomainConfig, updateDomainConfig, deleteDomain, addDomain } from '../../../lib/domain-config';

export default function DomainAdmin() {
  const [domains, setDomains] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [config, setConfig] = useState<DomainConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [newConfig, setNewConfig] = useState<Partial<DomainConfig>>({
    name: '',
    description: '',
    logo: '🏷️',
    theme: { primaryColor: '#10B981', secondaryColor: '#059669' },
    seo: { title: '', description: '', keywords: [], ogImage: '/og.jpg' },
    content: { categories: [], featuredArticles: [] },
    social: {}
  });

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      const response = await fetch('/api/domains');
      const data = await response.json();
      setDomains(data.domains);
    } catch (error) {
      console.error('Error fetching domains:', error);
    }
  };

  const fetchDomainConfig = async (hostname: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/domains?hostname=${hostname}`);
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Error fetching domain config:', error);
    } finally {
      setLoading(false);
    }
  };

  const reloadCache = async () => {
    try {
      await fetch('/api/domains/reload', { method: 'POST' });
    } catch (e) {
      console.error('Failed to refresh cache', e);
    }
  };

  const handleDomainChange = (hostname: string) => {
    setSelectedDomain(hostname);
    fetchDomainConfig(hostname);
  };

  const updateConfig = async (updatedConfig: DomainConfig) => {
    try {
      const success = await updateDomainConfig(selectedDomain, updatedConfig);
      if (success) {
        await reloadCache();
        alert('Cấu hình đã được cập nhật!');
        fetchDomainConfig(selectedDomain);
      } else {
        alert('Có lỗi xảy ra khi cập nhật cấu hình!');
      }
    } catch (error) {
      console.error('Error updating config:', error);
      alert('Có lỗi xảy ra khi cập nhật cấu hình!');
    }
  };

  const handleDeleteDomain = async (domain: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa domain ${domain}?`)) {
      return;
    }
    
    try {
      const success = await deleteDomain(domain);
      if (success) {
        await reloadCache();
        alert('Domain đã được xóa!');
        fetchDomains();
        if (selectedDomain === domain) {
          setSelectedDomain('');
          setConfig(null);
        }
      } else {
        alert('Có lỗi xảy ra khi xóa domain!');
      }
    } catch (error) {
      console.error('Error deleting domain:', error);
      alert('Có lỗi xảy ra khi xóa domain!');
    }
  };

  const handleAddDomain = async () => {
    if (!newDomain || !newConfig.name || !newConfig.description) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    
    try {
      const fullConfig: DomainConfig = {
        domain: newDomain,
        name: newConfig.name!,
        description: newConfig.description!,
        logo: newConfig.logo || '🏷️',
        theme: newConfig.theme || { primaryColor: '#10B981', secondaryColor: '#059669' },
        seo: {
          title: newConfig.seo?.title || newConfig.name!,
          description: newConfig.seo?.description || newConfig.description!,
          keywords: newConfig.seo?.keywords || [],
          ogImage: newConfig.seo?.ogImage || '/og.jpg',
          googleAnalyticsId: newConfig.seo?.googleAnalyticsId
        },
        content: {
          categories: newConfig.content?.categories || [],
          featuredArticles: newConfig.content?.featuredArticles || []
        },
        social: newConfig.social || {}
      };
      
      const success = await addDomain(newDomain, fullConfig);
      if (success) {
        await reloadCache();
        alert('Domain đã được thêm!');
        fetchDomains();
        setShowAddForm(false);
        setNewDomain('');
        setNewConfig({
          name: '',
          description: '',
          logo: '🏷️',
          theme: { primaryColor: '#10B981', secondaryColor: '#059669' },
          seo: { title: '', description: '', keywords: [], ogImage: '/og.jpg' },
          content: { categories: [], featuredArticles: [] },
          social: {}
        });
      } else {
        alert('Có lỗi xảy ra khi thêm domain!');
      }
    } catch (error) {
      console.error('Error adding domain:', error);
      alert('Có lỗi xảy ra khi thêm domain!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-green-700">Quản lý Domain</h1>
          <button
            onClick={reloadCache}
            className="bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700"
          >
            Refresh cache
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Domain List */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-green-700">Danh sách Domain</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 transition-colors"
              >
                {showAddForm ? 'Hủy' : 'Thêm Domain'}
              </button>
            </div>
            
            {/* Form thêm domain mới */}
            {showAddForm && (
              <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-md font-medium text-green-700 mb-3">Thêm Domain Mới</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Tên domain (ví dụ: newsite.com)"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Tên website"
                    value={newConfig.name}
                    onChange={(e) => setNewConfig({ ...newConfig, name: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                  <textarea
                    placeholder="Mô tả website"
                    value={newConfig.description}
                    onChange={(e) => setNewConfig({ ...newConfig, description: e.target.value })}
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                  <button
                    onClick={handleAddDomain}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700 transition-colors"
                  >
                    Thêm Domain
                  </button>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              {domains.map((domain) => (
                <div key={domain} className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDomainChange(domain)}
                    className={`flex-1 text-left p-3 rounded-lg border transition-colors ${
                      selectedDomain === domain
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {domain}
                  </button>
                  {domain !== 'example.com' && (
                    <button
                      onClick={() => handleDeleteDomain(domain)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Xóa domain"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Domain Config */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-600">Đang tải...</div>
              </div>
            ) : config ? (
              <div>
                <h2 className="text-lg font-semibold mb-4 text-green-700">
                  Cấu hình: {config.domain}
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-1">
                      Tên website
                    </label>
                    <input
                      type="text"
                      value={config.name}
                      onChange={(e) => setConfig({ ...config, name: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-1">
                      Mô tả
                    </label>
                    <textarea
                      value={config.description}
                      onChange={(e) => setConfig({ ...config, description: e.target.value })}
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-1">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      value={config.seo.title}
                      onChange={(e) => setConfig({
                        ...config,
                        seo: { ...config.seo, title: e.target.value }
                      })}
                      className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-1">
                      SEO Description
                    </label>
                    <textarea
                      value={config.seo.description}
                      onChange={(e) => setConfig({
                        ...config,
                        seo: { ...config.seo, description: e.target.value }
                      })}
                      rows={2}
                      className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-1">
                      Google Analytics ID
                    </label>
                    <input
                      type="text"
                      value={config.seo.googleAnalyticsId || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        seo: { ...config.seo, googleAnalyticsId: e.target.value }
                      })}
                      className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:bg-white"
                      placeholder="GA_MEASUREMENT_ID"
                    />
                  </div>

                  <button
                    onClick={() => updateConfig(config)}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Cập nhật cấu hình
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-600 h-64 flex items-center justify-center">
                Chọn một domain để xem cấu hình
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 