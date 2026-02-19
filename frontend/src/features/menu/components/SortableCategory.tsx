import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Edit2, MoreVertical } from 'lucide-react';
import type { Category } from '../services/menu.service';

interface SortableCategoryProps {
  category: Category;
  itemCount: number;
  isSelected: boolean;
  onSelect: (categoryId: string) => void;
  onDeleteCategory: (id: string) => void;
  onEditCategory: (category: Category) => void;
}

export function SortableCategory({
  category,
  itemCount,
  isSelected,
  onSelect,
  onDeleteCategory,
  onEditCategory
}: SortableCategoryProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm cursor-pointer transition-all border ${
        isSelected 
            ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800' 
            : 'bg-transparent text-stone-600 dark:text-stone-400 border-transparent hover:bg-stone-100 dark:hover:bg-stone-800'
      } ${isDragging ? 'z-40 opacity-50 bg-stone-100' : ''}`}
      onClick={() => onSelect(category.id)}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div
          {...attributes}
          {...listeners}
          className={`cursor-grab active:cursor-grabbing p-1 rounded-md touch-none transition-colors ${
            isSelected
                ? 'text-orange-300 dark:text-orange-700 hover:text-orange-500 dark:hover:text-orange-500'
                : 'text-stone-300 dark:text-stone-600 hover:text-stone-500 dark:hover:text-stone-400 group-hover:text-stone-400'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={16} />
        </div>
        <div className="flex flex-col truncate">
          <span className={`font-semibold truncate ${isSelected ? 'text-orange-900 dark:text-orange-100' : 'text-stone-700 dark:text-stone-300'}`}>
            {category.name}
          </span>
          <span className={`text-xs ${isSelected ? 'text-orange-500 dark:text-orange-400' : 'text-stone-400 dark:text-stone-500'}`}>
            {itemCount} item{itemCount === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
          className={`p-1.5 rounded-lg transition-colors ${
             isSelected 
             ? 'text-orange-400 hover:text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/40' 
             : 'text-stone-400 hover:text-stone-600 hover:bg-stone-200 dark:hover:bg-stone-700' 
          }`}
        >
          <MoreVertical size={16} />
        </button>

        {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-stone-900 rounded-xl shadow-xl border border-stone-100 dark:border-stone-800 z-[60] py-1 animate-fade-in-up">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEditCategory(category);
                        setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                >
                    <Edit2 size={14} className="text-stone-400" />
                    Edit
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCategory(category.id);
                        setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
                >
                    <Trash2 size={14} />
                    Delete
                </button>
            </div>
        )}
      </div>
    </div>
  );
}
