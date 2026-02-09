
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { menuService, type Category } from '../services/menu.service';
import { businessService, type Business } from '../../business/services/business.service';
import { Plus, Trash2, ExternalLink } from 'lucide-react'; 

export default function MenuEditor() {
  const { businessId } = useParams<{ businessId: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCatName, setNewCatName] = useState('');
  
  // Simple state to track which category is adding an item
  const [addingItemTo, setAddingItemTo] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  useEffect(() => {
    if (businessId) {
      loadMenu();
      loadBusiness();
    }
  }, [businessId]);

  const loadBusiness = async () => {
    if (!businessId) return;
    try {
      const data = await businessService.getById(businessId);
      setBusiness(data);
    } catch (error) {
      console.error('Failed to load business', error);
    }
  };

  const loadMenu = async () => {
    if (!businessId) return;
    try {
      setLoading(true);
      const data = await menuService.getCategories(businessId);
      setCategories(data);
    } catch (error) {
      console.error('Failed to load menu', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId || !newCatName.trim()) return;
    try {
      await menuService.createCategory(businessId, newCatName);
      setNewCatName('');
      loadMenu();
    } catch (error) {
      alert('Failed to create category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete category?')) return;
    try {
      await menuService.deleteCategory(id);
      loadMenu();
    } catch (error) {
      alert('Failed to delete category');
    }
  };

  const handleAddItem = async (e: React.FormEvent, categoryId: string) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice) return;
    try {
      await menuService.createItem(categoryId, {
        name: newItemName,
        price: parseFloat(newItemPrice)
      });
      setAddingItemTo(null);
      setNewItemName('');
      setNewItemPrice('');
      loadMenu();
    } catch (error) {
      alert('Failed to create item');
    }
  };

  const handleDeleteItem = async (id: string) => {
     if (!confirm('Delete item?')) return;
     try {
       await menuService.deleteItem(id);
       loadMenu();
     } catch (error) {
       alert('Failed to delete item');
     }
  };

  if (loading) return <div className="p-8 text-center bg-gray-50 min-h-screen">Loading menu...</div>;

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
            <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="text-gray-500 hover:text-gray-900">← Back</Link>
                <h1 className="text-2xl font-bold text-gray-900">Menu Editor: {business?.name}</h1>
            </div>
            {business && (
              <a 
                href={`/menu/${business.slug}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-900 flex items-center space-x-1"
              >
                  <span>View Public Menu</span>
                  <ExternalLink size={16} />
              </a>
            )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Add Category Form */}
        <div className="bg-white p-4 rounded-lg shadow mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Category</h3>
            <form onSubmit={handleAddCategory} className="flex gap-2">
                <input
                    type="text"
                    placeholder="Category Name (e.g. Starters)"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                />
                <button
                    type="submit"
                    className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    <Plus size={16} className="mr-1"/> Add
                </button>
            </form>
        </div>

        {/* Categories List */}
        <div className="space-y-6">
            {categories.map(category => (
                <div key={category.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                        <button onClick={() => handleDeleteCategory(category.id)} className="text-gray-400 hover:text-red-500">
                            <Trash2 size={18} />
                        </button>
                    </div>
                    
                    <div className="p-4 space-y-3">
                        {category.items?.map(item => (
                            <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                <div>
                                    <div className="font-medium text-gray-900">{item.name}</div>
                                    <div className="text-sm text-gray-500">${item.price.toFixed(2)}</div>
                                </div>
                                <button onClick={() => handleDeleteItem(item.id)} className="text-gray-400 hover:text-red-500">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        
                        {addingItemTo === category.id ? (
                            <form onSubmit={(e) => handleAddItem(e, category.id)} className="mt-3 p-3 bg-gray-50 rounded border border-indigo-100">
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <input 
                                        type="text" 
                                        placeholder="Item Name" 
                                        className="rounded border-gray-300 px-2 py-1 text-sm w-full"
                                        value={newItemName}
                                        onChange={e => setNewItemName(e.target.value)}
                                        autoFocus
                                    />
                                    <input 
                                        type="number" 
                                        placeholder="Price" 
                                        step="0.01"
                                        className="rounded border-gray-300 px-2 py-1 text-sm w-full"
                                        value={newItemPrice}
                                        onChange={e => setNewItemPrice(e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <button 
                                        type="button" 
                                        onClick={() => setAddingItemTo(null)}
                                        className="text-xs text-gray-500 hover:text-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                                    >
                                        Save Item
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <button 
                                onClick={() => {
                                    setAddingItemTo(category.id);
                                    setNewItemName('');
                                    setNewItemPrice('');
                                }}
                                className="mt-2 w-full flex items-center justify-center p-2 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-indigo-500 hover:text-indigo-500 text-sm"
                            >
                                <Plus size={16} className="mr-1" /> Add Item
                            </button>
                        )}
                    </div>
                </div>
            ))}
            
            {categories.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No categories yet. Add one above.
                </div>
            )}
        </div>

      </div>
    </div>
  );
}
