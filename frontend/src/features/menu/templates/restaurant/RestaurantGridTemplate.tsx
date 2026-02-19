import { useState } from 'react';
import { Search } from 'lucide-react';
import type { PublicMenuData } from '../../services/public-menu.service';
import type { Item } from '../../services/menu.service';
import { RestaurantItemCard } from './components/RestaurantItemCard';
import { ItemDetailModal } from './components/ItemDetailModal';

interface RestaurantGridTemplateProps {
  data: PublicMenuData;
  currentLang: 'en' | 'km';
}

import { getFontClass } from '../../../../shared/utils/text-utils'; 

export function RestaurantGridTemplate({ data, currentLang }: RestaurantGridTemplateProps) {
  const { categories } = data;
  const nonEmptyCategories = categories.filter(c => c.items && c.items.length > 0);
  
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Optional: clear selected item after animation, or immediately
    // setSelectedItem(null); 
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-12">
        {nonEmptyCategories.map(category => {
            const displayName = currentLang === 'km' && category.name_km ? category.name_km : category.name;
            const fontClass = getFontClass(displayName, currentLang === 'km' ? 'font-khmer' : 'font-english');

            return (
            <div key={category.id} id={`category-${category.id}`} className="scroll-mt-48">
                <h2 className={`text-2xl font-bold text-gray-900 mb-6 flex items-center ${fontClass}`}>
                    {displayName}
                </h2>
                
                {/* Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {category.items?.map(item => (
                        <RestaurantItemCard 
                            key={item.id} 
                            item={item} 
                            currentLang={currentLang} 
                            exchangeRate={data.business.exchange_rate_khr}
                            onClick={() => handleItemClick(item)}
                        />
                    ))}
                </div>
            </div>
            );
        })}

        {nonEmptyCategories.length === 0 && (
            <div className="text-center py-20">
                <div className="bg-gray-50 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
                    <Search className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No items available</h3>
                <p className="text-gray-500">Check back later for updates.</p>
            </div>
        )}

        <ItemDetailModal 
            item={selectedItem}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            currentLang={currentLang}
            exchangeRate={data.business.exchange_rate_khr}
        />
    </div>
  );
}
