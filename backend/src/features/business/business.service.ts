import { businessRepository } from './business.repository.js';
import { generateSlug } from '../../shared/utils/slug.js';
import { Business, CreateBusinessDto, UpdateBusinessDto } from '../../shared/types/index.js';

export class BusinessService {
  /**
   * Create a new business with a unique slug
   */
  async create(profileId: string, dto: CreateBusinessDto): Promise<Business> {
    // Generate a unique slug
    let slug = generateSlug(dto.name);
    let attempts = 0;
    
    while (await businessRepository.slugExists(slug) && attempts < 10) {
      const suffix = Math.random().toString(36).substring(2, 6);
      slug = `${generateSlug(dto.name)}-${suffix}`;
      attempts++;
    }

    const business = await businessRepository.create({
      owner_id: profileId,
      name: dto.name,
      slug,
      business_type: dto.business_type,
      description: dto.description,
    });

    if (!business) {
      throw new Error('Failed to create business');
    }

    return business;
  }

  /**
   * Get all businesses (admin)
   */
  async getAll(): Promise<Business[]> {
    return businessRepository.findAll();
  }

  /**
   * Get all businesses for a user
   */
  async getAllByOwner(profileId: string): Promise<Business[]> {
    return businessRepository.findByOwnerId(profileId);
  }

  /**
   * Get a business by ID (admin - no ownership check)
   */
  async getByIdAdmin(id: string): Promise<Business | null> {
    return businessRepository.findById(id);
  }

  /**
   * Update a business (admin - no ownership check)
   */
  async updateAdmin(id: string, dto: UpdateBusinessDto): Promise<Business | null> {
    // Check existence first
    const existing = await businessRepository.findById(id);
    if (!existing) return null;
    return businessRepository.update(id, dto);
  }

  /**
   * Delete a business (admin - no ownership check)
   */
  async deleteAdmin(id: string): Promise<boolean> {
    // Check existence first
    const existing = await businessRepository.findById(id);
    if (!existing) return false;
    return businessRepository.deleteById(id);
  }

  /**
   * Get a business by ID (with ownership check)
   */
  async getById(id: string, profileId: string): Promise<Business | null> {
    return businessRepository.findByIdAndOwner(id, profileId);
  }

  /**
   * Get a business by slug (public)
   */
  async getBySlug(slug: string): Promise<Business | null> {
    return businessRepository.findBySlug(slug);
  }

  /**
   * Update a business (with ownership check)
   */
  async update(
    id: string,
    profileId: string,
    dto: UpdateBusinessDto
  ): Promise<Business | null> {
    // Verify ownership first
    const existing = await businessRepository.findByIdAndOwner(id, profileId);
    if (!existing) {
      return null;
    }

    return businessRepository.update(id, dto);
  }

  /**
   * Delete a business (with ownership check)
   */
  async delete(id: string, profileId: string): Promise<boolean> {
    // Verify ownership first
    const existing = await businessRepository.findByIdAndOwner(id, profileId);
    if (!existing) {
      return false;
    }

    return businessRepository.delete(id, profileId);
  }
}

export const businessService = new BusinessService();
