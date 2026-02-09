import { supabaseAdmin } from '../../config/supabase.js';
import { Item, CreateItemDto, UpdateItemDto } from '../../shared/types/index.js';

export class ItemRepository {
  private table = 'items';

  async create(data: {
    category_id: string;
    name: string;
    description?: string;
    price: number;
    image_url?: string;
    sort_order: number;
  }): Promise<Item | null> {
    const { data: item, error } = await supabaseAdmin
      .from(this.table)
      .insert({
        category_id: data.category_id,
        name: data.name,
        description: data.description || null,
        price: data.price,
        image_url: data.image_url || null,
        sort_order: data.sort_order,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return item;
  }

  async findByCategoryId(categoryId: string): Promise<Item[]> {
    const { data, error } = await supabaseAdmin
      .from(this.table)
      .select('*')
      .eq('category_id', categoryId)
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findById(id: string): Promise<Item | null> {
    const { data, error } = await supabaseAdmin
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  async getMaxSortOrder(categoryId: string): Promise<number> {
    const { data } = await supabaseAdmin
      .from(this.table)
      .select('sort_order')
      .eq('category_id', categoryId)
      .order('sort_order', { ascending: false })
      .limit(1);

    return data && data.length > 0 ? data[0].sort_order : -1;
  }

  async update(id: string, updates: UpdateItemDto): Promise<Item | null> {
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

export const itemRepository = new ItemRepository();
