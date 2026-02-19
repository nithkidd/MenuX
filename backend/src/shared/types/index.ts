// User from Supabase Auth
export interface AuthUser {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  identities?: any[]; // Supabase identity type
}

// Profile (extends auth user in database)
export interface Profile {
  id: string;
  auth_user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// Business types enum
export type BusinessType = "restaurant" | "gaming_gear";

// Business
export interface Business {
  id: string;
  owner_id: string;
  name: string;
  name_km?: string;
  slug: string;
  business_type: BusinessType;
  logo_url: string | null;
  description: string | null;
  is_active: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  exchange_rate_khr?: number;
}

// Category
export interface Category {
  id: string;
  business_id: string;
  name: string;
  name_km?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Item
export interface Item {
  id: string;
  category_id: string;
  name: string;
  name_km?: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Public menu response
export interface PublicMenu {
  business: Pick<
    Business,
    "name" | "slug" | "logo_url" | "description" | "business_type" | "is_published" | "name_km"
  >;
  categories: (Category & { items: Item[] })[];
}

// Create/Update DTOs
export interface CreateBusinessDto {
  name: string;
  name_km?: string;
  business_type: BusinessType;
  description?: string;
  is_published?: boolean;
}

export interface UpdateBusinessDto {
  name?: string;
  name_km?: string;
  slug?: string;
  description?: string;
  logo_url?: string;
  is_active?: boolean;
  is_published?: boolean;
}

export interface CreateCategoryDto {
  name: string;
  name_km?: string;
  business_id: string;
}

export interface UpdateCategoryDto {
  name?: string;
  name_km?: string;
}

export interface ReorderDto {
  id: string;
  sort_order: number;
}

export interface CreateItemDto {
  name: string;
  name_km?: string;
  category_id: string;
  description?: string;
  price: number;
  image_url?: string;
}

export interface UpdateItemDto {
  name?: string;
  name_km?: string;
  description?: string;
  price?: number;
  image_url?: string;
  is_available?: boolean;
}
