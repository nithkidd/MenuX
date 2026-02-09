import { supabaseAdmin } from '../../config/supabase.js';
import { Category, Item } from '../../shared/types/index.js';

interface PublicBusiness {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  business_type: string;
}

export class MenuRepository {
  async getBusinessBySlug(slug: string): Promise<PublicBusiness | null> {
    const { data, error } = await supabaseAdmin
      .from('businesses')
      .select('id, name, slug, logo_url, description, business_type')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) return null;
    return data as PublicBusiness;
  }

  async getCategoriesWithItems(businessId: string): Promise<(Category & { items: Item[] })[]> {
    const { data: categories, error: catError } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('business_id', businessId)
      .order('sort_order', { ascending: true });

    if (catError || !categories) return [];

    // Fetch items for each category
    const result = await Promise.all(
      (categories as Category[]).map(async (category) => {
        const { data: items } = await supabaseAdmin
          .from('items')
          .select('*')
          .eq('category_id', category.id)
          .eq('is_available', true)
          .order('sort_order', { ascending: true });

        return {
          ...category,
          items: (items || []) as Item[],
        };
      })
    );

    return result;
  }
}

export const menuRepository = new MenuRepository();
