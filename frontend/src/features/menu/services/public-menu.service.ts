
import api from '../../../shared/utils/api';
import type { Category } from './menu.service';
import type { Business } from '../../business/services/business.service';

export interface PublicMenuData {
  business: Business;
  categories: Category[];
}

export const publicMenuService = {
  getMenuBySlug: async (slug: string) => {
    // Note: The backend public endpoint might return a different structure.
    // Based on backend implementation: GET /menu/:slug 
    // It returns { success: true, data: { business, categories } }
    const response = await api.get<{ success: boolean; data: PublicMenuData }>(`/menu/${slug}`);
    return response.data.data;
  }
};
