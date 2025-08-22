'use client';

import { useState, useEffect } from 'react';
import { DomainConfig } from '../../../lib/domain-config';

export default function DomainAdmin() {
  const [domains, setDomains] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [config, setConfig] = useState<DomainConfig | null>(null);
  const [loading, setLoading] = useState(false);

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

  const handleDomainChange = (hostname: string) => {
    setSelectedDomain(hostname);
    fetchDomainConfig(hostname);
  };

  const updateConfig = async (updatedConfig: DomainConfig) => {
    try {
      const response = await fetch('/api/domains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostname: selectedDomain,
          config: updatedConfig,
        }),
      });
      
      if (response.ok) {
        alert('Cấu hình đã được cập nhật!');
        fetchDomainConfig(selectedDomain);
      }
    } catch (error) {
      console.error('Error updating config:', error);
    }
  };

  return (
         <div className="min-h-screen bg-gray-50 p-4">
       <div className="max-w-4xl mx-auto">
         <h1 className="text-2xl font-bold mb-6 text-green-700">Quản lý Domain</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Domain List */}
                     <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
             <h2 className="text-lg font-semibold mb-4 text-green-700">Danh sách Domain</h2>
            <div className="space-y-2">
              {domains.map((domain) => (
                <button
                  key={domain}
                  onClick={() => handleDomainChange(domain)}
                                     className={`w-full text-left p-3 rounded-lg border transition-colors ${
                     selectedDomain === domain
                       ? 'border-green-500 bg-green-50'
                       : 'border-gray-200 hover:bg-gray-50'
                   }`}
                >
                  {domain}
                </button>
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