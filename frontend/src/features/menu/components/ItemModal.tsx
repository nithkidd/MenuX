import React, { useState, useEffect } from 'react';
import { X, ImagePlus, Check, Trash2, Ban } from 'lucide-react';
import { type Item, type Category } from '../services/menu.service';
import { FoodTypeManager } from './FoodTypeManager';
import { foodTypeService } from '../services/food-type.service';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<Item>, foodTypeIds: string[]) => void;
  initialData?: Item | null;
  categories: Category[];
  initialCategoryId?: string | null;
  businessId: string;
}

import Portal from '../../../shared/components/Portal';

export default function ItemModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  categories,
  initialCategoryId,
  businessId
}: ItemModalProps) {
  const [formData, setFormData] = useState<Partial<Item>>({
    name: '',
    price: 0,
    description: '',
    category_id: initialCategoryId || (categories.length > 0 ? categories[0].id : ''),
    image_url: null,
    is_available: true,
    // Legacy fields kept for interface compatibility but not used in UI if replaced by tags
    is_vegetarian: false,
    is_spicy: false,
  });

  const [selectedFoodTypeIds, setSelectedFoodTypeIds] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  // Reset form when modal opens or initialData/initialCategoryId changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...initialData });
        loadItemTags(initialData.id);
      } else {
        setFormData({
            name: '',
            price: 0,
            description: '',
            category_id: initialCategoryId || (categories.length > 0 ? categories[0].id : ''),
            image_url: null,
            is_available: true,
            is_vegetarian: false,
            is_spicy: false,
        });
        setSelectedFoodTypeIds([]);
      }
    }
  }, [isOpen, initialData, initialCategoryId, categories]);

  const loadItemTags = async (itemId: string) => {
      try {
          const tags = await foodTypeService.getItemTags(itemId);
          setSelectedFoodTypeIds(tags);
      } catch (error) {
          console.error("Failed to load item tags", error);
      }
  };

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
        setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleToggleAvailable = () => {
    setFormData(prev => ({ ...prev, is_available: !prev.is_available }));
  };

  const handleToggleFoodType = (id: string) => {
      setSelectedFoodTypeIds(prev => 
        prev.includes(id) 
            ? prev.filter(t => t !== id) 
            : [...prev, id]
      );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.price === undefined || formData.price < 0) {
      setFormError('Please provide a name and a non-negative price.');
      return;
    }
    setFormError(null);
    onSave(formData, selectedFoodTypeIds);
  };

  return (
    <Portal>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <div 
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity" 
            onClick={onClose}
        />

        {/* Modal Content */}
        <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-fade-in-up md:max-w-2xl lg:max-w-3xl">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-stone-800">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white">
                {initialData ? 'Edit Item' : 'Add New Item'}
            </h2>
            <button 
                onClick={onClose}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors btn-press"
            >
                <X size={20} />
            </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Image Preview */}
                <div className="relative group">
                {formData.image_url ? (
                    <div className="relative w-full h-48 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700">
                    <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                        type="button"
                        onClick={() =>
                            setFormData((prev) => ({
                            ...prev,
                            image_url: null,
                            }))
                        }
                        className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 btn-press"
                        >
                        <Trash2 size={20} />
                        </button>
                    </div>
                    </div>
                ) : (
                    <div className="w-full h-40 md:h-48 bg-stone-50 dark:bg-stone-950 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-xl flex flex-col items-center justify-center text-stone-400 dark:text-stone-600">
                    <div className="bg-white dark:bg-stone-800 p-3 rounded-full shadow-sm mb-3">
                        <ImagePlus size={24} />
                    </div>
                    <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                        Paste an image URL below to see a preview here.
                    </span>
                    </div>
                )}
                </div>

                <form id="item-form" onSubmit={handleSubmit} className="space-y-6">
                    {/* Validation Error */}
                    {formError && (
                    <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/40 px-3 py-2 text-xs text-red-700 dark:text-red-100">
                        {formError}
                    </div>
                    )}

                    {/* Basic Info Section */}
                    <div className="space-y-4">
                        {/* Row 1: Name */}
                        <div>
                            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Item Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name || ''}
                                onChange={handleChange}
                                placeholder="e.g. Truffle Burger"
                                className="w-full rounded-xl border-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 py-2.5 px-3 text-sm"
                            />
                        </div>

                        {/* Row 2: Price & Category */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Price</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-stone-500 dark:text-stone-400 sm:text-sm">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        name="price"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.price || ''}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        className="w-full rounded-xl border-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 py-2.5 pl-7 pr-3 text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Category</label>
                                <select
                                    name="category_id"
                                    value={formData.category_id || ''}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 py-2.5 px-3 text-sm"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Row 3: Description */}
                        <div>
                            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Description</label>
                            <textarea
                                name="description"
                                rows={3}
                                value={formData.description || ''}
                                onChange={handleChange}
                                placeholder="Describe the ingredients and flavor profile..."
                                className="w-full rounded-xl border-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 py-2.5 px-3 text-sm resize-none"
                            />
                        </div>
                        {/* Row 4: Image URL */}
                        <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                            Image URL
                        </label>
                        <input
                            type="url"
                            name="image_url"
                            value={formData.image_url || ''}
                            onChange={handleChange}
                            placeholder="https://example.com/your-image.jpg"
                            className="w-full rounded-xl border-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 py-2.5 px-3 text-sm"
                        />
                        <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
                            We’ll use this URL to display the item photo in your menu.
                        </p>
                        </div>
                    </div>

                    <hr className="border-stone-100 dark:border-stone-800" />

                    {/* Food Types Section */}
                    <FoodTypeManager 
                        businessId={businessId}
                        selectedTypeIds={selectedFoodTypeIds}
                        onToggleType={handleToggleFoodType}
                    />

                    <hr className="border-stone-100 dark:border-stone-800" />

                    {/* Availability Section */}
                    <div className="flex items-center justify-between bg-stone-50 dark:bg-stone-800 p-4 rounded-xl border border-stone-200 dark:border-stone-700">
                        <div>
                            <h3 className="text-sm font-bold text-stone-900 dark:text-white">Item Availability</h3>
                            <p className="text-xs text-stone-500 dark:text-stone-400">Toggle if this item is currently in stock.</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleToggleAvailable}
                            className={`inline-flex items-center px-4 py-2 rounded-xl border text-sm font-bold transition-all btn-press ${
                                formData.is_available 
                                ? 'bg-white dark:bg-stone-700 text-green-700 dark:text-green-400 border-stone-200 dark:border-stone-600 shadow-sm' 
                                : 'bg-stone-200 dark:bg-stone-900 text-stone-500 dark:text-stone-400 border-transparent'
                            }`}
                        >
                            {formData.is_available ? (
                                <>
                                    <Check size={18} className="mr-2 text-green-600 dark:text-green-400" />
                                    Available
                                </>
                            ) : (
                                <>
                                    <Ban size={18} className="mr-2 text-stone-400" />
                                    Sold Out
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-stone-100 dark:border-stone-800 flex justify-end gap-3 bg-stone-50/50 dark:bg-stone-800/50 rounded-b-2xl">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 transition-colors btn-press"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    form="item-form"
                    className="px-4 py-2 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-sm transition-all btn-press"
                >
                    Save Item
                </button>
            </div>

        </div>
        </div>
    </Portal>
  );
}


