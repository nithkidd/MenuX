import { supabaseAdmin } from '../../config/supabase.js';
import { Business, UpdateBusinessDto } from '../../shared/types/index.js';

export class BusinessRepository {
  private table = 'businesses';

  async create(data: {
    owner_id: string;
    name: string;
    slug: string;
    business_type: string;
    description?: string;
  }): Promise<Business | null> {
    const { data: business, error } = await supabaseAdmin
      .from(this.table)
      .insert({
        owner_id: data.owner_id,
        name: data.name,
        slug: data.slug,
        business_type: data.business_type,
        description: data.description || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return business as Business;
  }

  async findByOwnerId(ownerId: string): Promise<Business[]> {
    const { data, error } = await supabaseAdmin
      .from(this.table)
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []) as Business[];
  }

  async findAll(): Promise<Business[]> {
    const { data, error } = await supabaseAdmin
      .from(this.table)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []) as Business[];
  }

  async findById(id: string): Promise<Business | null> {
    const { data, error } = await supabaseAdmin
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as Business;
  }

  async findByIdAndOwner(id: string, ownerId: string): Promise<Business | null> {
    const { data, error } = await supabaseAdmin
      .from(this.table)
      .select('*')
      .eq('id', id)
      .eq('owner_id', ownerId)
      .single();

    if (error) return null;
    return data as Business;
  }

  async findBySlug(slug: string): Promise<Business | null> {
    const { data, error } = await supabaseAdmin
      .from(this.table)
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) return null;
    return data as Business;
  }

  async update(id: string, updates: UpdateBusinessDto): Promise<Business | null> {
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
    return data as Business;
  }

  async delete(id: string, ownerId: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from(this.table)
      .delete()
      .eq('id', id)
      .eq('owner_id', ownerId);

    if (error) throw new Error(error.message);
    return true;
  }

  async deleteById(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from(this.table)
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
  }

  async slugExists(slug: string): Promise<boolean> {
    const { data } = await supabaseAdmin
      .from(this.table)
      .select('id')
      .eq('slug', slug)
      .single();

    return !!data;
  }
}

export const businessRepository = new BusinessRepository();
