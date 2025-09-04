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
import { SEOHead } from '@/components/seo-head'; // Added SEOHead import

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
    if (!newDomain.trim()) {
      alert('Vui lòng nhập domain!');
      return;
    }
    
    if (!newConfig.name?.trim()) {
      alert('Vui lòng nhập tên domain!');
      return;
    }
    
    try {
      // Ensure complete theme configuration before adding
      const configToAdd = {
        ...newConfig,
        theme: ensureCompleteTheme(newConfig.theme)
      } as DomainConfig;
      
      const success = await addDomain(newDomain, configToAdd);
      if (success) {
        await reloadCache();
        alert('Domain đã được thêm!');
        setShowAddForm(false);
        setNewDomain('');
        setNewConfig({
          name: '',
          description: '',
          logo: '🏷️',
          "active-default": '',
          theme: { 
            primaryColor: '#10B981', 
            secondaryColor: '#059669',
            accentColor: '#34D399',
            backgroundColor: '#F9FAFB',
            surfaceColor: '#FFFFFF',
            textPrimary: '#111827',
            textSecondary: '#6B7280',
            textMuted: '#9CA3AF',
            successColor: '#10B981',
            warningColor: '#F59E0B',
            errorColor: '#EF4444',
            infoColor: '#3B82F6',
            linkColor: '#10B981',
            linkHoverColor: '#059669',
            buttonColor: '#10B981',
            buttonTextColor: '#FFFFFF',
            borderColor: '#D1D5DB',
            borderLightColor: '#E5E7EB',
            focusColor: '#10B981',
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
          cateChip: []
        });
        fetchDomains();
      } else {
        alert('Có lỗi xảy ra khi thêm domain!');
      }
    } catch (error) {
      console.error('Error adding domain:', error);
      alert('Có lỗi xảy ra khi thêm domain!');
    }
  };

  return (
    <>
      {/* Added SEOHead for admin domains page */}
      <SEOHead 
        title="Quản lý Domains - Trang quản trị"
        description="Quản lý cấu hình domains cho hệ thống"
        noindex={true}
      />
      <div className="min-h-screen bg-background text-body-primary">
        {/* Header */}
        <header className="bg-surface shadow border-b border-default">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6 md:justify-start md:space-x-10">
              <div className="flex justify-start lg:w-0 lg:flex-1">
                <h1 className="text-2xl font-bold text-primary flex items-center">
                  <GlobeAltIcon className="h-6 w-6 mr-2" />
                  Domain Configuration
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={forceRefreshCache}
                  className="inline-flex items-center px-4 py-2 border border-default rounded-md shadow-sm text-sm font-medium text-body-primary bg-background hover:bg-surface transition-colors"
                >
                  <RefreshIcon className="h-4 w-4 mr-2" />
                  Force Refresh Cache
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Domain Selection */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-body-primary">Select Domain</h2>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Domain
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {domains.map((domain) => (
                <button
                  key={domain}
                  onClick={() => handleDomainChange(domain)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    selectedDomain === domain
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-default bg-surface hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  <div className="font-medium">{domain}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Add Domain Form */}
          {showAddForm && (
            <div className="mb-8 bg-surface rounded-lg shadow-md p-6 border border-default">
              <h3 className="text-lg font-medium text-body-primary mb-4">Add New Domain</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-body-primary mb-1">
                    Domain Name
                  </label>
                  <input
                    type="text"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    className="w-full px-3 py-2 border border-default rounded-md focus:ring-primary focus:border-primary transition-colors"
                    placeholder="example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-body-primary mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={newConfig.name || ''}
                    onChange={(e) => setNewConfig({ ...newConfig, name: e.target.value })}
                    className="w-full px-3 py-2 border border-default rounded-md focus:ring-primary focus:border-primary transition-colors"
                    placeholder="My Website"
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleAddDomain}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Domain
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="inline-flex items-center px-4 py-2 border border-default text-sm font-medium rounded-md shadow-sm text-body-primary bg-background hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Domain Configuration */}
          {selectedDomain && config && (
            <div className="bg-surface rounded-lg shadow-md p-6 border border-default">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-body-primary">
                  Configuration for <span className="text-primary">{selectedDomain}</span>
                </h2>
                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                  >
                    <SaveIcon className="h-4 w-4 mr-1" />
                    Save Changes
                  </button>
                  <button
                    onClick={handleRestoreDefault}
                    className="inline-flex items-center px-4 py-2 border border-default text-sm font-medium rounded-md shadow-sm text-body-primary bg-background hover:bg-surface transition-colors"
                  >
                    Restore Default
                  </button>
                  <button
                    onClick={() => handleDeleteDomain(selectedDomain)}
                    className="inline-flex items-center px-4 py-2 border border-error text-sm font-medium rounded-md shadow-sm text-error bg-background hover:bg-error/10 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Delete Domain
                  </button>
                </div>
              </div>

              {/* Loading indicator */}
              {loading && (
                <div className="mb-4 p-4 bg-info/10 text-info border border-info/20 rounded-md">
                  Loading configuration...
                </div>
              )}

              {/* Basic Information */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-body-primary mb-4 border-b border-default pb-2">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-body-primary mb-1">
                      Website Name
                    </label>
                    <input
                      type="text"
                      value={config.name}
                      onChange={(e) => updateConfig({ name: e.target.value })}
                      className="w-full px-3 py-2 border border-default rounded-md focus:ring-primary focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-body-primary mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={config.description}
                      onChange={(e) => updateConfig({ description: e.target.value })}
                      className="w-full px-3 py-2 border border-default rounded-md focus:ring-primary focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-body-primary mb-1">
                      Logo (Emoji or URL)
                    </label>
                    <input
                      type="text"
                      value={config.logo}
                      onChange={(e) => updateConfig({ logo: e.target.value })}
                      className="w-full px-3 py-2 border border-default rounded-md focus:ring-primary focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-body-primary mb-1">
                      Active Default
                    </label>
                    <input
                      type="text"
                      value={config["active-default"] || ''}
                      onChange={(e) => updateConfig({ "active-default": e.target.value })}
                      className="w-full px-3 py-2 border border-default rounded-md focus:ring-primary focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* SEO Configuration */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-body-primary mb-4 border-b border-default pb-2">
                  SEO Configuration
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-body-primary mb-1">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      value={config.seo?.title || ''}
                      onChange={(e) => updateConfig({ seo: { ...config.seo, title: e.target.value } })}
                      className="w-full px-3 py-2 border border-default rounded-md focus:ring-primary focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-body-primary mb-1">
                      SEO Description
                    </label>
                    <textarea
                      value={config.seo?.description || ''}
                      onChange={(e) => updateConfig({ seo: { ...config.seo, description: e.target.value } })}
                      className="w-full px-3 py-2 border border-default rounded-md focus:ring-primary focus:border-primary transition-colors"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-body-primary mb-1">
                      SEO Keywords (comma separated)
                    </label>
                    <input
                      type="text"
                      value={config.seo?.keywords?.join(', ') || ''}
                      onChange={(e) => updateConfig({ seo: { ...config.seo, keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) } })}
                      className="w-full px-3 py-2 border border-default rounded-md focus:ring-primary focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-body-primary mb-1">
                      OG Image URL
                    </label>
                    <input
                      type="text"
                      value={config.seo?.ogImage || ''}
                      onChange={(e) => updateConfig({ seo: { ...config.seo, ogImage: e.target.value } })}
                      className="w-full px-3 py-2 border border-default rounded-md focus:ring-primary focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Theme Configuration */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-body-primary mb-4 border-b border-default pb-2">
                  Theme Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ThemeColorInput
                    label="Primary Color"
                    value={config.theme?.primaryColor || '#10B981'}
                    onChange={(value) => updateConfig({ theme: { ...config.theme, primaryColor: value } })}
                  />
                  <ThemeColorInput
                    label="Secondary Color"
                    value={config.theme?.secondaryColor || '#059669'}
                    onChange={(value) => updateConfig({ theme: { ...config.theme, secondaryColor: value } })}
                  />
                  <ThemeColorInput
                    label="Accent Color"
                    value={config.theme?.accentColor || '#34D399'}
                    onChange={(value) => updateConfig({ theme: { ...config.theme, accentColor: value } })}
                  />
                  <ThemeColorInput
                    label="Background Color"
                    value={config.theme?.backgroundColor || '#F9FAFB'}
                    onChange={(value) => updateConfig({ theme: { ...config.theme, backgroundColor: value } })}
                  />
                  <ThemeColorInput
                    label="Surface Color"
                    value={config.theme?.surfaceColor || '#FFFFFF'}
                    onChange={(value) => updateConfig({ theme: { ...config.theme, surfaceColor: value } })}
                  />
                  <ThemeColorInput
                    label="Text Primary"
                    value={config.theme?.textPrimary || '#111827'}
                    onChange={(value) => updateConfig({ theme: { ...config.theme, textPrimary: value } })}
                  />
                  <ThemeColorInput
                    label="Text Secondary"
                    value={config.theme?.textSecondary || '#6B7280'}
                    onChange={(value) => updateConfig({ theme: { ...config.theme, textSecondary: value } })}
                  />
                  <ThemeColorInput
                    label="Text Muted"
                    value={config.theme?.textMuted || '#9CA3AF'}
                    onChange={(value) => updateConfig({ theme: { ...config.theme, textMuted: value } })}
                  />
                  <ThemeColorInput
                    label="Success Color"
                    value={config.theme?.successColor || '#10B981'}
                    onChange={(value) => updateConfig({ theme: { ...config.theme, successColor: value } })}
                  />
                  <ThemeColorInput
                    label="Warning Color"
                    value={config.theme?.warningColor || '#F59E0B'}
                    onChange={(value) => updateConfig({ theme: { ...config.theme, warningColor: value } })}
                  />
                  <ThemeColorInput
                    label="Error Color"
                    value={config.theme?.errorColor || '#EF4444'}
                    onChange={(value) => updateConfig({ theme: { ...config.theme, errorColor: value } })}
                  />
                  <ThemeColorInput
                    label="Info Color"
                    value={config.theme?.infoColor || '#3B82F6'}
                    onChange={(value) => updateConfig({ theme: { ...config.theme, infoColor: value } })}
                  />
                </div>
              </div>

              {/* Categories Manager */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-body-primary mb-4 border-b border-default pb-2">
                  Categories
                </h3>
                <CategoryManager
                  categories={config.content?.categories || []}
                  onChange={(categories) => updateConfig({ content: { ...config.content, categories } })}
                />
              </div>

              {/* CateChip Manager */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-body-primary mb-4 border-b border-default pb-2">
                  Category Chips
                </h3>
                <CateChipManager
                  cateChips={config.cateChip || []}
                  onChange={(cateChip) => updateConfig({ cateChip })}
                />
              </div>

              {/* Social Media */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-body-primary mb-4 border-b border-default pb-2">
                  Social Media
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-body-primary mb-1">
                      Facebook URL
                    </label>
                    <input
                      type="text"
                      value={config.social?.facebook || ''}
                      onChange={(e) => updateConfig({ social: { ...config.social, facebook: e.target.value } })}
                      className="w-full px-3 py-2 border border-default rounded-md focus:ring-primary focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-body-primary mb-1">
                      Twitter URL
                    </label>
                    <input
                      type="text"
                      value={config.social?.twitter || ''}
                      onChange={(e) => updateConfig({ social: { ...config.social, twitter: e.target.value } })}
                      className="w-full px-3 py-2 border border-default rounded-md focus:ring-primary focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-body-primary mb-1">
                      Instagram URL
                    </label>
                    <input
                      type="text"
                      value={config.social?.instagram || ''}
                      onChange={(e) => updateConfig({ social: { ...config.social, instagram: e.target.value } })}
                      className="w-full px-3 py-2 border border-default rounded-md focus:ring-primary focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {!selectedDomain && !showAddForm && (
            <div className="text-center py-12">
              <GlobeAltIcon className="mx-auto h-12 w-12 text-muted" />
              <h3 className="mt-2 text-sm font-medium text-body-primary">No domain selected</h3>
              <p className="mt-1 text-sm text-muted">
                Select a domain from the list above or add a new one to get started.
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}