'use client';

import { useState } from 'react';
import { DomainConfig } from '@/lib/domain-config';
import { getAllApiEndpoints } from '@/lib/dynamic-routes';

interface ApiEndpointsDisplayProps {
  config: DomainConfig;
  domain: string;
}

export function ApiEndpointsDisplay({ config, domain }: ApiEndpointsDisplayProps) {
  const [showEndpoints, setShowEndpoints] = useState(false);
  const endpoints = getAllApiEndpoints(config);

  return (
    <div className="bg-surface border border-light rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-body-primary">API Endpoints</h3>
        <button
          onClick={() => setShowEndpoints(!showEndpoints)}
          className="text-sm text-link hover:text-link-hover transition-colors"
        >
          {showEndpoints ? 'Ẩn' : 'Hiện'} Endpoints
        </button>
      </div>

      {showEndpoints && (
        <div className="space-y-3">
          {/* API Base URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-info/10 rounded-lg border border-info/20">
              <div className="text-sm font-medium text-info">Tiếng Việt</div>
              <div className="text-xs text-body-secondary font-mono">{config.api.vietnamese}</div>
            </div>
            <div className="p-3 bg-success/10 rounded-lg border border-success/20">
              <div className="text-sm font-medium text-success">English</div>
              <div className="text-xs text-body-secondary font-mono">{config.api.english}</div>
            </div>
          </div>

          {/* Endpoints List */}
          <div className="space-y-2">
            {endpoints.map((endpoint, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  endpoint.language === 'vi' ? 'bg-info/10 border-info/20' : 'bg-success/10 border-success/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        endpoint.method === 'GET' ? 'bg-success/20 text-success' :
                        endpoint.method === 'POST' ? 'bg-info/20 text-info' :
                        endpoint.method === 'PUT' ? 'bg-warning/20 text-warning' :
                        'bg-error/20 text-error'
                      }`}>
                        {endpoint.method}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded ${
                        endpoint.language === 'vi' ? 'bg-info/20 text-info' : 'bg-success/20 text-success'
                      }`}>
                        {endpoint.language === 'vi' ? 'VI' : 'EN'}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-sm">{endpoint.path}</div>
                    <div className="mt-1 text-xs text-muted">{endpoint.description}</div>
                  </div>
                  
                  {/* Test Button */}
                  <button
                    onClick={() => testEndpoint(endpoint.path)}
                    className="ml-3 px-3 py-1 text-xs bg-surface hover:bg-primary/10 text-body-secondary hover:text-primary rounded border border-light transition-colors"
                  >
                    Test
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="pt-4 border-t border-light">
            <div className="flex gap-2">
              <button
                onClick={() => testEndpoint(config.api.vietnamese + '/manga')}
                className="px-3 py-2 text-sm bg-info text-white rounded hover:bg-info/90 transition-colors"
              >
                Test VI API
              </button>
              <button
                onClick={() => testEndpoint(config.api.english + '/manga')}
                className="px-3 py-2 text-sm bg-success text-white rounded hover:bg-success/90 transition-colors"
              >
                Test EN API
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Hàm test endpoint
async function testEndpoint(endpoint: string) {
  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    
    console.log(`API Test - ${endpoint}:`, data);
    
    if (response.ok) {
      alert(`✅ API ${endpoint} hoạt động tốt!\n\nResponse: ${JSON.stringify(data, null, 2)}`);
    } else {
      alert(`❌ API ${endpoint} có lỗi!\n\nStatus: ${response.status}\nError: ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error(`Error testing endpoint ${endpoint}:`, error);
    alert(`❌ Không thể test API ${endpoint}!\n\nError: ${error}`);
  }
}
