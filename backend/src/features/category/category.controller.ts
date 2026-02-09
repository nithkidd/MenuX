import { Response } from 'express';
import { categoryService } from './category.service.js';
import { AuthRequest } from '../../shared/middleware/auth.middleware.js';
import { CreateCategoryDto, UpdateCategoryDto, ReorderDto, ApiResponse, Category } from '../../shared/types/index.js';

export class CategoryController {
  /**
   * POST /business/:businessId/categories - Create category
   */
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businessId = req.params.businessId as string;
      const dto = req.body as CreateCategoryDto;
      const category = await categoryService.create(businessId, req.profileId, dto);

      if (!category) {
        res.status(403).json({
          success: false,
          error: 'Not authorized to modify this business',
        } as ApiResponse);
        return;
      }

      res.status(201).json({
        success: true,
        data: category,
        message: 'Category created successfully',
      } as ApiResponse<Category>);
    } catch (error) {
      console.error('Create category error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create category',
      } as ApiResponse);
    }
  }

  /**
   * GET /business/:businessId/categories - Get all categories
   */
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businessId = req.params.businessId as string;
      const categories = await categoryService.getAllByBusiness(businessId, req.profileId);

      if (categories === null) {
        res.status(403).json({
          success: false,
          error: 'Not authorized to view this business',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: categories,
      } as ApiResponse<Category[]>);
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch categories',
      } as ApiResponse);
    }
  }

  /**
   * PUT /categories/:id - Update category
   */
  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const dto = req.body as UpdateCategoryDto;
      const category = await categoryService.update(id, req.profileId, dto);

      if (!category) {
        res.status(404).json({
          success: false,
          error: 'Category not found or not authorized',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: category,
        message: 'Category updated successfully',
      } as ApiResponse<Category>);
    } catch (error) {
      console.error('Update category error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update category',
      } as ApiResponse);
    }
  }

  /**
   * DELETE /categories/:id - Delete category
   */
  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const deleted = await categoryService.delete(id, req.profileId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Category not found or not authorized',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Category deleted successfully',
      } as ApiResponse);
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete category',
      } as ApiResponse);
    }
  }

  /**
   * PUT /categories/reorder - Reorder categories
   */
  async reorder(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { items } = req.body as { items: ReorderDto[] };
      const success = await categoryService.reorder(items, req.profileId);

      if (!success) {
        res.status(400).json({
          success: false,
          error: 'Failed to reorder categories',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Categories reordered successfully',
      } as ApiResponse);
    } catch (error) {
      console.error('Reorder categories error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reorder categories',
      } as ApiResponse);
    }
  }
}

export const categoryController = new CategoryController();
