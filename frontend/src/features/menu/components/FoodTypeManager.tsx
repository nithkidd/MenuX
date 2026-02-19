import React, { useState, useEffect } from 'react';
import { Plus, X, Leaf, Flame, Droplets, Sun, Heart, Award, Zap, Coffee, Type } from 'lucide-react';
import { type FoodType, foodTypeService } from '../services/food-type.service';

interface FoodTypeManagerProps {
  businessId: string;
  selectedTypeIds: string[];
  onToggleType: (id: string) => void;
}

const AVAILABLE_ICONS = [
  { name: 'Leaf', icon: Leaf },
  { name: 'Flame', icon: Flame },
  { name: 'Droplets', icon: Droplets },
  { name: 'Sun', icon: Sun },
  { name: 'Heart', icon: Heart },
  { name: 'Award', icon: Award },
  { name: 'Zap', icon: Zap },
  { name: 'Coffee', icon: Coffee },
  { name: 'Text', icon: Type }, // Represents "No Icon" / Text Only
];

export function FoodTypeManager({ businessId, selectedTypeIds, onToggleType }: FoodTypeManagerProps) {
  const [foodTypes, setFoodTypes] = useState<FoodType[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeIcon, setNewTypeIcon] = useState('Leaf');
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadFoodTypes();
  }, [businessId]);

  const loadFoodTypes = async () => {
    try {
      const data = await foodTypeService.getAll(businessId);
      setFoodTypes(data);
    } catch (error) {
      console.error("Failed to load food types", error);
    }
  };

  const handleCreate = async () => {
    if (!newTypeName.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    // If "Text" is selected, we save it as empty string or specific "Text" marker? 
    // Let's save as "Text" to be explicit, or just use the icon name.
    // If the user picked "Text" (Type icon), we keep it as "Text".
    
    try {
        await foodTypeService.create(businessId, newTypeName, newTypeIcon);
        setNewTypeName('');
        setIsCreating(false);
        setIsIconPickerOpen(false);
        loadFoodTypes();
    } catch (error) {
        console.error("Failed to create food type", error);
        alert("Failed to create tag. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this tag?")) return;
    try {
        await foodTypeService.delete(businessId, id);
        loadFoodTypes();
    } catch (error) {
       console.error("Failed to delete", error);
    }
  };

  const renderIcon = (iconName: string, className?: string) => {
      const IconComponent = AVAILABLE_ICONS.find(i => i.name === iconName)?.icon;
      if (!IconComponent) return null; // Should not happen if defaults are clean
      return <IconComponent size={18} className={className} />;
  };

  return (
    <div className="space-y-3">
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Food Tags</label>
        
        <div className="flex flex-wrap gap-2">
            {foodTypes.map(type => {
                const isSelected = selectedTypeIds.includes(type.id);
                const isTextOnly = type.icon === 'Text';

                return (
                    <div key={type.id} className="relative group">
                        <button
                            type="button"
                            onClick={() => onToggleType(type.id)}
                            title={type.name}
                            className={`flex items-center justify-center transition-all btn-press shadow-sm ${
                                isTextOnly 
                                ? 'px-3 h-10 rounded-xl text-sm font-bold' 
                                : 'w-10 h-10 rounded-full'
                            } ${
                                isSelected 
                                ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 border' 
                                : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-400 dark:text-stone-500 border hover:border-stone-300 dark:hover:border-stone-600 hover:text-stone-600 dark:hover:text-stone-300'
                            }`}
                        >
                            {isTextOnly ? type.name : renderIcon(type.icon)}
                        </button>
                        
                        {/* Delete Button (visible on hover) */}
                        <button
                            type="button"
                            onClick={(e) => handleDelete(type.id, e)}
                            className="absolute -top-1 -right-1 bg-stone-100 dark:bg-stone-700 text-stone-400 dark:text-stone-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full p-0.5 border border-stone-200 dark:border-stone-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                            title={`Delete ${type.name}`}
                        >
                            <X size={10} />
                        </button>
                    </div>
                );
            })}

            <button
                type="button"
                onClick={() => setIsCreating(!isCreating)}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-dashed border-stone-300 dark:border-stone-700 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 hover:border-stone-400 dark:hover:border-stone-500 transition-colors btn-press bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700"
                title="Add New Tag"
            >
                <Plus size={20} />
            </button>
        </div>

        {isCreating && (
            <div className="bg-stone-50 dark:bg-stone-800 p-3 rounded-xl border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row gap-2 items-center animate-fade-in-up mt-2">
                
                {/* Custom Icon Picker */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsIconPickerOpen(!isIconPickerOpen)}
                        className="flex items-center justify-center w-10 h-10 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg hover:border-orange-500 dark:hover:border-orange-500 hover:text-orange-500 transition-colors dark:text-stone-300"
                        title="Select Icon"
                    >
                        {renderIcon(newTypeIcon)}
                    </button>

                    {isIconPickerOpen && (
                        <div className="absolute top-12 left-0 z-50 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-xl rounded-xl p-2 w-56 grid grid-cols-4 gap-2 animate-fade-in-up">
                            {AVAILABLE_ICONS.map(item => (
                                <button
                                    key={item.name}
                                    type="button"
                                    onClick={() => {
                                        setNewTypeIcon(item.name);
                                        setIsIconPickerOpen(false);
                                    }}
                                    className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                                        newTypeIcon === item.name 
                                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 ring-2 ring-orange-500 ring-offset-1 dark:ring-offset-stone-900' 
                                        : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400'
                                    }`}
                                    title={item.name === 'Text' ? 'Text Only' : item.name}
                                >
                                    <item.icon size={20} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <input
                    type="text"
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    placeholder="Tag Name"
                    className="flex-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-white text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2"
                    autoFocus
                    disabled={isSubmitting}
                    maxLength={30}
                />
                
                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={handleCreate}
                        disabled={isSubmitting}
                        className="flex-1 sm:flex-none text-white bg-orange-600 hover:bg-orange-700 font-medium rounded-lg text-sm px-3 py-2 btn-press disabled:opacity-50"
                    >
                        {isSubmitting ? '...' : 'Add'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsCreating(false)}
                        disabled={isSubmitting}
                        className="flex-1 sm:flex-none text-stone-500 dark:text-stone-400 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 font-medium rounded-lg text-sm px-3 py-2 btn-press"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        )}
    </div>
  );
}
