import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, name_km?: string) => Promise<void> | void;
  initialName?: string;
  initialNameKm?: string;
}

import Portal from '../../../shared/components/Portal';

export default function CategoryModal({
  isOpen,
  onClose,
  onSave,
  initialName = '',
  initialNameKm = '',
}: CategoryModalProps) {
  const [name, setName] = useState(initialName);
  const [nameKm, setNameKm] = useState(initialNameKm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setNameKm(initialNameKm);
      setIsSubmitting(false);
    }
  }, [isOpen, initialName, initialNameKm]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
        await onSave(name, nameKm);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Portal>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div 
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity" 
            onClick={onClose}
        />

        <div className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-2xl flex flex-col animate-fade-in-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-stone-800">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white">
                {initialName ? 'Edit Category' : 'Add Category'}
            </h2>
            <button 
                onClick={onClose}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors btn-press"
            >
                <X size={20} />
            </button>
            </div>

            <div className="p-6">
                <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Category Name (Primary)</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Starters, Main Course"
                            className="w-full rounded-xl border-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 py-2.5 px-3 text-sm font-english"
                            autoFocus
                            disabled={isSubmitting}
                            maxLength={100}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Category Name (Khmer - Optional)</label>
                        <input
                            type="text"
                            value={nameKm}
                            onChange={(e) => setNameKm(e.target.value)}
                            placeholder="e.g. គ្រឿងក្លែម"
                            className="w-full rounded-xl border-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 py-2.5 px-3 text-sm font-khmer"
                            disabled={isSubmitting}
                            maxLength={100}
                        />
                    </div>
                </form>
            </div>

            <div className="px-6 py-4 border-t border-stone-100 dark:border-stone-800 flex justify-end gap-3 bg-stone-50/50 dark:bg-stone-800/50 rounded-b-2xl">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors btn-press disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    form="category-form"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 dark:hover:bg-orange-500 rounded-xl shadow-sm transition-all btn-press disabled:opacity-50 flex items-center"
                >
                    {isSubmitting ? 'Saving...' : (initialName ? 'Save Changes' : 'Create Category')}
                </button>
            </div>
        </div>
        </div>
    </Portal>
  );
}
