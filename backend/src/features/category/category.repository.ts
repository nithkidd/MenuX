import { supabaseAdmin } from '../../config/supabase.js';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../../shared/types/index.js';

export class CategoryRepository {
  private table = 'categories';

  async create(data: {
    business_id: string;
    name: string;
    sort_order: number;
  }): Promise<Category | null> {
    const { data: category, error } = await supabaseAdmin
      .from(this.table)
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return category;
  }

  async findByBusinessId(businessId: string): Promise<Category[]> {
    const { data, error } = await supabaseAdmin
      .from(this.table)
      .select('*')
      .eq('business_id', businessId)
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findById(id: string): Promise<Category | null> {
    const { data, error } = await supabaseAdmin
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  async getMaxSortOrder(businessId: string): Promise<number> {
    const { data } = await supabaseAdmin
      .from(this.table)
      .select('sort_order')
      .eq('business_id', businessId)
      .order('sort_order', { ascending: false })
      .limit(1);

    return data && data.length > 0 ? data[0].sort_order : -1;
  }

  async update(id: string, updates: UpdateCategoryDto): Promise<Category | null> {
    const { data, error } = await supabaseAdmin
      .from(this.table)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateSortOrder(id: string, sortOrder: number): Promise<void> {
    await supabaseAdmin
      .from(this.table)
      .update({ sort_order: sortOrder })
      .eq('id', id);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from(this.table)
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
  }
}

export const categoryRepository = new CategoryRepository();
