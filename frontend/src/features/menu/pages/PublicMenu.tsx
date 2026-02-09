
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { publicMenuService, type PublicMenuData } from '../services/public-menu.service';

export default function PublicMenu() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PublicMenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) loadMenu();
  }, [slug]);

  const loadMenu = async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const menuData = await publicMenuService.getMenuBySlug(slug);
      setData(menuData);
    } catch (err) {
      setError('Failed to load menu. It might not exist.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  if (error || !data) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500">{error || 'Menu not found'}</div>;

  const { business, categories } = data;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center space-x-4">
            {business.logo_url && (
                <img src={business.logo_url} alt={business.name} className="h-12 w-12 rounded-full object-cover" />
            )}
            <div>
                <h1 className="text-xl font-bold text-gray-900">{business.name}</h1>
                <p className="text-sm text-gray-500">{business.description}</p>
            </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {categories.map(category => (
            <div key={category.id} id={`category-${category.id}`}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">{category.name}</h2>
                <div className="grid gap-6 sm:grid-cols-1">
                    {category.items?.map(item => (
                        <div key={item.id} className="flex space-x-4 py-4">
                            {item.image_url && (
                                <div className="flex-shrink-0">
                                    <img className="h-24 w-24 rounded-lg object-cover" src={item.image_url} alt={item.name} />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                                    <p className="text-lg font-medium text-gray-900">${item.price.toFixed(2)}</p>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                            </div>
                        </div>
                    ))}
                    {(!category.items || category.items.length === 0) && (
                        <p className="text-gray-400 italic">No items in this category.</p>
                    )}
                </div>
            </div>
        ))}

        {categories.length === 0 && (
            <div className="text-center py-12 text-gray-500">
                Menu is empty.
            </div>
        )}
      </div>
    </div>
  );
}
