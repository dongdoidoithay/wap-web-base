'use client';

import { useState, useEffect } from 'react';
import { DomainConfig, updateDomainConfig, deleteDomain, addDomain } from '../../../lib/domain-config';
import { ApiEndpointsDisplay } from '@/components/api-endpoints-display';

// Function to create default configuration
function createDefaultConfig(domain: string): DomainConfig {
  return {
    domain: domain,
    name: 'Website Name',
    description: 'Website description here',
    logo: '🏷️',
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
      title: 'Default Website Title',
      description: 'Default website description',
      keywords: ['keyword1', 'keyword2'],
      ogImage: '/og.jpg',
      template: {
        detail: '%title% - %author% | %domain%',
        group: '%group% - %domain%',
        type: '%type% - %domain%'
      }
    },
    content: {
      categories: ['News', 'Tutorial', 'Review'],
      featuredArticles: []
    },
    social: {
      facebook: '',
      twitter: '',
      instagram: '',
      youtube: ''
    },
    paths: {
      vietnamese: 'doc-truyen',
      english: 'read-manga',
      search: 'tim-kiem'
    },
    languages: {
      default: 'vi' as const,
      supported: ['vi' as const, 'en' as const]
    },
    api: {
      vietnamese: '/api/manga-vn',
      english: '/api/manga-en',
      search: '/api/search',
      auth: '/api/auth'
    },
    routes: {
      'doc-truyen': {
        path: 'doc-truyen',
        api: '/api/manga-vn',
        language: 'vi' as const,
        title: 'Đọc Truyện',
        description: 'Content in Vietnamese'
      },
      'read-manga': {
        path: 'read-manga',
        api: '/api/manga-en',
        language: 'en' as const,
        title: 'Read Content',
        description: 'Content in English'
      }
    }
  };
}

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
      
      // Ensure complete theme configuration
      if (data && data.theme) {
        data.theme = ensureCompleteTheme(data.theme);
      }
      
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

  const forceRefreshCache = async () => {
    try {
      const response = await fetch('/api/domains/force-refresh', { method: 'POST' });
      if (response.ok) {
        alert('Cache đã được force refresh thành công!');
        // Reload lại danh sách domains
        fetchDomains();
        if (selectedDomain) {
          fetchDomainConfig(selectedDomain);
        }
      } else {
        alert('Có lỗi xảy ra khi force refresh cache!');
      }
    } catch (e) {
      console.error('Failed to force refresh cache', e);
      alert('Có lỗi xảy ra khi force refresh cache!');
    }
  };

  const handleDomainChange = (hostname: string) => {
    setSelectedDomain(hostname);
    fetchDomainConfig(hostname);
  };

  const updateConfig = async (updatedConfig: DomainConfig) => {
    try {
      // Ensure complete theme configuration before saving
      const configToSave = {
        ...updatedConfig,
        theme: ensureCompleteTheme(updatedConfig.theme)
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

  const handleRestoreDefault = async () => {
    if (!selectedDomain) {
      alert('Vui lòng chọn domain trước!');
      return;
    }
    
    if (!confirm(`Bạn có chắc chắn muốn khôi phục cấu hình mặc định cho domain ${selectedDomain}? Tất cả cài đặt hiện tại sẽ bị thay thế.`)) {
      return;
    }
    
    try {
      const defaultConfig = createDefaultConfig(selectedDomain);
      
      const success = await updateDomainConfig(selectedDomain, defaultConfig);
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
          googleAnalyticsId: newConfig.seo?.googleAnalyticsId,
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
        paths: {
          vietnamese: 'doc-truyen',
          english: 'read-manga',
          search: 'tim-kiem'
        },
        languages: {
          default: 'vi' as const,
          supported: ['vi', 'en'] as const
        },
        api: {
          vietnamese: '/api/manga-vn',
          english: '/api/manga-en',
          search: '/api/search',
          auth: '/api/auth'
        },
        routes: {
          'doc-truyen': {
            path: 'doc-truyen',
            api: '/api/manga-vn',
            language: 'vi',
            title: 'Đọc Truyện',
            description: 'Truyện tiếng Việt đa dạng thể loại'
          },
          'read-manga': {
            path: 'read-manga',
            api: '/api/manga-en',
            language: 'en',
            title: 'Read Manga',
            description: 'Manga tiếng Anh chất lượng cao'
          },
          'tim-kiem': {
            path: 'tim-kiem',
            api: '/api/search',
            language: 'vi',
            title: 'Tìm kiếm',
            description: 'Tìm kiếm truyện và manga'
          }
        }
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

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-primary">Quản lý Domain</h1>
          <div className="flex gap-2">
            <button
              onClick={reloadCache}
              className="bg-success text-white px-3 py-2 rounded-md text-sm hover:bg-success/90 transition-colors"
            >
              Refresh cache
            </button>
            <button
              onClick={forceRefreshCache}
              className="bg-error text-white px-3 py-2 rounded-md text-sm hover:bg-error/90 transition-colors"
              title="Force refresh cache - xóa hoàn toàn cache và load lại từ file"
            >
              Force Refresh
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Domain List */}
          <div className="bg-surface rounded-lg shadow p-6 border-l-4 border-primary">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-primary">Danh sách Domain</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-primary text-white px-3 py-1 rounded-md text-sm hover:bg-primary/90 transition-colors"
              >
                {showAddForm ? 'Hủy' : 'Thêm Domain'}
              </button>
            </div>
            
            {/* Form thêm domain mới */}
            {showAddForm && (
              <div className="mb-4 p-4 border border-light rounded-lg bg-surface">
                <h3 className="text-md font-medium text-primary mb-3">Thêm Domain Mới</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Tên domain (ví dụ: newsite.com)"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    className="w-full p-2 border border-light rounded-md text-sm bg-surface text-body-primary focus:border-primary"
                  />
                  <input
                    type="text"
                    placeholder="Tên website"
                    value={newConfig.name}
                    onChange={(e) => setNewConfig({ ...newConfig, name: e.target.value })}
                    className="w-full p-2 border border-light rounded-md text-sm bg-surface text-body-primary focus:border-primary"
                  />
                  <textarea
                    placeholder="Mô tả website"
                    value={newConfig.description}
                    onChange={(e) => setNewConfig({ ...newConfig, description: e.target.value })}
                    rows={2}
                    className="w-full p-2 border border-light rounded-md text-sm bg-surface text-body-primary focus:border-primary"
                  />
                  <button
                    onClick={handleAddDomain}
                    className="w-full bg-primary text-white py-2 px-4 rounded-md text-sm hover:bg-primary/90 transition-colors"
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
                        ? 'border-primary bg-primary/10'
                        : 'border-light hover:bg-surface'
                    }`}
                  >
                    {domain}
                  </button>
                  {domain !== 'example.com' && (
                    <button
                      onClick={() => handleDeleteDomain(domain)}
                      className="p-2 text-error hover:bg-error/10 rounded-md transition-colors"
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
          <div className="lg:col-span-2 bg-surface rounded-lg shadow p-6 border-l-4 border-primary">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-muted">Đang tải...</div>
              </div>
            ) : config ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-primary">
                    Cấu hình: {config.domain}
                  </h2>
                  <button
                    onClick={handleRestoreDefault}
                    className="bg-warning text-white px-3 py-1 rounded-md text-sm hover:bg-warning/90 transition-colors"
                    title="Khôi phục cấu hình mặc định"
                  >
                    🔄 Restore Default
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-body-primary mb-1">
                      Tên website
                    </label>
                    <input
                      type="text"
                      value={config.name}
                      onChange={(e) => setConfig({ ...config, name: e.target.value })}
                      className="w-full p-2 border border-light rounded-md bg-surface text-body-primary placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-body-primary mb-1">
                      Mô tả
                    </label>
                    <textarea
                      value={config.description}
                      onChange={(e) => setConfig({ ...config, description: e.target.value })}
                      rows={3}
                      className="w-full p-2 border border-light rounded-md bg-surface text-body-primary placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-body-primary mb-1">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      value={config.seo.title}
                      onChange={(e) => setConfig({
                        ...config,
                        seo: { ...config.seo, title: e.target.value }
                      })}
                      className="w-full p-2 border border-light rounded-md bg-surface text-body-primary placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-body-primary mb-1">
                      SEO Description
                    </label>
                    <textarea
                      value={config.seo.description}
                      onChange={(e) => setConfig({
                        ...config,
                        seo: { ...config.seo, description: e.target.value }
                      })}
                      rows={2}
                      className="w-full p-2 border border-light rounded-md bg-surface text-body-primary placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-body-primary mb-1">
                      Google Analytics ID
                    </label>
                    <input
                      type="text"
                      value={config.seo.googleAnalyticsId || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        seo: { ...config.seo, googleAnalyticsId: e.target.value }
                      })}
                      className="w-full p-2 border border-light rounded-md bg-surface text-body-primary placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="GA_MEASUREMENT_ID"
                    />
                  </div>

                  {/* SEO Template Configuration */}
                  <div className="border-t border-light pt-4">
                    <h3 className="text-md font-medium text-primary mb-3">SEO Templates</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-body-primary mb-1">
                          Detail Page Template
                        </label>
                        <input
                          type="text"
                          value={config.seo.template?.detail || '%title% - %author% | %domain%'}
                          onChange={(e) => setConfig({
                            ...config,
                            seo: { 
                              ...config.seo, 
                              template: { 
                                ...config.seo.template, 
                                detail: e.target.value 
                              }
                            }
                          })}
                          className="w-full p-2 border border-light rounded-md bg-surface text-body-primary placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary"
                          placeholder="%title% - %author% | %domain%"
                        />
                        <p className="text-xs text-muted mt-1">
                          Variables: %title%, %author%, %domain%, %category%
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-body-primary mb-1">
                          Group Page Template
                        </label>
                        <input
                          type="text"
                          value={config.seo.template?.group || '%group% - %domain%'}
                          onChange={(e) => setConfig({
                            ...config,
                            seo: { 
                              ...config.seo, 
                              template: { 
                                ...config.seo.template, 
                                group: e.target.value 
                              }
                            }
                          })}
                          className="w-full p-2 border border-light rounded-md bg-surface text-body-primary placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary"
                          placeholder="%group% - %domain%"
                        />
                        <p className="text-xs text-muted mt-1">
                          Variables: %group%, %domain%, %category%
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-body-primary mb-1">
                          Type Page Template
                        </label>
                        <input
                          type="text"
                          value={config.seo.template?.type || '%type% - %domain%'}
                          onChange={(e) => setConfig({
                            ...config,
                            seo: { 
                              ...config.seo, 
                              template: { 
                                ...config.seo.template, 
                                type: e.target.value 
                              }
                            }
                          })}
                          className="w-full p-2 border border-light rounded-md bg-surface text-body-primary placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary"
                          placeholder="%type% - %domain%"
                        />
                        <p className="text-xs text-muted mt-1">
                          Variables: %type%, %domain%, %category%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Theme Configuration */}
                  <div className="border-t border-light pt-4">
                    <h3 className="text-md font-medium text-primary mb-3">Theme Configuration</h3>
                    
                    {/* Primary Colors */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-body-primary mb-3">Primary Colors</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-body-primary mb-1">
                            Primary Color
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={config.theme?.primaryColor || '#10B981'}
                              onChange={(e) => setConfig({
                                ...config,
                                theme: { ...config.theme, primaryColor: e.target.value }
                              })}
                              className="w-12 h-10 border border-light rounded-md cursor-pointer"
                            />
                            <input
                              type="text"
                              value={config.theme?.primaryColor || '#10B981'}
                              onChange={(e) => setConfig({
                                ...config,
                                theme: { ...config.theme, primaryColor: e.target.value }
                              })}
                              className="flex-1 p-2 border border-light rounded-md bg-surface text-body-primary placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary"
                              placeholder="#10B981"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-body-primary mb-1">
                            Secondary Color
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={config.theme?.secondaryColor || '#059669'}
                              onChange={(e) => setConfig({
                                ...config,
                                theme: { ...config.theme, secondaryColor: e.target.value }
                              })}
                              className="w-12 h-10 border border-light rounded-md cursor-pointer"
                            />
                            <input
                              type="text"
                              value={config.theme?.secondaryColor || '#059669'}
                              onChange={(e) => setConfig({
                                ...config,
                                theme: { ...config.theme, secondaryColor: e.target.value }
                              })}
                              className="flex-1 p-2 border border-light rounded-md bg-surface text-body-primary placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary"
                              placeholder="#059669"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-body-primary mb-1">
                            Accent Color
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={config.theme?.accentColor || '#34D399'}
                              onChange={(e) => setConfig({
                                ...config,
                                theme: { ...config.theme, accentColor: e.target.value }
                              })}
                              className="w-12 h-10 border border-light rounded-md cursor-pointer"
                            />
                            <input
                              type="text"
                              value={config.theme?.accentColor || '#34D399'}
                              onChange={(e) => setConfig({
                                ...config,
                                theme: { ...config.theme, accentColor: e.target.value }
                              })}
                              className="flex-1 p-2 border border-light rounded-md bg-surface text-body-primary placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary"
                              placeholder="#34D399"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Background Colors */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-body-primary mb-3">Background Colors</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Background Color
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={config.theme?.backgroundColor || '#F9FAFB'}
                              onChange={(e) => setConfig({
                                ...config,
                                theme: { ...config.theme, backgroundColor: e.target.value }
                              })}
                              className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                            />
                            <input
                              type="text"
                              value={config.theme?.backgroundColor || '#F9FAFB'}
                              onChange={(e) => setConfig({
                                ...config,
                                theme: { ...config.theme, backgroundColor: e.target.value }
                              })}
                              className="flex-1 p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:bg-white"
                              placeholder="#F9FAFB"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Surface Color
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={config.theme?.surfaceColor || '#FFFFFF'}
                              onChange={(e) => setConfig({
                                ...config,
                                theme: { ...config.theme, surfaceColor: e.target.value }
                              })}
                              className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                            />
                            <input
                              type="text"
                              value={config.theme?.surfaceColor || '#FFFFFF'}
                              onChange={(e) => setConfig({
                                ...config,
                                theme: { ...config.theme, surfaceColor: e.target.value }
                              })}
                              className="flex-1 p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:bg-white"
                              placeholder="#FFFFFF"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Text Colors */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Text Colors</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Primary Text
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={config.theme?.textPrimary || '#111827'}
                              onChange={(e) => setConfig({
                                ...config,
                                theme: { ...config.theme, textPrimary: e.target.value }
                              })}
                              className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                            />
                            <input
                              type="text"
                              value={config.theme?.textPrimary || '#111827'}
                              onChange={(e) => setConfig({
                                ...config,
                                theme: { ...config.theme, textPrimary: e.target.value }
                              })}
                              className="flex-1 p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:bg-white"
                              placeholder="#111827"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Secondary Text
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={config.theme?.textSecondary || '#6B7280'}
                              onChange={(e) => setConfig({
                                ...config,
                                theme: { ...config.theme, textSecondary: e.target.value }
                              })}
                              className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                            />
                            <input
                              type="text"
                              value={config.theme?.textSecondary || '#6B7280'}
                              onChange={(e) => setConfig({
                                ...config,
                                theme: { ...config.theme, textSecondary: e.target.value }
                              })}
                              className="flex-1 p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:bg-white"
                              placeholder="#6B7280"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Muted Text
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={config.theme?.textMuted || '#9CA3AF'}
                              onChange={(e) => setConfig({
                                ...config,
                                theme: { ...config.theme, textMuted: e.target.value }
                              })}
                              className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                            />
                            <input
                              type="text"
                              value={config.theme?.textMuted || '#9CA3AF'}
                              onChange={(e) => setConfig({
                                ...config,
                                theme: { ...config.theme, textMuted: e.target.value }
                              })}
                              className="flex-1 p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:bg-white"
                              placeholder="#9CA3AF"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* State Colors */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">State Colors</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Success
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={config.theme?.successColor || '#10B981'}
                              onChange={(e) => setConfig({
                                ...config,
                                theme: { ...config.theme, successColor: e.target.value }
                              })}
                              className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                            />
                            <input
                              type="text"
                              value={config.theme?.successColor || '#10B981'}
                              onChange={(e) => setConfig({
                                ...config,
                                theme: { ...config.theme, successColor: e.target.value }
                              })}
                              className="flex-1 p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:bg-white text-xs"
                              placeholder="#10B981"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Warning
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={config.theme?.warningColor || '#F59E0B'}
                              onChange={(e) => setConfig({
                                ...config,
                                theme: { ...config.theme, warningColor: e.target.value }
                              })}
                              className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                            />
                            <input
                              type="text"
                              value={config.theme?.warningColor || '#F59E0B'}
                              onChange={(e) => setConfig({
                                ...config,
                                theme: { ...config.theme, warningColor: e.target.value }
                              })}
                              className="flex-1 p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:bg-white text-xs"
                              placeholder="#F59E0B"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Error
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={config.theme?.errorColor || '#EF4444'}
                              onChange={(e) => setConfig({
                                ...config,
                                theme: { ...config.theme, errorColor: e.target.value }
                              })}
                              className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                            />
                            <input
                              type="text"
                              value={config.theme?.errorColor || '#EF4444'}
                              onChange={(e) => setConfig({
                                ...config,
                                theme: { ...config.theme, errorColor: e.target.value }
                              })}
                              className="flex-1 p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:bg-white text-xs"
                              placeholder="#EF4444"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Info
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={config.theme?.infoColor || '#3B82F6'}
                              onChange={(e) => setConfig({
                                ...config,
                                theme: { ...config.theme, infoColor: e.target.value }
                              })}
                              className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                            />
                            <input
                              type="text"
                              value={config.theme?.infoColor || '#3B82F6'}
                              onChange={(e) => setConfig({
                                ...config,
                                theme: { ...config.theme, infoColor: e.target.value }
                              })}
                              className="flex-1 p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:bg-white text-xs"
                              placeholder="#3B82F6"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Theme Preview */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-4">Theme Preview</h4>
                      
                      {/* Primary Colors Preview */}
                      <div className="mb-4">
                        <h5 className="text-xs font-medium text-gray-600 mb-2">Primary Colors</h5>
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded border border-gray-300"
                              style={{ backgroundColor: config.theme?.primaryColor || '#10B981' }}
                            ></div>
                            <span className="text-xs text-gray-600">Primary</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded border border-gray-300"
                              style={{ backgroundColor: config.theme?.secondaryColor || '#059669' }}
                            ></div>
                            <span className="text-xs text-gray-600">Secondary</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded border border-gray-300"
                              style={{ backgroundColor: config.theme?.accentColor || '#34D399' }}
                            ></div>
                            <span className="text-xs text-gray-600">Accent</span>
                          </div>
                        </div>
                      </div>

                      {/* Background Colors Preview */}
                      <div className="mb-4">
                        <h5 className="text-xs font-medium text-gray-600 mb-2">Background Colors</h5>
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded border border-gray-300"
                              style={{ backgroundColor: config.theme?.backgroundColor || '#F9FAFB' }}
                            ></div>
                            <span className="text-xs text-gray-600">Background</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded border border-gray-300"
                              style={{ backgroundColor: config.theme?.surfaceColor || '#FFFFFF' }}
                            ></div>
                            <span className="text-xs text-gray-600">Surface</span>
                          </div>
                        </div>
                      </div>

                      {/* Text Colors Preview */}
                      <div className="mb-4">
                        <h5 className="text-xs font-medium text-gray-600 mb-2">Text Colors</h5>
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded border border-gray-300"
                              style={{ backgroundColor: config.theme?.textPrimary || '#111827' }}
                            ></div>
                            <span className="text-xs text-gray-600">Primary Text</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded border border-gray-300"
                              style={{ backgroundColor: config.theme?.textSecondary || '#6B7280' }}
                            ></div>
                            <span className="text-xs text-gray-600">Secondary Text</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded border border-gray-300"
                              style={{ backgroundColor: config.theme?.textMuted || '#9CA3AF' }}
                            ></div>
                            <span className="text-xs text-gray-600">Muted Text</span>
                          </div>
                        </div>
                      </div>

                      {/* State Colors Preview */}
                      <div>
                        <h5 className="text-xs font-medium text-gray-600 mb-2">State Colors</h5>
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded border border-gray-300"
                              style={{ backgroundColor: config.theme?.successColor || '#10B981' }}
                            ></div>
                            <span className="text-xs text-gray-600">Success</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded border border-gray-300"
                              style={{ backgroundColor: config.theme?.warningColor || '#F59E0B' }}
                            ></div>
                            <span className="text-xs text-gray-600">Warning</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded border border-gray-300"
                              style={{ backgroundColor: config.theme?.errorColor || '#EF4444' }}
                            ></div>
                            <span className="text-xs text-gray-600">Error</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded border border-gray-300"
                              style={{ backgroundColor: config.theme?.infoColor || '#3B82F6' }}
                            ></div>
                            <span className="text-xs text-gray-600">Info</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => updateConfig(config)}
                      className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
                    >
                      💾 Cập nhật cấu hình
                    </button>
                    <button
                      onClick={handleRestoreDefault}
                      className="bg-warning text-white py-2 px-4 rounded-md hover:bg-warning/90 transition-colors"
                      title="Khôi phục tất cả cấu hình về mặc định"
                    >
                      🔄 Restore Default
                    </button>
                  </div>

                  {/* API Endpoints Display */}
                  <div className="mt-6">
                    <ApiEndpointsDisplay config={config} domain={selectedDomain} />
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
  );
} 