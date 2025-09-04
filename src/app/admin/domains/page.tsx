'use client';

import { useState, useEffect } from 'react';
import { 
  getAllDomains, 
  getDomainConfig, 
  updateDomainConfig, 
  deleteDomain,
  addDomain,
  DomainConfig
} from '@/lib/domain-config';
import { ThemeColorInput } from '@/components/theme-color-input';
import { CategoryManager } from '@/components/category-manager';
import { CateChipManager } from '@/components/cate-chip-manager';
import { getDefaultDomainConfig } from '@/lib/default-config';

// Custom SVG Icons
const GlobeAltIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.546-1.955 6.012 6.012 0 017.288 0 6.012 6.012 0 011.546 1.955 6.012 6.012 0 01-1.546 7.945 6.012 6.012 0 01-7.288 0 6.012 6.012 0 01-1.546-1.955 6.012 6.012 0 011.546-7.945z" clipRule="evenodd" />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

const SaveIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const RefreshIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 110-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const PencilIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);

// Function to ensure theme configuration has all required properties
function ensureCompleteTheme(theme: any) {
  return {
    // Primary colors
    primaryColor: theme?.primaryColor || '#10B981',
    secondaryColor: theme?.secondaryColor || '#059669',
    accentColor: theme?.accentColor || '#34D399',
    
    // Background colors
    backgroundColor: theme?.backgroundColor || '#F9FAFB',
    surfaceColor: theme?.surfaceColor || '#FFFFFF',
    
    // Text colors
    textPrimary: theme?.textPrimary || '#111827',
    textSecondary: theme?.textSecondary || '#6B7280',
    textMuted: theme?.textMuted || '#9CA3AF',
    
    // State colors
    successColor: theme?.successColor || '#10B981',
    warningColor: theme?.warningColor || '#F59E0B',
    errorColor: theme?.errorColor || '#EF4444',
    infoColor: theme?.infoColor || '#3B82F6',
    
    // Interactive colors
    linkColor: theme?.linkColor || theme?.primaryColor || '#10B981',
    linkHoverColor: theme?.linkHoverColor || theme?.secondaryColor || '#059669',
    buttonColor: theme?.buttonColor || theme?.primaryColor || '#10B981',
    buttonTextColor: theme?.buttonTextColor || '#FFFFFF',
    
    // Border colors
    borderColor: theme?.borderColor || '#D1D5DB',
    borderLightColor: theme?.borderLightColor || '#E5E7EB',
    
    // Focus colors
    focusColor: theme?.focusColor || theme?.primaryColor || '#10B981',
    
    // Gradient colors
    gradientFrom: theme?.gradientFrom || theme?.primaryColor || '#10B981',
    gradientTo: theme?.gradientTo || theme?.secondaryColor || '#059669'
  };
}

export default function DomainsAdminPage() {
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
    // Add active-default field
    "active-default": '',
    theme: { 
      // Primary colors
      primaryColor: '#10B981', 
      secondaryColor: '#059669',
      accentColor: '#34D399',
      
      // Background colors
      backgroundColor: '#F9FAFB',
      surfaceColor: '#FFFFFF',
      
      // Text colors
      textPrimary: '#111827',
      textSecondary: '#6B7280',
      textMuted: '#9CA3AF',
      
      // State colors
      successColor: '#10B981',
      warningColor: '#F59E0B',
      errorColor: '#EF4444',
      infoColor: '#3B82F6',
      
      // Interactive colors
      linkColor: '#10B981',
      linkHoverColor: '#059669',
      buttonColor: '#10B981',
      buttonTextColor: '#FFFFFF',
      
      // Border colors
      borderColor: '#D1D5DB',
      borderLightColor: '#E5E7EB',
      
      // Focus colors
      focusColor: '#10B981',
      
      // Gradient colors
      gradientFrom: '#10B981',
      gradientTo: '#059669'
    },
    seo: { 
      title: '', 
      description: '', 
      keywords: [], 
      ogImage: '/og.jpg',
      template: {
        detail: '%title% - %author% | %domain%',
        group: '%group% - %domain%',
        type: '%type% - %domain%'
      }
    },
    content: { categories: [], featuredArticles: [] },
    social: {},
    // Initialize cateChip as empty array
    cateChip: []
  });

  useEffect(() => {
    fetchDomains();
    // Also force refresh cache on initial load to ensure we have the latest data
    forceRefreshCache();
  }, []);

  const fetchDomains = async () => {
    try {
      const response = await fetch('/api/domains');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched domains data:', data);
      if (data && data.domains && Array.isArray(data.domains)) {
        setDomains(data.domains);
      } else {
        console.error('Invalid domains data format:', data);
        setDomains([]);
      }
    } catch (error) {
      console.error('Error fetching domains:', error);
      setDomains([]);
    }
  };

  const fetchDomainConfig = async (hostname: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/domains?hostname=${hostname}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched domain config for', hostname, ':', data);
      
      // Ensure complete theme configuration
      if (data && data.theme) {
        data.theme = ensureCompleteTheme(data.theme);
      }
      
      setConfig(data);
    } catch (error) {
      console.error('Error fetching domain config for', hostname, ':', error);
      setConfig(null);
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

  const forceRefreshCache = async () => {
    try {
      const response = await fetch('/api/domains/force-refresh', { method: 'POST' });
      const data = await response.json();
      if (response.ok) {
        alert('Cache đã được force refresh thành công!');
        console.log('Force refresh response:', data);
        // Reload lại danh sách domains
        fetchDomains();
        if (selectedDomain) {
          fetchDomainConfig(selectedDomain);
        }
      } else {
        alert('Có lỗi xảy ra khi force refresh cache!');
        console.error('Force refresh error response:', data);
      }
    } catch (e) {
      console.error('Failed to force refresh cache', e);
      alert('Có lỗi xảy ra khi force refresh cache!');
    }
  };

  const handleDomainChange = (hostname: string) => {
    console.log('Selecting domain:', hostname);
    setSelectedDomain(hostname);
    fetchDomainConfig(hostname);
  };

  const updateConfig = (updatedFields: Partial<DomainConfig>) => {
    if (!selectedDomain || !config) return;
    
    // Merge the updated fields with the current config
    const updatedConfig = {
      ...config,
      ...updatedFields,
      theme: {
        ...config.theme,
        ...(updatedFields.theme || {})
      },
      seo: {
        ...config.seo,
        ...(updatedFields.seo || {})
      },
      content: {
        ...config.content,
        ...(updatedFields.content || {})
      },
      social: {
        ...config.social,
        ...(updatedFields.social || {})
      }
    };
    
    // Ensure complete theme configuration
    updatedConfig.theme = ensureCompleteTheme(updatedConfig.theme);
    
    // Update local state only
    setConfig(updatedConfig);
  };

  const handleSave = async () => {
    if (!selectedDomain || !config) {
      alert('Vui lòng chọn domain trước!');
      return;
    }
    
    try {
      // Ensure complete theme configuration before saving
      const configToSave = {
        ...config,
        theme: ensureCompleteTheme(config.theme)
      };
      
      const success = await updateDomainConfig(selectedDomain, configToSave);
      if (success) {
        await reloadCache();
        
        // Refresh theme sau khi cập nhật thành công
        try {
          if ((window as any).refreshTheme) {
            await (window as any).refreshTheme();
          } else {
            // Nếu không có refresh theme, force reload trang
            window.location.reload();
          }
        } catch (themeError) {
          console.error('Error refreshing theme, reloading page:', themeError);
          window.location.reload();
        }
        
        alert('Cấu hình đã được lưu!');
      } else {
        alert('Có lỗi xảy ra khi lưu cấu hình!');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Có lỗi xảy ra khi lưu cấu hình!');
    }
  };

  const handleRestoreDefault = async () => {
    if (!selectedDomain) {
      alert('Vui lòng chọn domain trước!');
      return;
    }
    
    if (!confirm(`Bạn có chắc chắn muốn khôi phục cấu hình mặc định cho domain ${selectedDomain}? Tất cả cài đặt hiện tại sẽ bị thay thế.`)) {
      return;
    }
    
    try {
      const defaultConfig = getDefaultDomainConfig();
      
      // Ensure active-default field is included
      const configToRestore = {
        ...defaultConfig,
        "active-default": defaultConfig["active-default"] || ''
      };
      
      const success = await updateDomainConfig(selectedDomain, configToRestore);
      if (success) {
        await reloadCache();
        
        // Refresh theme sau khi khôi phục thành công
        try {
          if ((window as any).refreshTheme) {
            await (window as any).refreshTheme();
          } else {
            // Nếu không có refresh theme, force reload trang
            window.location.reload();
          }
        } catch (themeError) {
          console.error('Error refreshing theme, reloading page:', themeError);
          window.location.reload();
        }
        
        alert('Cấu hình đã được khôi phục về mặc định!');
        fetchDomainConfig(selectedDomain); // Reload to show updated config
      } else {
        alert('Có lỗi xảy ra khi khôi phục cấu hình!');
      }
    } catch (error) {
      console.error('Error restoring default config:', error);
      alert('Có lỗi xảy ra khi khôi phục cấu hình!');
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
        // Add active-default field
        "active-default": '',
        theme: newConfig.theme || { 
          // Primary colors
          primaryColor: '#10B981', 
          secondaryColor: '#059669',
          accentColor: '#34D399',
          
          // Background colors
          backgroundColor: '#F9FAFB',
          surfaceColor: '#FFFFFF',
          
          // Text colors
          textPrimary: '#111827',
          textSecondary: '#6B7280',
          textMuted: '#9CA3AF',
          
          // State colors
          successColor: '#10B981',
          warningColor: '#F59E0B',
          errorColor: '#EF4444',
          infoColor: '#3B82F6',
          
          // Interactive colors
          linkColor: '#10B981',
          linkHoverColor: '#059669',
          buttonColor: '#10B981',
          buttonTextColor: '#FFFFFF',
          
          // Border colors
          borderColor: '#D1D5DB',
          borderLightColor: '#E5E7EB',
          
          // Focus colors
          focusColor: '#10B981',
          
          // Gradient colors
          gradientFrom: '#10B981',
          gradientTo: '#059669'
        },
        seo: {
          title: newConfig.seo?.title || newConfig.name!,
          description: newConfig.seo?.description || newConfig.description!,
          keywords: newConfig.seo?.keywords || [],
          ogImage: newConfig.seo?.ogImage || '/og.jpg',
          template: {
            detail: newConfig.seo?.template?.detail || '%title% - %author% | %domain%',
            group: newConfig.seo?.template?.group || '%group% - %domain%',
            type: newConfig.seo?.template?.type || '%type% - %domain%'
          }
        },
        content: {
          categories: newConfig.content?.categories || [],
          featuredArticles: newConfig.content?.featuredArticles || []
        },
        social: newConfig.social || {},
        // Initialize cateChip as empty array
        cateChip: []
      };
      
      const success = await addDomain(newDomain, fullConfig);
      if (success) {
        await reloadCache();
        
        // Refresh theme sau khi thêm domain thành công
        if ((window as any).refreshTheme) {
          await (window as any).refreshTheme();
        }
        
        alert('Domain đã được thêm!');
        fetchDomains();
        setShowAddForm(false);
        setNewDomain('');
        setNewConfig({
          name: '',
          description: '',
          logo: '🏷️',
          // Add active-default field
          "active-default": '',
          theme: { 
            // Primary colors
            primaryColor: '#10B981', 
            secondaryColor: '#059669',
            accentColor: '#34D399',
            
            // Background colors
            backgroundColor: '#F9FAFB',
            surfaceColor: '#FFFFFF',
            
            // Text colors
            textPrimary: '#111827',
            textSecondary: '#6B7280',
            textMuted: '#9CA3AF',
            
            // State colors
            successColor: '#10B981',
            warningColor: '#F59E0B',
            errorColor: '#EF4444',
            infoColor: '#3B82F6',
            
            // Interactive colors
            linkColor: '#10B981',
            linkHoverColor: '#059669',
            buttonColor: '#10B981',
            buttonTextColor: '#FFFFFF',
            
            // Border colors
            borderColor: '#D1D5DB',
            borderLightColor: '#E5E7EB',
            
            // Focus colors
            focusColor: '#10B981',
            
            // Gradient colors
            gradientFrom: '#10B981',
            gradientTo: '#059669'
          },
          seo: { 
            title: '', 
            description: '', 
            keywords: [], 
            ogImage: '/og.jpg',
            template: {
              detail: '%title% - %author% | %domain%',
              group: '%group% - %domain%',
              type: '%type% - %domain%'
            }
          },
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

  // Helper functions for updating specific parts of the config
  const updateThemeConfig = (themeUpdates: Partial<DomainConfig['theme']>) => {
    if (!config) return;
    updateConfig({
      theme: {
        ...config.theme,
        ...themeUpdates
      }
    });
  };

  const updateSeoConfig = (seoUpdates: Partial<DomainConfig['seo']>) => {
    if (!config) return;
    updateConfig({
      seo: {
        ...config.seo,
        ...seoUpdates
      }
    });
  };

  const updateContentConfig = (contentUpdates: Partial<DomainConfig['content']>) => {
    if (!config) return;
    updateConfig({
      content: {
        ...config.content,
        ...contentUpdates
      }
    });
  };

  const updateSocialConfig = (socialUpdates: Partial<DomainConfig['social']>) => {
    if (!config) return;
    updateConfig({
      social: {
        ...config.social,
        ...socialUpdates
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Domains</h1>
            <p className="mt-1 text-sm text-gray-600">
              Quản lý cấu hình cho các domain khác nhau
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Domain List */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Danh sách Domains</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={forceRefreshCache}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <RefreshIcon className="h-4 w-4 mr-1" />
                      Refresh
                    </button>
                    <button
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      {showAddForm ? 'Hủy' : 'Thêm Domain'}
                    </button>
                  </div>
                </div>
                
                {/* Add Domain Form */}
                {showAddForm && (
                  <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                    <h3 className="text-md font-medium text-gray-900 mb-3">Thêm Domain mới</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Domain *
                        </label>
                        <input
                          type="text"
                          value={newDomain}
                          onChange={(e) => setNewDomain(e.target.value)}
                          placeholder="example.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tên *
                        </label>
                        <input
                          type="text"
                          value={newConfig.name || ''}
                          onChange={(e) => setNewConfig({...newConfig, name: e.target.value})}
                          placeholder="Tên domain"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mô tả *
                        </label>
                        <textarea
                          value={newConfig.description || ''}
                          onChange={(e) => setNewConfig({...newConfig, description: e.target.value})}
                          placeholder="Mô tả domain"
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <button
                        onClick={handleAddDomain}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Thêm Domain
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  {domains.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      Không có domain nào. Vui lòng refresh hoặc thêm domain mới.
                    </div>
                  ) : (
                    domains.map((domain) => (
                      <div
                        key={domain}
                        onClick={() => handleDomainChange(domain)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedDomain === domain
                            ? 'bg-indigo-100 border border-indigo-300'
                            : 'bg-white border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                              <GlobeAltIcon className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{domain}</div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDomain(domain);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            {/* Domain Configuration */}
            <div className="lg:col-span-2">
              {loading ? (
                <div className="text-center text-gray-600 h-64 flex items-center justify-center">
                  Đang tải cấu hình...
                </div>
              ) : selectedDomain && config ? (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      Cấu hình cho {selectedDomain}
                    </h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSave}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <SaveIcon className="h-4 w-4 mr-1" />
                        Lưu
                      </button>
                      <button
                        onClick={handleRestoreDefault}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <RefreshIcon className="h-4 w-4 mr-1" />
                        Khôi phục mặc định
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Domain Info */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Thông tin cơ bản</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Domain
                          </label>
                          <input
                            type="text"
                            value={config.domain}
                            onChange={(e) => updateConfig({ domain: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên
                          </label>
                          <input
                            type="text"
                            value={config.name}
                            onChange={(e) => updateConfig({ name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mô tả
                          </label>
                          <textarea
                            value={config.description}
                            onChange={(e) => updateConfig({ description: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Logo
                          </label>
                          <input
                            type="text"
                            value={config.logo}
                            onChange={(e) => updateConfig({ logo: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        {/* Active Default Field */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Active Default API Type
                          </label>
                          <input
                            type="text"
                            value={config["active-default"] || ''}
                            onChange={(e) => updateConfig({ "active-default": e.target.value })}
                            placeholder="Enter default API type"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Specify which API type is loaded by default for this domain
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Theme Configuration */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Theme</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ThemeColorInput
                          label="Màu chính"
                          value={config.theme.primaryColor}
                          onChange={(value: string) => updateThemeConfig({ primaryColor: value })}
                        />
                        <ThemeColorInput
                          label="Màu phụ"
                          value={config.theme.secondaryColor}
                          onChange={(value: string) => updateThemeConfig({ secondaryColor: value })}
                        />
                        <ThemeColorInput
                          label="Màu accent"
                          value={config.theme.accentColor}
                          onChange={(value: string) => updateThemeConfig({ accentColor: value })}
                        />
                        <ThemeColorInput
                          label="Màu nền"
                          value={config.theme.backgroundColor}
                          onChange={(value: string) => updateThemeConfig({ backgroundColor: value })}
                        />
                        <ThemeColorInput
                          label="Màu surface"
                          value={config.theme.surfaceColor}
                          onChange={(value: string) => updateThemeConfig({ surfaceColor: value })}
                        />
                        <ThemeColorInput
                          label="Màu text chính"
                          value={config.theme.textPrimary}
                          onChange={(value: string) => updateThemeConfig({ textPrimary: value })}
                        />
                        <ThemeColorInput
                          label="Màu text phụ"
                          value={config.theme.textSecondary}
                          onChange={(value: string) => updateThemeConfig({ textSecondary: value })}
                        />
                        <ThemeColorInput
                          label="Màu text muted"
                          value={config.theme.textMuted}
                          onChange={(value: string) => updateThemeConfig({ textMuted: value })}
                        />
                        <ThemeColorInput
                          label="Màu thành công"
                          value={config.theme.successColor}
                          onChange={(value: string) => updateThemeConfig({ successColor: value })}
                        />
                        <ThemeColorInput
                          label="Màu cảnh báo"
                          value={config.theme.warningColor}
                          onChange={(value: string) => updateThemeConfig({ warningColor: value })}
                        />
                        <ThemeColorInput
                          label="Màu lỗi"
                          value={config.theme.errorColor}
                          onChange={(value: string) => updateThemeConfig({ errorColor: value })}
                        />
                        <ThemeColorInput
                          label="Màu info"
                          value={config.theme.infoColor}
                          onChange={(value: string) => updateThemeConfig({ infoColor: value })}
                        />
                      </div>
                    </div>
                    
                    {/* SEO Configuration */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">SEO</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tiêu đề
                          </label>
                          <input
                            type="text"
                            value={config.seo.title}
                            onChange={(e) => updateSeoConfig({ title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mô tả
                          </label>
                          <textarea
                            value={config.seo.description}
                            onChange={(e) => updateSeoConfig({ description: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ảnh OG
                          </label>
                          <input
                            type="text"
                            value={config.seo.ogImage}
                            onChange={(e) => updateSeoConfig({ ogImage: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        
                        {/* Template Configuration */}
                        <div className="bg-gray-50 p-4 rounded-md">
                          <h4 className="text-md font-medium text-gray-800 mb-3">Template SEO</h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Trang chi tiết
                              </label>
                              <input
                                type="text"
                                value={config.seo.template.detail}
                                onChange={(e) => updateSeoConfig({ 
                                  template: { 
                                    ...config.seo.template, 
                                    detail: e.target.value 
                                  } 
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="%title% - %author% | %domain%"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Trang nhóm
                              </label>
                              <input
                                type="text"
                                value={config.seo.template.group}
                                onChange={(e) => updateSeoConfig({ 
                                  template: { 
                                    ...config.seo.template, 
                                    group: e.target.value 
                                  } 
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="%group% - %domain%"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Trang loại
                              </label>
                              <input
                                type="text"
                                value={config.seo.template.type}
                                onChange={(e) => updateSeoConfig({ 
                                  template: { 
                                    ...config.seo.template, 
                                    type: e.target.value 
                                  } 
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="%type% - %domain%"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* SEO Verification Configuration */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Xác minh SEO</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Google Analytics ID
                          </label>
                          <input
                            type="text"
                            value={config.seo.googleAnalyticsId || ''}
                            onChange={(e) => updateSeoConfig({ googleAnalyticsId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="GA_MEASUREMENT_ID"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Google Verification
                          </label>
                          <input
                            type="text"
                            value={config.seo.googleVerification || ''}
                            onChange={(e) => updateSeoConfig({ googleVerification: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="google-verification-code"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bing Verification
                          </label>
                          <input
                            type="text"
                            value={config.seo.bingVerification || ''}
                            onChange={(e) => updateSeoConfig({ bingVerification: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="bing-verification-code"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Yandex Verification
                          </label>
                          <input
                            type="text"
                            value={config.seo.yandexVerification || ''}
                            onChange={(e) => updateSeoConfig({ yandexVerification: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="yandex-verification-code"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Baidu Verification
                          </label>
                          <input
                            type="text"
                            value={config.seo.baiduVerification || ''}
                            onChange={(e) => updateSeoConfig({ baiduVerification: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="baidu-verification-code"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Naver Verification
                          </label>
                          <input
                            type="text"
                            value={config.seo.naverVerification || ''}
                            onChange={(e) => updateSeoConfig({ naverVerification: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="naver-verification-code"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Social Configuration */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Mạng xã hội</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Facebook
                          </label>
                          <input
                            type="text"
                            value={config.social.facebook || ''}
                            onChange={(e) => updateSocialConfig({ facebook: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Twitter
                          </label>
                          <input
                            type="text"
                            value={config.social.twitter || ''}
                            onChange={(e) => updateSocialConfig({ twitter: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Instagram
                          </label>
                          <input
                            type="text"
                            value={config.social.instagram || ''}
                            onChange={(e) => updateSocialConfig({ instagram: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            YouTube
                          </label>
                          <input
                            type="text"
                            value={config.social.youtube || ''}
                            onChange={(e) => updateSocialConfig({ youtube: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* CateChip Configuration */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">CateChip</h3>
                      <CateChipManager
                        cateChips={config.cateChip || []}
                        onChange={(cateChip: any) => updateConfig({ cateChip })}
                      />
                    </div>
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
    </div>
  );
}