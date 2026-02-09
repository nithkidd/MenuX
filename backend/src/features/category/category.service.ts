import { categoryRepository } from './category.repository.js';
import { businessRepository } from '../business/business.repository.js';
import { Category, CreateCategoryDto, UpdateCategoryDto, ReorderDto } from '../../shared/types/index.js';

export class CategoryService {
  /**
   * Verify business ownership
   */
  private async verifyOwnership(businessId: string, profileId: string): Promise<boolean> {
    const business = await businessRepository.findByIdAndOwner(businessId, profileId);
    return !!business;
  }

  /**
   * Get business ID for a category and verify ownership
   */
  private async verifyCategoryOwnership(categoryId: string, profileId: string): Promise<string | null> {
    const category = await categoryRepository.findById(categoryId);
    if (!category) return null;

    const isOwner = await this.verifyOwnership(category.business_id, profileId);
    return isOwner ? category.business_id : null;
  }

  /**
   * Create a new category
   */
  async create(businessId: string, profileId: string, dto: CreateCategoryDto): Promise<Category | null> {
    const isOwner = await this.verifyOwnership(businessId, profileId);
    if (!isOwner) return null;

    const maxOrder = await categoryRepository.getMaxSortOrder(businessId);

    return categoryRepository.create({
      business_id: businessId,
      name: dto.name,
      sort_order: maxOrder + 1,
    });
  }

  /**
   * Get all categories for a business
   */
  async getAllByBusiness(businessId: string, profileId: string): Promise<Category[] | null> {
    const isOwner = await this.verifyOwnership(businessId, profileId);
    if (!isOwner) return null;

    return categoryRepository.findByBusinessId(businessId);
  }

  /**
   * Update a category
   */
  async update(id: string, profileId: string, dto: UpdateCategoryDto): Promise<Category | null> {
    const businessId = await this.verifyCategoryOwnership(id, profileId);
    if (!businessId) return null;

    return categoryRepository.update(id, dto);
  }

  /**
   * Delete a category
   */
  async delete(id: string, profileId: string): Promise<boolean> {
    const businessId = await this.verifyCategoryOwnership(id, profileId);
    if (!businessId) return false;

    return categoryRepository.delete(id);
  }

  /**
   * Reorder categories
   */
  async reorder(items: ReorderDto[], profileId: string): Promise<boolean> {
    if (items.length === 0) return false;

    // Verify ownership of first item
    const businessId = await this.verifyCategoryOwnership(items[0].id, profileId);
    if (!businessId) return false;

    // Update sort orders
    for (const item of items) {
      await categoryRepository.updateSortOrder(item.id, item.sort_order);
    }

    return true;
  }
}

export const categoryService = new CategoryService();
