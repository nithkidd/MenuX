import { Response } from 'express';
import { businessService } from './business.service.js';
import { AuthRequest } from '../../shared/middleware/auth.middleware.js';
import { CreateBusinessDto, UpdateBusinessDto, ApiResponse, Business } from '../../shared/types/index.js';

export class BusinessController {
  /**
   * POST /business - Create a new business
   */
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const dto = req.body as CreateBusinessDto;
      const business = await businessService.create(req.profileId, dto);

      res.status(201).json({
        success: true,
        data: business,
        message: 'Business created successfully',
      } as ApiResponse<Business>);
    } catch (error) {
      console.error('Create business error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create business',
      } as ApiResponse);
    }
  }

  /**
   * GET /business - Get all businesses
   * If user has global read permission, returns all.
   * If user has own restricted permission, returns owned.
   */
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      let businesses: Business[];
      
      if (req.requiresOwnershipCheck) {
        businesses = await businessService.getAllByOwner(req.profileId);
      } else {
        businesses = await businessService.getAll();
      }

      res.json({
        success: true,
        data: businesses,
      } as ApiResponse<Business[]>);
    } catch (error) {
      console.error('Get businesses error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch businesses',
      } as ApiResponse);
    }
  }

  /**
   * GET /business/:id - Get a business by ID
   */
  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      let business: Business | null;

      if (req.requiresOwnershipCheck) {
        business = await businessService.getById(id, req.profileId);
      } else {
        business = await businessService.getByIdAdmin(id);
      }

      if (!business) {
        res.status(404).json({
          success: false,
          error: 'Business not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: business,
      } as ApiResponse<Business>);
    } catch (error) {
      console.error('Get business error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch business',
      } as ApiResponse);
    }
  }

  /**
   * PUT /business/:id - Update a business
   */
  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const dto = req.body as UpdateBusinessDto;
      let business: Business | null;

      if (req.requiresOwnershipCheck) {
        business = await businessService.update(id, req.profileId, dto);
      } else {
        business = await businessService.updateAdmin(id, dto);
      }

      if (!business) {
        res.status(404).json({
          success: false,
          error: 'Business not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: business,
        message: 'Business updated successfully',
      } as ApiResponse<Business>);
    } catch (error) {
      console.error('Update business error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update business',
      } as ApiResponse);
    }
  }

  /**
   * DELETE /business/:id - Delete a business
   */
  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      let deleted: boolean;

      if (req.requiresOwnershipCheck) {
        deleted = await businessService.delete(id, req.profileId);
      } else {
        deleted = await businessService.deleteAdmin(id);
      }

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Business not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Business deleted successfully',
      } as ApiResponse);
    } catch (error) {
      console.error('Delete business error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete business',
      } as ApiResponse);
    }
  }
}

export const businessController = new BusinessController();
