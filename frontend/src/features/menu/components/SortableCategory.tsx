import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Edit2 } from 'lucide-react';
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
      <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? 'opacity-100' : ''}`}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEditCategory(category);
          }}
          className={`p-1.5 rounded-lg transition-colors ${
             isSelected 
             ? 'text-orange-400 hover:text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/40' 
             : 'text-stone-400 hover:text-orange-600 hover:bg-stone-200 dark:hover:bg-stone-700' 
          }`}
        >
          <Edit2 size={14} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteCategory(category.id);
          }}
          className={`p-1.5 rounded-lg transition-colors ${
             isSelected 
             ? 'text-orange-400 hover:text-red-600 hover:bg-orange-100 dark:hover:bg-orange-900/40' 
             : 'text-stone-400 hover:text-red-600 hover:bg-stone-200 dark:hover:bg-stone-700' 
          }`}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
