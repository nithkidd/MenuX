import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { businessService, type Business } from '../services/business.service';
import { Loader2, Globe, Facebook, Instagram, Twitter, MapPin, Phone, Mail, DollarSign, Palette, Layout, Check, X, AlertCircle, AlertTriangle } from 'lucide-react';
import { ImageUpload } from '../../../shared/components/ImageUpload';
import { menuService } from '../../menu/services/menu.service';
import { useToast } from '../../../shared/contexts/ToastContext';
import Portal from '../../../shared/components/Portal';

export default function BusinessSettings() {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'appearance'>('general');

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationName, setDeleteConfirmationName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Business>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showToast } = useToast();
  
  // Handle Image Upload Helper
  const handleImageUpload = (field: keyof Business, url: string) => {
    setFormData(prev => ({ ...prev, [field]: url }));
  };

  // Handle Image Remove Helper
  const handleImageRemove = async (field: keyof Business) => {
    const url = formData[field];
    if (typeof url === 'string') {
        const publicId = menuService.getPublicIdFromUrl(url);
        if (publicId) {
            try {
                await menuService.deleteImage(publicId);
            } catch (err) {
                console.error("Failed to delete image", err);
            }
        }
    }
    setFormData(prev => ({ ...prev, [field]: null }));
  };

  // Check for changes (simple deep compare)
  const hasChanges = JSON.stringify(business) !== JSON.stringify(formData);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  const loadBusiness = useCallback(async () => {
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
  }, [businessId]);

  useEffect(() => {
    if (businessId) loadBusiness();
  }, [businessId, loadBusiness]);

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

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = "Business name is required";
    if (formData.name && formData.name.length < 3) newErrors.name = "Name must be at least 3 characters";
    
    if (!formData.slug?.trim()) {
        newErrors.slug = "URL slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
        newErrors.slug = "Slug can only contain lowercase letters, numbers, and hyphens";
    }

    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
        newErrors.contact_email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;

    if (!validate()) {
        showToast("Please fix the errors before saving", "error");
        return;
    }

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
      showToast("Settings saved successfully");
      
      // Reset after success
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
        console.error("Failed to save settings", error);
        setSaveStatus('error');
        const message = error instanceof Error ? error.message : "Failed to save settings";
        showToast(message, "error");
        // Reset after error
        setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleDeleteBusiness = async () => {
    if (!businessId || deleteConfirmationName !== business?.name) return;

    try {
      setIsDeleting(true);
      await businessService.delete(businessId);
      showToast("Business deleted successfully");
      navigate('/dashboard');
    } catch (error) {
      console.error("Failed to delete business", error);
      showToast("Failed to delete business", "error");
      setIsDeleting(false);
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
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Business Name (Primary)</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name || ''}
                                    onChange={handleChange}
                                    maxLength={100}
                                    className="w-full px-4 py-2 rounded-xl border-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white focus:ring-orange-500 focus:border-orange-500 font-english"
                                    placeholder="e.g. My Awesome Cafe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Business Name (Khmer - Optional)</label>
                                <input
                                    type="text"
                                    name="name_km"
                                    value={formData.name_km || ''}
                                    onChange={handleChange}
                                    maxLength={100}
                                    className="w-full px-4 py-2 rounded-xl border-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white focus:ring-orange-500 focus:border-orange-500 font-khmer"
                                    placeholder="e.g. ហាងកាហ្វេរបស់ខ្ញុំ"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Exchange Rate (1 USD = ? KHR)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="exchange_rate_khr"
                                        value={formData.exchange_rate_khr || 4000}
                                        onChange={handleChange}
                                        min="100"
                                        step="100"
                                        className="w-full px-4 py-2 rounded-xl border-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white focus:ring-orange-500 focus:border-orange-500"
                                        placeholder="4000"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm">៛</span>
                                </div>
                                <p className="mt-1 text-xs text-stone-500">Used for automatic currency conversion in Khmer mode.</p>
                            </div>

                            <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-100 dark:border-stone-800">
                                <label className="block text-sm font-bold text-stone-900 dark:text-white mb-2">Business URL & Visibility</label>
                                
                                <div className="mb-4">
                                    <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">Business Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name || ''}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 rounded-xl border ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-stone-200 dark:border-stone-700'} dark:bg-stone-950 dark:text-white focus:ring-orange-500 focus:border-orange-500`}
                                        placeholder="Enter business name"
                                        maxLength={100}
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                            <AlertCircle size={12} /> {errors.name}
                                        </p>
                                    )}
                                </div>

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
                                                const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                                                setFormData(prev => ({ ...prev, slug: val }));
                                            }}
                                            className={`flex-1 px-4 py-2 rounded-xl border ${errors.slug ? 'border-red-500 focus:ring-red-500' : 'border-stone-200 dark:border-stone-700'} dark:bg-stone-950 dark:text-white focus:ring-orange-500 focus:border-orange-500 font-mono text-sm`}
                                            maxLength={100}
                                        />
                                    </div>
                                    {errors.slug && (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                            <AlertCircle size={12} /> {errors.slug}
                                        </p>
                                    )}
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
                            
                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    rows={4}
                                    value={formData.description || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-xl border-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="Tell customers about your business..."
                                    maxLength={1000}
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
                                        maxLength={10}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="mt-12 pt-8 border-t border-stone-200 dark:border-stone-800">
                             <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 p-6">
                                <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                                    <AlertTriangle size={20} />
                                    Danger Zone
                                </h3>
                                <p className="text-sm text-red-600 dark:text-red-300 mb-6">
                                    Deleting your business is irreversible. All menus, items, statistics, and settings will be permanently removed.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDeleteConfirmationName('');
                                        setIsDeleteModalOpen(true);
                                    }}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-sm active:scale-95"
                                >
                                    Delete Business
                                </button>
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
                                        className={`pl-9 w-full pr-4 py-2 rounded-xl border ${errors.contact_email ? 'border-red-500 focus:ring-red-500' : 'border-stone-200 dark:border-stone-700'} dark:bg-stone-950 dark:text-white focus:ring-orange-500 focus:border-orange-500`}
                                        maxLength={255}
                                    />
                                    {errors.contact_email && (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                            <AlertCircle size={12} /> {errors.contact_email}
                                        </p>
                                    )}
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
                                        maxLength={20}
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
                                        maxLength={255}
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
                                        maxLength={2048}
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
                                        maxLength={255}
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
                                        maxLength={255}
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
                                        maxLength={255}
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
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Logo</label>
                                    <div className="w-32">
                                    <ImageUpload
                                        initialUrl={formData.logo_url}
                                        onUpload={(url) => setFormData(prev => ({ ...prev, logo_url: url }))}
                                        onRemove={async () => {
                                            if (formData.logo_url) {
                                                const publicId = menuService.getPublicIdFromUrl(formData.logo_url);
                                                if (publicId) await menuService.deleteImage(publicId);
                                                setFormData(prev => ({ ...prev, logo_url: null }));
                                            }
                                        }}
                                        aspectRatio={1}
                                        className="w-32 h-32 rounded-full overflow-hidden"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Cover Image URL</label>
                                <div className="w-full">
                                    <ImageUpload
                                        initialUrl={formData.cover_image_url}
                                        onUpload={(url) => handleImageUpload('cover_image_url', url)}
                                        onRemove={() => handleImageRemove('cover_image_url')} 
                                        className="h-48 w-full rounded-lg"
                                        aspectRatio={16/9}
                                        layout="col"
                                    />
                                </div>
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
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <Portal>
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                 <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-md w-full p-6 border border-stone-200 dark:border-stone-800 animate-scale-up">
                    <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-500">
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-stone-900 dark:text-white">Delete Business?</h3>
                    </div>
                    
                    <p className="text-stone-600 dark:text-stone-300 mb-4 text-sm leading-relaxed">
                        This action cannot be undone. You are about to permanently delete <strong>{business?.name}</strong> and all associated data.
                    </p>
                    
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 tracking-wider mb-2">
                            Type "{business?.name}" to confirm
                        </label>
                        <input
                            type="text"
                            value={deleteConfirmationName}
                            onChange={(e) => setDeleteConfirmationName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 dark:bg-stone-950 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all font-medium"
                            placeholder={business?.name}
                            autoFocus
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button 
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="px-4 py-2 font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors btn-press"
                            disabled={isDeleting}
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleDeleteBusiness} 
                            disabled={deleteConfirmationName !== business?.name || isDeleting}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 btn-press"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete Forever'
                            )}
                        </button>
                    </div>
                 </div>
             </div>
        </Portal>
      )}
    </div>
  );
}
