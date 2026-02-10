import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { businessService, type Business } from '../services/business.service';
import { Loader2, Globe, Facebook, Instagram, Twitter, MapPin, Phone, Mail, DollarSign, Palette, Layout, Check, X } from 'lucide-react';

export default function BusinessSettings() {
  const { businessId } = useParams<{ businessId: string }>();
  // navigate removed as unused
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'appearance'>('general');

  // Form State
  const [formData, setFormData] = useState<Partial<Business>>({});
  
  // Check for changes (simple deep compare)
  const hasChanges = JSON.stringify(business) !== JSON.stringify(formData);

  useEffect(() => {
    if (businessId) loadBusiness();
  }, [businessId]);

  const loadBusiness = async () => {
    try {
      setLoading(true);
      const data = await businessService.getById(businessId!);
      setBusiness(data);
      setFormData(data);
    } catch (error) {
      console.error("Failed to load business", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (network: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      social_links: {
        ...(prev.social_links || {}),
        [network]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;

    try {
      setSaveStatus('saving');
      
      // Sanitization
      const payload = { ...formData };
      if (payload.slug) {
        // Remove leading/trailing hyphens
        payload.slug = payload.slug.replace(/^-+|-+$/g, '');
      }

      const updated = await businessService.update(businessId, payload);
      setBusiness(updated);
      setFormData(updated);
      setSaveStatus('success');
      
      // Reset after success
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error: any) {
        console.error("Failed to save settings", error);
        setSaveStatus('error');
        // Reset after error
        setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-orange-500" /></div>;
  if (!business) return <div className="p-8 text-center text-red-500">Business not found.</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Business Settings</h1>
                <p className="text-stone-500 dark:text-stone-400 mt-1">Manage your business profile and preferences.</p>
            </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <nav className="w-full md:w-64 flex flex-col gap-2">
            {[
                { id: 'general', label: 'General Info', icon: Layout },
                { id: 'contact', label: 'Contact & Social', icon: Globe },
                { id: 'appearance', label: 'Appearance', icon: Palette },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                        activeTab === tab.id
                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 shadow-sm ring-1 ring-orange-200 dark:ring-orange-900'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-200'
                    }`}
                >
                    <tab.icon size={18} />
                    {tab.label}
                </button>
            ))}
        </nav>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* General Tab */}
                {activeTab === 'general' && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Business Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-xl border-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>

                            <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-100 dark:border-stone-800">
                                <label className="block text-sm font-bold text-stone-900 dark:text-white mb-2">Business URL & Visibility</label>
                                
                                {/* Slug Input */}
                                <div className="mb-4">
                                    <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">URL Slug</label>
                                    <div className="flex items-center">
                                        <span className="text-stone-400 dark:text-stone-500 text-sm mr-2 select-none">menux.com/</span>
                                        <input
                                            type="text"
                                            name="slug"
                                            value={formData.slug || ''}
                                            onChange={(e) => {
                                                // Simple client-side validation for display
                                                const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                                                setFormData(prev => ({ ...prev, slug: val }));
                                            }}
                                            className="flex-1 px-4 py-2 rounded-xl border-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white focus:ring-orange-500 focus:border-orange-500 font-mono text-sm"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-500 flex items-center gap-1">
                                        <span className="font-bold">Warning:</span> Changing this will break existing QR codes and links.
                                    </p>
                                </div>

                                {/* Publish Toggle */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="block text-sm font-medium text-stone-900 dark:text-stone-200">Public Visibility</span>
                                        <span className="block text-xs text-stone-500 dark:text-stone-400">
                                            {formData.is_published 
                                                ? "Your menu is visible to the public." 
                                                : "Your menu is hidden (404 Not Found)."}
                                        </span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer"
                                            checked={formData.is_published || false}
                                            onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                                        />
                                        <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                                    </label>
                                </div>
                            </div>
                            
                            {/* Description - this was the next block */}
                            
                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    rows={4}
                                    value={formData.description || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-xl border-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="Tell customers about your business..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Currency Symbol</label>
                                <div className="relative max-w-xs">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <DollarSign size={16} className="text-stone-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="currency"
                                        value={formData.currency || 'USD'}
                                        onChange={handleChange}
                                        className="pl-9 w-full pr-4 py-2 rounded-xl border-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white focus:ring-orange-500 focus:border-orange-500"
                                        placeholder="USD, EUR, etc."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contact Tab */}
                {activeTab === 'contact' && (
                    <div className="space-y-6 animate-fade-in-up">
                        <h3 className="text-lg font-bold text-stone-900 dark:text-white border-b border-stone-200 dark:border-stone-800 pb-2">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail size={16} className="text-stone-400" />
                                    </div>
                                    <input
                                        type="email"
                                        name="contact_email"
                                        value={formData.contact_email || ''}
                                        onChange={handleChange}
                                        className="pl-9 w-full pr-4 py-2 rounded-xl border-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Phone</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone size={16} className="text-stone-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        name="contact_phone"
                                        value={formData.contact_phone || ''}
                                        onChange={handleChange}
                                        className="pl-9 w-full pr-4 py-2 rounded-xl border-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MapPin size={16} className="text-stone-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address || ''}
                                        onChange={handleChange}
                                        className="pl-9 w-full pr-4 py-2 rounded-xl border-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Website URL</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Globe size={16} className="text-stone-400" />
                                    </div>
                                    <input
                                        type="url"
                                        name="website_url"
                                        value={formData.website_url || ''}
                                        onChange={handleChange}
                                        className="pl-9 w-full pr-4 py-2 rounded-xl border-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white focus:ring-orange-500 focus:border-orange-500"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-stone-900 dark:text-white border-b border-stone-200 dark:border-stone-800 pb-2 pt-4">Social Media</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Facebook</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Facebook size={16} className="text-stone-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.social_links?.facebook || ''}
                                        onChange={(e) => handleSocialChange('facebook', e.target.value)}
                                        className="pl-9 w-full pr-4 py-2 rounded-xl border-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white focus:ring-orange-500 focus:border-orange-500"
                                        placeholder="Page URL or Username"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Instagram</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Instagram size={16} className="text-stone-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.social_links?.instagram || ''}
                                        onChange={(e) => handleSocialChange('instagram', e.target.value)}
                                        className="pl-9 w-full pr-4 py-2 rounded-xl border-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white focus:ring-orange-500 focus:border-orange-500"
                                        placeholder="Username"
                                    />
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Twitter / X</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Twitter size={16} className="text-stone-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.social_links?.twitter || ''}
                                        onChange={(e) => handleSocialChange('twitter', e.target.value)}
                                        className="pl-9 w-full pr-4 py-2 rounded-xl border-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white focus:ring-orange-500 focus:border-orange-500"
                                        placeholder="Username"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Logo URL</label>
                                <input
                                    type="text"
                                    name="logo_url"
                                    value={formData.logo_url || ''}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                    className="w-full px-4 py-2 rounded-xl border-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white focus:ring-orange-500 focus:border-orange-500"
                                />
                                {formData.logo_url && (
                                    <div className="mt-2 h-20 w-20 rounded-full overflow-hidden border border-stone-200 dark:border-stone-700">
                                        <img src={formData.logo_url} alt="Logo Preview" className="h-full w-full object-cover" />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Cover Image URL</label>
                                <input
                                    type="text"
                                    name="cover_image_url"
                                    value={formData.cover_image_url || ''}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                    className="w-full px-4 py-2 rounded-xl border-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white focus:ring-orange-500 focus:border-orange-500"
                                />
                                {formData.cover_image_url && (
                                    <div className="mt-2 h-40 w-full rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700">
                                        <img src={formData.cover_image_url} alt="Cover Preview" className="h-full w-full object-cover" />
                                    </div>
                                )}
                            </div>
                            
                            {/* Simple Color Field for now */}
                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Primary Color</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        name="primary_color"
                                        value={formData.primary_color || '#f97316'}
                                        onChange={handleChange}
                                        className="h-10 w-20 rounded cursor-pointer border-0 p-0"
                                    />
                                    <span className="text-sm text-stone-500 uppercase">{formData.primary_color}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex justify-end pt-6 border-t border-stone-100 dark:border-stone-800">
                    <button
                        type="submit"
                        disabled={saveStatus !== 'idle' || !hasChanges}
                        className={`
                            flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm active:scale-95
                            ${saveStatus === 'success' 
                                ? 'bg-green-600 text-white hover:bg-green-700' 
                                : saveStatus === 'error'
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : hasChanges
                                        ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-500/20'
                                        : 'bg-stone-200 text-stone-400 dark:bg-stone-800 dark:text-stone-600 cursor-not-allowed'
                            }
                        `}
                    >
                        {saveStatus === 'saving' ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : saveStatus === 'success' ? (
                            <>
                                <Check size={18} />
                                <span>Saved!</span>
                            </>
                        ) : saveStatus === 'error' ? (
                            <>
                                <X size={18} />
                                <span>Failed</span>
                            </>
                        ) : (
                            <span>Save Changes</span>
                        )}
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
}
