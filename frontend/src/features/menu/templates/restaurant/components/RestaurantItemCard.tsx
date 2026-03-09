import { Leaf, Flame, Image as ImageIcon } from 'lucide-react';
import type { Item } from '../../../services/menu.service';

interface RestaurantItemCardProps {
  item: Item;
  currentLang: 'en' | 'km';
  exchangeRate?: number;
  onClick?: () => void;
}

import { getFontClass } from '../../../../../shared/utils/text-utils'; 

export function RestaurantItemCard({ item, currentLang, exchangeRate = 4000, onClick }: RestaurantItemCardProps) {
  const displayName = currentLang === 'km' && item.name_km ? item.name_km : item.name;
  const fontClass = getFontClass(displayName, currentLang === 'km' ? 'font-khmer' : 'font-english');

  // Currency Formatting
  const formatPrice = (price: number) => {
    if (currentLang === 'km') {
        const khrPrice = Math.round(price * exchangeRate / 100) * 100; // Round to nearest 100
        return `${khrPrice.toLocaleString()} ៛`;
    }
    return `$${price.toFixed(2)}`;
  };

  const hasDiscount = item.original_price && item.original_price > item.price;
  const discountPercent = hasDiscount 
    ? Math.round(((item.original_price! - item.price) / item.original_price!) * 100) 
    : 0;

  return (
    <div 
        onClick={onClick}
        className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-md transition-all cursor-pointer flex flex-col h-full group active:scale-[0.98]"
    >
      {/* Image Container */}
      <div className="relative h-56 sm:h-64 w-full bg-stone-100 overflow-hidden">
        {item.image_url ? (
          <img 
            src={item.image_url} 
            alt={displayName} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 bg-stone-50"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300">
            <ImageIcon size={32} />
          </div>
        )}
        
        {/* Badges/Tags overlay top left */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
            {item.is_hot && (
                <span className="bg-[#fe3b58] text-white text-[10px] font-black tracking-wider px-2 py-0.5 rounded shadow-sm border border-white/20">
                    POPULAR
                </span>
            )}
            {hasDiscount && (
                <span className="bg-orange-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                    {discountPercent}% OFF
                </span>
            )}
        </div>
        
        {/* Badges/Tags overlay top right */}
        <div className="absolute top-2 right-2 flex gap-1">
          {item.is_vegetarian && (
            <div className="bg-green-100 text-green-700 p-1.5 rounded-full shadow-sm" title="Vegetarian">
              <Leaf size={14} fill="currentColor" />
            </div>
          )}
          {item.is_spicy && (
            <div className="bg-red-100 text-red-700 p-1.5 rounded-full shadow-sm" title="Spicy">
              <Flame size={14} fill="currentColor" />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
            <h3 className={`font-bold text-lg text-stone-900 line-clamp-2 leading-tight ${fontClass}`}>
                {displayName}
            </h3>
            <div className="flex flex-col items-end">
                <span 
                    className={`font-bold px-2 py-1 rounded-lg text-sm whitespace-nowrap ml-2 bg-stone-100 ${currentLang === 'km' ? 'font-khmer' : ''}`}
                    style={{ color: 'var(--primary)' }}
                >
                    {formatPrice(item.price)}
                </span>
                {hasDiscount && (
                    <span className={`text-xs text-stone-400 line-through mt-0.5 mr-1 ${currentLang === 'km' ? 'font-khmer' : ''}`}>
                        {formatPrice(item.original_price!)}
                    </span>
                )}
            </div>
        </div>
        
        {item.description && (
            <p className={`text-stone-500 text-sm line-clamp-3 mb-4 flex-1 ${getFontClass(item.description, currentLang === 'km' ? 'font-khmer' : 'font-english')}`}>
                {item.description}
            </p>
        )}

        {/* Footer/Action Area */}
        {!item.is_available && (
            <div className="mt-auto pt-3 border-t border-stone-100">
                <span className="text-xs font-medium bg-stone-100 text-stone-500 px-2 py-1 rounded-md">
                    Sold Out
                </span>
            </div>
        )}
      </div>
    </div>
  );
}
