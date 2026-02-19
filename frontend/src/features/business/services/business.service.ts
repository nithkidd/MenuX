
import api from '../../../shared/utils/api';

export interface Business {
  id: string;
  name: string;
  name_km?: string;
  slug: string;
  business_type: 'restaurant' | 'gaming_gear';
  logo_url: string | null;
  description: string | null;
  is_active: boolean;
  is_published: boolean;
  exchange_rate_khr?: number;
  created_at: string;
  // New Settings Fields
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  website_url?: string;
  social_links?: Record<string, string>;
  opening_hours?: Record<string, any>; // Simplified for now
  primary_color?: string;
  cover_image_url?: string | null;
  currency?: string;
}

export const businessService = {
  getAll: async (params?: { scope?: string }) => {
    const response = await api.get<{ success: boolean; data: Business[] }>('/business', { params });
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

  update: async (id: string, data: Partial<Business>) => {
    const response = await api.put<{ success: boolean; data: Business }>(`/business/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string) => {
    await api.delete(`/business/${id}`);
  },
};
