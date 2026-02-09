import { itemRepository } from './item.repository.js';
import { categoryRepository } from '../category/category.repository.js';
import { businessRepository } from '../business/business.repository.js';
import { Item, CreateItemDto, UpdateItemDto, ReorderDto } from '../../shared/types/index.js';

export class ItemService {
  /**
   * Verify category ownership through business
   */
  private async verifyCategoryOwnership(categoryId: string, profileId: string): Promise<boolean> {
    const category = await categoryRepository.findById(categoryId);
    if (!category) return false;

    const business = await businessRepository.findByIdAndOwner(category.business_id, profileId);
    return !!business;
  }

  /**
   * Verify item ownership through category -> business chain
   */
  private async verifyItemOwnership(itemId: string, profileId: string): Promise<string | null> {
    const item = await itemRepository.findById(itemId);
    if (!item) return null;

    const isOwner = await this.verifyCategoryOwnership(item.category_id, profileId);
    return isOwner ? item.category_id : null;
  }

  /**
   * Create a new item
   */
  async create(categoryId: string, profileId: string, dto: CreateItemDto): Promise<Item | null> {
    const isOwner = await this.verifyCategoryOwnership(categoryId, profileId);
    if (!isOwner) return null;

    const maxOrder = await itemRepository.getMaxSortOrder(categoryId);

    return itemRepository.create({
      category_id: categoryId,
      name: dto.name,
      description: dto.description,
      price: dto.price,
      image_url: dto.image_url,
      sort_order: maxOrder + 1,
    });
  }

  /**
   * Get all items for a category
   */
  async getAllByCategory(categoryId: string, profileId: string): Promise<Item[] | null> {
    const isOwner = await this.verifyCategoryOwnership(categoryId, profileId);
    if (!isOwner) return null;

    return itemRepository.findByCategoryId(categoryId);
  }

  /**
   * Update an item
   */
  async update(id: string, profileId: string, dto: UpdateItemDto): Promise<Item | null> {
    const categoryId = await this.verifyItemOwnership(id, profileId);
    if (!categoryId) return null;

    return itemRepository.update(id, dto);
  }

  /**
   * Delete an item
   */
  async delete(id: string, profileId: string): Promise<boolean> {
    const categoryId = await this.verifyItemOwnership(id, profileId);
    if (!categoryId) return false;

    return itemRepository.delete(id);
  }

  /**
   * Reorder items
   */
  async reorder(items: ReorderDto[], profileId: string): Promise<boolean> {
    if (items.length === 0) return false;

    // Verify ownership of first item
    const categoryId = await this.verifyItemOwnership(items[0].id, profileId);
    if (!categoryId) return false;

    // Update sort orders
    for (const item of items) {
      await itemRepository.updateSortOrder(item.id, item.sort_order);
    }

    return true;
  }
  /**
   * Create a new item (admin)
   */
  async createAdmin(categoryId: string, dto: CreateItemDto): Promise<Item | null> {
    const maxOrder = await itemRepository.getMaxSortOrder(categoryId);

    return itemRepository.create({
      category_id: categoryId,
      name: dto.name,
      description: dto.description,
      price: dto.price,
      image_url: dto.image_url,
      sort_order: maxOrder + 1,
    });
  }

  /**
   * Update an item (admin)
   */
  async updateAdmin(id: string, dto: UpdateItemDto): Promise<Item | null> {
    return itemRepository.update(id, dto);
  }

  /**
   * Delete an item (admin)
   */
  async deleteAdmin(id: string): Promise<boolean> {
    return itemRepository.delete(id);
  }

  /**
   * Reorder items (admin)
   */
  async reorderAdmin(items: ReorderDto[]): Promise<boolean> {
    if (items.length === 0) return false;

    // Update sort orders directly
    for (const item of items) {
      await itemRepository.updateSortOrder(item.id, item.sort_order);
    }
    return true;
  }

  /**
   * Get all items for a category (admin)
   */
  async getAllByCategoryAdmin(categoryId: string): Promise<Item[]> {
    return itemRepository.findByCategoryId(categoryId);
  }
}

export const itemService = new ItemService();
