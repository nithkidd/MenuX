
import api from '../../../shared/utils/api';

export interface Item {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  sort_order: number;
}

export interface Category {
  id: string;
  business_id: string;
  name: string;
  sort_order: number;
  items: Item[];
}

export const menuService = {
  getCategories: async (businessId: string) => {
    const response = await api.get<{ success: boolean; data: Category[] }>(`/business/${businessId}/categories`);
    return response.data.data;
  },

  createCategory: async (businessId: string, name: string) => {
    const response = await api.post<{ success: boolean; data: Category }>(`/business/${businessId}/categories`, { name });
    return response.data.data;
  },

  deleteCategory: async (id: string) => {
    await api.delete(`/categories/${id}`);
  },

  createItem: async (categoryId: string, data: { name: string; price: number; description?: string }) => {
    const response = await api.post<{ success: boolean; data: Item }>(`/categories/${categoryId}/items`, data);
    return response.data.data;
  },
  
  deleteItem: async (id: string) => {
    await api.delete(`/items/${id}`);
  }
};
