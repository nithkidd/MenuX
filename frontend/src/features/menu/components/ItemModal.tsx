import {
  useState,
  useEffect,
  useCallback,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { X, Check, Ban } from "lucide-react";
import { type Item, type Category } from "../services/menu.service";
import { foodTypeService } from "../services/food-type.service";
import { useTour } from "../../../shared/contexts/tour.context";
import { itemCreateTourSteps } from "../../../shared/config/tours";

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<Item>, foodTypeIds: string[]) => void;
  initialData?: Item | null;
  categories: Category[];
  initialCategoryId?: string | null;
  businessId: string;
}

import Portal from "../../../shared/components/Portal";

import MultiImageUpload from "../../../shared/components/MultiImageUpload";

export default function ItemModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  categories,
  initialCategoryId,
}: ItemModalProps) {
  const [formData, setFormData] = useState<Partial<Item>>({
    name: "",
    price: 0,
    description: "",
    category_id:
      initialCategoryId || (categories.length > 0 ? categories[0].id : ""),
    image_url: null,
    image_urls: [],
    sku: "",
    original_price: undefined,
    is_hot: false,
    is_available: true,
    // Legacy fields kept for interface compatibility but not used in UI if replaced by tags
    is_vegetarian: false,
    is_spicy: false,
  });

  const [selectedFoodTypeIds, setSelectedFoodTypeIds] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const { startTour, isTourCompleted } = useTour();

  const loadItemTags = useCallback(async (itemId: string) => {
    try {
      const tags = await foodTypeService.getItemTags(itemId);
      setSelectedFoodTypeIds(tags);
    } catch (error) {
      console.error("Failed to load item tags", error);
    }
  }, []);

  // Reset form when modal opens or initialData/initialCategoryId changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          ...initialData,
          image_urls:
            initialData.image_urls ||
            (initialData.image_url ? [initialData.image_url] : []),
        });
        loadItemTags(initialData.id);
      } else {
        setFormData({
          name: "",
          price: 0,
          description: "",
          category_id:
            initialCategoryId ||
            (categories.length > 0 ? categories[0].id : ""),
          image_url: null,
          image_urls: [],
          sku: "",
          original_price: undefined,
          is_hot: false,
          is_available: true,
          is_vegetarian: false,
          is_spicy: false,
        });
        setSelectedFoodTypeIds([]);
      }
    }
  }, [isOpen, initialData, initialCategoryId, categories, loadItemTags]);

  // Start item creation tour for first-time users on new item
  useEffect(() => {
    if (isOpen && !initialData && !isTourCompleted("item-create")) {
      setTimeout(() => {
        startTour("item-create", itemCreateTourSteps);
      }, 500);
    }
  }, [isOpen, initialData, isTourCompleted, startTour]);

  if (!isOpen) return null;

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleToggleAvailable = () => {
    setFormData((prev) => ({ ...prev, is_available: !prev.is_available }));
  };

  const handleToggleHot = () => {
    setFormData((prev) => ({ ...prev, is_hot: !prev.is_hot }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.price === undefined || formData.price < 0) {
      setFormError("Please provide a name and a non-negative price.");
      return;
    }
    setFormError(null);

    // Ensure the first multi-image is synced to image_url for legacy compatibility
    const updatedForm = { ...formData };
    if (updatedForm.image_urls && updatedForm.image_urls.length > 0) {
      updatedForm.image_url = updatedForm.image_urls[0];
    } else {
      updatedForm.image_url = null;
    }

    onSave(updatedForm, selectedFoodTypeIds);
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal Content */}
        <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-fade-in-up md:max-w-2xl lg:max-w-3xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-stone-800">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white">
              {initialData ? "Edit Item" : "Add New Item"}
            </h2>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors btn-press"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                  Item Photos (Up to 5)
                </label>
                <span className="text-xs text-stone-500">
                  {formData.image_urls?.length || 0}/5 images
                </span>
              </div>
              <div data-tour="item-image-upload">
                <MultiImageUpload
                  urls={formData.image_urls || []}
                  onChange={(urls) =>
                    setFormData((prev) => ({ ...prev, image_urls: urls }))
                  }
                  maxIter={5}
                />
              </div>
            </div>

            <form id="item-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Validation Error */}
              {formError && (
                <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/40 px-3 py-2 text-xs text-red-700 dark:text-red-100">
                  {formError}
                </div>
              )}

              {/* Basic Info Section */}
              <div className="space-y-4">
                {/* Row 1: Name and SKU */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div data-tour="item-name-input">
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Item Name (Primary)
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name || ""}
                      onChange={handleChange}
                      placeholder="e.g. Truffle Burger"
                      className="w-full rounded-xl border-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 py-2.5 px-3 text-sm font-english"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                      SKU or ID (Optional)
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku || ""}
                      onChange={handleChange}
                      placeholder="e.g. ID: 0017"
                      className="w-full rounded-xl border-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 py-2.5 px-3 text-sm"
                      maxLength={50}
                    />
                  </div>
                </div>

                {/* Optional Name */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Item Name (Khmer - Optional)
                  </label>
                  <input
                    type="text"
                    name="name_km"
                    value={formData.name_km || ""}
                    onChange={handleChange}
                    placeholder="e.g. ប៊ឺហ្គឺត្រប់"
                    className="w-full rounded-xl border-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 py-2.5 px-3 text-sm font-khmer"
                    maxLength={100}
                  />
                </div>

                {/* Row 2: Price & Original Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div data-tour="item-price-input">
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Sale Price
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-stone-500 dark:text-stone-400 sm:text-sm">
                          $
                        </span>
                      </div>
                      <input
                        type="number"
                        name="price"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price === 0 ? "" : formData.price}
                        onChange={handleChange}
                        placeholder="0.00"
                        max="1000000"
                        className="w-full rounded-xl border-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 py-2.5 pl-7 pr-3 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Original Price (Optional)
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-stone-500 dark:text-stone-400 sm:text-sm">
                          $
                        </span>
                      </div>
                      <input
                        type="number"
                        name="original_price"
                        min="0"
                        step="0.01"
                        value={
                          formData.original_price === undefined
                            ? ""
                            : formData.original_price
                        }
                        onChange={handleChange}
                        placeholder="0.00"
                        max="1000000"
                        className="w-full rounded-xl border-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 py-2.5 pl-7 pr-3 text-sm"
                      />
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1">
                      Leave empty if no discount.
                    </p>
                  </div>
                </div>

                {/* Category */}
                <div data-tour="item-category-select">
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Category
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id || ""}
                    onChange={handleChange}
                    className="w-full rounded-xl border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 py-2.5 px-3 text-sm"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Row 3: Description */}
                <div data-tour="item-description">
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    value={formData.description || ""}
                    onChange={handleChange}
                    placeholder="Describe the ingredients and flavor profile..."
                    className="w-full rounded-xl border-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 py-2.5 px-3 text-sm resize-none"
                    maxLength={1000}
                  />
                </div>
              </div>

              {/* <hr className="border-stone-100 dark:border-stone-800" />
                    <FoodTypeManager 
                        businessId={businessId}
                        selectedTypeIds={selectedFoodTypeIds}
                        onToggleType={handleToggleFoodType}
                    /> */}

              <hr className="border-stone-100 dark:border-stone-800" />

              {/* Availability & Tags Section */}
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                data-tour="item-availability"
              >
                <div className="flex items-center justify-between bg-stone-50 dark:bg-stone-800 p-4 rounded-xl border border-stone-200 dark:border-stone-700">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                      In Stock
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Toggle item availability.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleAvailable}
                    className={`inline-flex items-center px-4 py-2 rounded-xl border text-sm font-bold transition-all btn-press ${
                      formData.is_available
                        ? "bg-white dark:bg-stone-700 text-green-700 dark:text-green-400 border-stone-200 dark:border-stone-600 shadow-sm"
                        : "bg-stone-200 dark:bg-stone-900 text-stone-500 dark:text-stone-400 border-transparent"
                    }`}
                  >
                    {formData.is_available ? (
                      <>
                        <Check
                          size={18}
                          className="mr-2 text-green-600 dark:text-green-400"
                        />
                        Available
                      </>
                    ) : (
                      <>
                        <Ban size={18} className="mr-2 text-stone-400" />
                        Sold Out
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800/30">
                  <div>
                    <h3 className="text-sm font-bold text-orange-900 dark:text-orange-300">
                      Hot Menu
                    </h3>
                    <p className="text-xs text-orange-700 dark:text-orange-400/70">
                      Display a HOT badge.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleHot}
                    className={`inline-flex items-center px-4 py-2 rounded-xl border text-sm font-bold transition-all btn-press ${
                      formData.is_hot
                        ? "bg-orange-600 dark:bg-orange-500 text-white border-orange-700 dark:border-orange-600 shadow-sm"
                        : "bg-white dark:bg-stone-800 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700"
                    }`}
                  >
                    {formData.is_hot ? "Remove Tag" : "Set as Hot"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-stone-100 dark:border-stone-800 flex justify-end gap-3 bg-stone-50/50 dark:bg-stone-800/50 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 transition-colors btn-press"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="item-form"
              data-tour="save-item-btn"
              className="px-4 py-2 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-sm transition-all btn-press"
            >
              Save Item
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
