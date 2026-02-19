import { useRef, useEffect } from 'react';
import { X, Leaf, Flame, Image as ImageIcon } from 'lucide-react';
import ReactDOM from 'react-dom';
import type { Item } from '../../../services/menu.service';
import { getFontClass } from '../../../../../shared/utils/text-utils';

interface ItemDetailModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  currentLang: 'en' | 'km';
  exchangeRate?: number;
}

export function ItemDetailModal({ 
  item, 
  isOpen, 
  onClose, 
  currentLang, 
  exchangeRate = 4000 
}: ItemDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent scrolling background
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen || !item) return null;

  const displayName = (currentLang === 'km' && item.name_km) ? item.name_km : item.name;
  const fontClass = getFontClass(displayName, currentLang === 'km' ? 'font-khmer' : 'font-english');

  // Currency Formatting (Reused logic)
  const formatPrice = (price: number) => {
    const numPrice = typeof price === 'number' ? price : Number(price);
    if (isNaN(numPrice)) return '';

    if (currentLang === 'km') {
        const khrPrice = Math.round(numPrice * exchangeRate / 100) * 100;
        return `${khrPrice.toLocaleString()} ៛`;
    }
    return `$${numPrice.toFixed(2)}`;
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop with blur effect */}
      <div 
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
      >
        {/* Close Button - absolute positioned */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Hero Image */}
        <div className="relative w-full aspect-video bg-stone-100 dark:bg-stone-800 shrink-0">
          {item.image_url ? (
            <img 
              src={item.image_url} 
              alt={displayName} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-300">
              <ImageIcon size={48} />
            </div>
          )}
          
          {/* Badges Overlay */}
          <div className="absolute bottom-3 left-3 flex gap-2">
            {item.is_vegetarian && (
              <span className="bg-green-100/90 text-green-800 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm backdrop-blur-sm">
                <Leaf size={12} fill="currentColor" /> Vegetarian
              </span>
            )}
            {item.is_spicy && (
              <span className="bg-red-100/90 text-red-800 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm backdrop-blur-sm">
                <Flame size={12} fill="currentColor" /> Spicy
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col overflow-y-auto">
          <div className="flex justify-between items-start gap-4 mb-3">
            <h2 className={`text-xl font-bold text-stone-900 dark:text-white leading-tight ${fontClass}`}>
              {displayName}
            </h2>
            <div 
                className={`text-lg font-bold px-3 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 whitespace-nowrap ${currentLang === 'km' ? 'font-khmer' : ''}`}
                style={{ color: 'var(--primary)' }}
            >
               {formatPrice(item.price)}
            </div>
          </div>

          <div className="prose prose-stone dark:prose-invert prose-sm max-w-none">
             {item.description ? (
               <p className="whitespace-pre-wrap text-stone-600 dark:text-stone-300 leading-relaxed text-sm">
                   {item.description}
               </p>
             ) : (
                <p className="italic text-stone-400 text-sm">No description available.</p>
             )}
          </div>

          {!item.is_available && (
             <div className="mt-6 p-3 bg-stone-100 dark:bg-stone-800 rounded-xl text-center text-stone-500 font-medium text-sm border border-stone-200 dark:border-stone-700">
                Currently Unavailable
             </div>
          )}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}
