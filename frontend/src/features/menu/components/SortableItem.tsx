import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit2, Trash2, MoreVertical } from 'lucide-react';
import type { Item } from '../services/menu.service';

interface SortableItemProps {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
}

export function SortableItem({ item, onEdit, onDelete }: SortableItemProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

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
      className={`flex justify-between items-center py-3 border-b border-stone-100 dark:border-stone-800 last:border-0 group bg-white dark:bg-stone-900 ${isDragging ? 'z-50 shadow-lg' : ''}`}
    >
      <div className="flex items-center space-x-4 flex-1">
        {/* Drag Handle */}
        <div 
            {...attributes} 
            {...listeners}
            className="text-stone-300 dark:text-stone-600 hover:text-stone-500 dark:hover:text-stone-400 cursor-grab active:cursor-grabbing p-1 touch-none"
        >
            <GripVertical size={20} />
        </div>

        {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-stone-100 dark:bg-stone-800" />
        ) : (
             <div className="w-12 h-12 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-300 dark:text-stone-600">
                <div className="w-6 h-6 rounded-full border-2 border-stone-200 dark:border-stone-700" /> 
             </div>
        )}
        
        <div>
            <div className="flex items-center">
                <span className="font-semibold text-stone-900 dark:text-white mr-2">{item.name}</span>
                {!item.is_available && <span className="text-xs bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 px-1.5 py-0.5 rounded">Sold Out</span>}
            </div>
            <div className="text-sm text-stone-500 dark:text-stone-400">${item.price.toFixed(2)}</div>
        </div>
      </div>

      <div className="relative" ref={menuRef}>
        <button 
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 p-2 rounded-full hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors btn-press"
        >
            <MoreVertical size={20} />
        </button>

        {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-stone-900 rounded-xl shadow-xl border border-stone-100 dark:border-stone-800 z-[60] py-1 animate-fade-in-up">
                <button
                    onClick={() => {
                        onEdit(item);
                        setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                >
                    <Edit2 size={14} className="text-stone-400" />
                    Edit
                </button>
                <button
                    onClick={() => {
                        onDelete(item.id);
                        setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                    <Trash2 size={14} />
                    Delete Item
                </button>
            </div>
        )}
      </div>
    </div>
  );
}
