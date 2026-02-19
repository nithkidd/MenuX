import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { menuService, type Category, type Item } from '../services/menu.service';
import { foodTypeService } from '../services/food-type.service';
import { 
  Plus
} from 'lucide-react';
import PageTransition from '../../../shared/components/PageTransition'; 
import ItemModal from '../components/ItemModal';
import CategoryModal from '../components/CategoryModal';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';

import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  type DragEndEvent 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { SortableCategory } from '../components/SortableCategory';
import { SortableItem } from '../components/SortableItem';

export default function MenuEditor() {
  const { businessId } = useParams<{ businessId: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [targetCategoryId, setTargetCategoryId] = useState<string | null>(null);

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    loading?: boolean;
    variant?: 'danger' | 'warning' | 'default';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  type NotificationType = 'success' | 'error';
  interface Notification {
    id: number;
    type: NotificationType;
    message: string;
  }
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadMenu = useCallback(async () => {
    if (!businessId) return;
    try {
      setLoading(true);
      const data = await menuService.getCategories(businessId);
      setCategories(data);
      setSelectedCategoryId(prev =>
        prev && data.some(cat => cat.id === prev)
          ? prev
          : data.length > 0
          ? data[0].id
          : null
      );
    } catch (error) {
      console.error('Failed to load menu', error);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (businessId) {
      loadMenu();
    }
  }, [businessId, loadMenu]);

  const showNotification = (message: string, type: NotificationType = 'success') => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // Check if dragging a category
    const activeCategoryIndex = categories.findIndex(cat => cat.id === active.id);
    const overCategoryIndex = categories.findIndex(cat => cat.id === over.id);

    if (activeCategoryIndex !== -1 && overCategoryIndex !== -1) {
        // Reordering categories
        const newCategories = arrayMove(categories, activeCategoryIndex, overCategoryIndex);
        setCategories(newCategories); // Optimistic update
        
        // Prepare API payload
        const reorderPayload = newCategories.map((cat, index) => ({
            id: cat.id,
            sort_order: index
        }));

        try {
            await menuService.reorderCategories(reorderPayload);
        } catch (error) {
            console.error("Failed to reorder categories", error);
            loadMenu(); // Revert on error
        }
        return;
    }

    // Check if dragging an item
    // Find source category and item
    let sourceCategory: Category | undefined;
    let sourceItem: Item | undefined;

    for (const cat of categories) {
        const item = cat.items?.find(i => i.id === active.id);
        if (item) {
            sourceCategory = cat;
            sourceItem = item;
            break;
        }
    }

    if (sourceCategory && sourceItem) {
        // Find target item (over)
        // Since we only support reordering WITHIN a category for now (simplification), 
        // verify over is in the same category
        const isOverInSameCategory = sourceCategory.items.some(i => i.id === over.id);

        if (isOverInSameCategory) {
            const oldIndex = sourceCategory.items.findIndex(i => i.id === active.id);
            const newIndex = sourceCategory.items.findIndex(i => i.id === over.id);

            const newItems = arrayMove(sourceCategory.items, oldIndex, newIndex);
            
            // Update local state
            const newCategories = categories.map(cat => {
                if (cat.id === sourceCategory!.id) {
                    return { ...cat, items: newItems };
                }
                return cat;
            });
            setCategories(newCategories);

             // Prepare API payload
             const reorderPayload = newItems.map((item, index) => ({
                id: item.id,
                sort_order: index
            }));

            try {
                await menuService.reorderItems(sourceCategory.id, reorderPayload);
            } catch (error) {
                console.error("Failed to reorder items", error);
                loadMenu(); // Revert
            }
        }
    }
  };

  const handleSaveCategory = async (name: string, name_km?: string) => {
    if (!businessId) return;
    try {
      if (editingCategory) {
        await menuService.updateCategory(editingCategory.id, name, name_km);
        showNotification('Category updated', 'success');
      } else {
        await menuService.createCategory(businessId, name, name_km);
        showNotification('Category created', 'success');
      }
      setIsCategoryModalOpen(false);
      loadMenu();
    } catch (error) {
      console.error('Failed to save category', error);
      showNotification('Failed to save category', 'error');
    }
  };

  const handleDeleteCategory = (id: string) => {
    const category = categories.find(c => c.id === id);
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Category',
      message: `Are you sure you want to delete "${category?.name || 'this category'}"? All items inside this category will also be deleted. This action cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        try {
          await menuService.deleteCategory(id);
          showNotification('Category deleted', 'success');
          loadMenu();
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        } catch (error) {
          console.error('Failed to delete category', error);
          showNotification('Failed to delete category', 'error');
          setConfirmDialog(prev => ({ ...prev, loading: false }));
        }
      },
    });
  };

  // Open modal for Create Item
  const openCreateModal = (categoryId: string) => {
    setEditingItem(null); // Create mode
    setTargetCategoryId(categoryId);
    setIsModalOpen(true);
  };

  // Open modal for Edit Item
  const openEditModal = (item: Item) => {
    setEditingItem(item); // Edit mode
    setTargetCategoryId(item.category_id);
    setIsModalOpen(true);
  };

  // Handle Save from Item Modal
  const handleSaveItem = async (formData: Partial<Item>, foodTypeIds: string[]) => {
    try {
        let savedItem: Item;
        if (editingItem) {
            // Update
            savedItem = await menuService.updateItem(editingItem.id, formData);
        } else {
            // Create
            if (!formData.category_id) return;
            savedItem = await menuService.createItem(formData.category_id, formData);
        }

        // Save tags
        if (foodTypeIds) {
            await foodTypeService.setItemTags(savedItem.id, foodTypeIds);
        }

        setIsModalOpen(false);
        loadMenu();
    } catch (error) {
        console.error("Failed to save item", error);
        showNotification('Failed to save item', 'error');
    }
  };

  const handleDeleteItem = (id: string) => {
     let itemName = 'this item';
     for (const cat of categories) {
        const item = cat.items?.find(i => i.id === id);
        if (item) {
            itemName = item.name;
            break;
        }
     }
     
     setConfirmDialog({
       isOpen: true,
       title: 'Delete Item',
       message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
       variant: 'danger',
       onConfirm: async () => {
         setConfirmDialog(prev => ({ ...prev, loading: true }));
         try {
           await menuService.deleteItem(id);
           showNotification('Item deleted', 'success');
           loadMenu();
           setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
         } catch (error) {
           console.error('Failed to delete item', error);
           showNotification('Failed to delete item', 'error');
           setConfirmDialog(prev => ({ ...prev, loading: false }));
         }
       },
     });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
             {/* Sidebar Skeleton */}
             <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
                <div className="flex items-center justify-between px-1">
                    <div className="h-4 w-24 bg-stone-200 dark:bg-stone-800 rounded animate-pulse" />
                    <div className="h-8 w-8 bg-stone-200 dark:bg-stone-800 rounded-lg animate-pulse" />
                </div>
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-12 w-full bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 animate-pulse" />
                    ))}
                </div>
             </div>

             {/* Main Content Skeleton */}
             <div className="flex-1 w-full min-h-[500px] bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-stone-100 dark:border-stone-800">
                    <div>
                        <div className="h-8 w-48 bg-stone-200 dark:bg-stone-800 rounded animate-pulse mb-2" />
                        <div className="h-4 w-64 bg-stone-100 dark:bg-stone-800 rounded animate-pulse" />
                    </div>
                    <div className="h-10 w-32 bg-stone-200 dark:bg-stone-800 rounded-xl animate-pulse" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 w-full bg-stone-50 dark:bg-stone-800/50 rounded-2xl animate-pulse" />
                    ))}
                </div>
             </div>
        </div>
      </div>
    );
  }

  return (
    <PageTransition className="pb-20">
      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="fixed right-4 top-24 z-50 space-y-3 pointer-events-none">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-xl px-4 py-3 shadow-md text-sm font-medium animate-fade-in-up pointer-events-auto ${
                  notification.type === 'error'
                    ? 'bg-red-50 text-red-800 dark:bg-red-900/40 dark:text-red-100 border border-red-200 dark:border-red-800'
                    : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100 border border-emerald-200 dark:border-emerald-800'
                }`}
              >
                {notification.message}
              </div>
            ))}
          </div>
        )}
        


        {/* Main Editor Layout */}
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                
                {/* Sidebar (Categories) */}
                <div className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-36 space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-sm font-bold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                            Categories
                        </h2>
                        <button
                            onClick={() => {
                                setEditingCategory(null);
                                setIsCategoryModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-orange-600 hover:bg-orange-50 dark:text-stone-400 dark:hover:text-orange-400 dark:hover:bg-orange-900/20 transition-colors"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    {categories.length === 0 ? (
                         <div className="text-center py-8 px-4 text-stone-500 dark:text-stone-400 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 border-dashed">
                            <p className="text-sm">No categories.</p>
                            <button
                                onClick={() => {
                                    setEditingCategory(null);
                                    setIsCategoryModalOpen(true);
                                }}
                                className="mt-2 text-sm font-bold text-orange-600 hover:underline"
                            >
                                Create one
                            </button>
                        </div>
                    ) : (
                        <SortableContext
                            items={categories.map((cat) => cat.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-2">
                                {categories.map((category) => (
                                    <SortableCategory
                                        key={category.id}
                                        category={category}
                                        itemCount={category.items?.length ?? 0}
                                        isSelected={selectedCategoryId === category.id}
                                        onSelect={(id) => setSelectedCategoryId(id)}
                                        onDeleteCategory={handleDeleteCategory}
                                        onEditCategory={(cat) => {
                                            setEditingCategory(cat);
                                            setIsCategoryModalOpen(true);
                                        }}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    )}
                </div>

                {/* Main Content (Items) */}
                <div className="flex-1 w-full min-h-[500px] bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
                {(() => {
                    const selectedCategory =
                    categories.find((cat) => cat.id === selectedCategoryId) || categories[0];

                    if (!selectedCategory) {
                        return (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-stone-400 dark:text-stone-500">
                                <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-full mb-4">
                                    <Plus size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-2">Start Building Your Menu</h3>
                                <p className="max-w-xs mx-auto">Create a category on the left to get started, or select one to add items.</p>
                            </div>
                        );
                    }

                    return (
                    <>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-stone-100 dark:border-stone-800">
                            <div>
                                <h2 className="text-2xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
                                    {selectedCategory.name}
                                    <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
                                        {selectedCategory.items?.length ?? 0}
                                    </span>
                                </h2>
                                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                                    Manage items for this category.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => openCreateModal(selectedCategory.id)}
                                className="inline-flex items-center justify-center rounded-xl border border-transparent bg-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-orange-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all btn-press ml-auto sm:ml-0"
                            >
                                <Plus size={18} className="mr-2" />
                                Add Item
                            </button>
                        </div>

                        {selectedCategory.items && selectedCategory.items.length > 0 ? (
                        <SortableContext
                            items={selectedCategory.items.map((item) => item.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-0 divide-y divide-stone-100 dark:divide-stone-800">
                                {selectedCategory.items.map((item) => (
                                    <SortableItem
                                        key={item.id}
                                        item={item}
                                        onEdit={openEditModal}
                                        onDelete={handleDeleteItem}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                        ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-16 h-16 bg-stone-50 dark:bg-stone-800 rounded-2xl flex items-center justify-center mb-4 text-stone-300 dark:text-stone-600">
                                <Plus size={32} />
                            </div>
                            <h3 className="text-lg font-medium text-stone-900 dark:text-white mb-2">No Items Yet</h3>
                            <p className="text-stone-500 dark:text-stone-400 max-w-sm mb-6">
                                This category is empty. Add your first item to start displaying delicious food to your customers.
                            </p>
                            <button
                                onClick={() => openCreateModal(selectedCategory.id)}
                                className="text-orange-600 font-bold hover:underline"
                            >
                                Add item to {selectedCategory.name}
                            </button>
                        </div>
                        )}
                    </>
                    );
                })()}
                </div>
            </div>
        </DndContext>

        {/* Modal */}
        {businessId && (
            <ItemModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveItem}
                initialData={editingItem}
                categories={categories}
                initialCategoryId={targetCategoryId}
                businessId={businessId}
            />
        )}

        {/* Category Modal */}
        <CategoryModal
            isOpen={isCategoryModalOpen}
            onClose={() => setIsCategoryModalOpen(false)}
            onSave={handleSaveCategory}
            initialName={editingCategory?.name}
            initialNameKm={editingCategory?.name_km}
        />

        {/* Action Confirm Dialog */}
        <ConfirmDialog 
            {...confirmDialog}
            onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        />

      </div>
    </PageTransition>
  );
}
