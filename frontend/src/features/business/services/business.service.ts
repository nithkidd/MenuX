
import api from '../../../shared/utils/api';

export interface Business {
  id: string;
  name: string;
  slug: string;
  business_type: 'restaurant' | 'gaming_gear';
  logo_url: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export const businessService = {
  getAll: async () => {
    const response = await api.get<{ success: boolean; data: Business[] }>('/business');
    return response.data.data;
  },

  create: async (data: { name: string; business_type: string; description?: string }) => {
    const response = await api.post<{ success: boolean; data: Business }>('/business', data);
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Business }>(`/business/${id}`);
    return response.data.data;
  },
  
  getBySlug: async (slug: string) => {
    // This might use the public endpoint if we are creating a preview
    // accessing public endpoint /menu/:slug doesn't need auth
    // But managing it needs auth.
    // Let's implement getting business details by ID
  }
};
