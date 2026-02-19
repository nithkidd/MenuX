import { supabaseAdmin } from '../../config/supabase.js';
import { Category, Item } from '../../shared/types/index.js';

interface PublicBusiness {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  business_type: string;
  // Settings
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  website_url: string | null;
  social_links: any;
  opening_hours: any;
  primary_color: string | null;
  cover_image_url: string | null;
  currency: string;
}

export class MenuRepository {
  async getBusinessBySlug(slug: string): Promise<PublicBusiness | null> {
    const { data, error } = await supabaseAdmin
      .from('businesses')
      .select('id, name, slug, logo_url, description, business_type, contact_email, contact_phone, address, website_url, social_links, opening_hours, primary_color, cover_image_url, currency')
      .eq('slug', slug)
      .eq('is_active', true)
      .eq('is_published', true)
      .single();

    if (error) return null;
    return data as PublicBusiness;
  }

  async getCategoriesWithItems(businessId: string): Promise<(Category & { items: Item[] })[]> {
    // 1. Fetch all categories for the business
    const { data: categories, error: catError } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('business_id', businessId)
      .order('sort_order', { ascending: true });

    if (catError || !categories || categories.length === 0) return [];

    // 2. Extract category IDs
    const categoryIds = categories.map((c) => c.id);

    // 3. Fetch all items for these categories in ONE query
    const { data: items, error: itemError } = await supabaseAdmin
      .from('items')
      .select('*')
      .in('category_id', categoryIds)
      .eq('is_available', true)
      .order('sort_order', { ascending: true });

    if (itemError) {
      console.error('Error fetching items:', itemError);
      return [];
    }

    // 4. Group items by category_id for O(1) lookup
    const itemsByCategoryId: Record<string, Item[]> = {};
    (items as Item[]).forEach((item) => {
      if (!itemsByCategoryId[item.category_id]) {
        itemsByCategoryId[item.category_id] = [];
      }
      itemsByCategoryId[item.category_id].push(item);
    });

    // 5. Map attributes back to categories
    const result = (categories as Category[]).map((category) => ({
      ...category,
      items: itemsByCategoryId[category.id] || [],
    }));

    return result;
  }
}

export const menuRepository = new MenuRepository();
