import { Response } from 'express';
import { itemService } from './item.service.js';
import { AuthRequest } from '../../shared/middleware/auth.middleware.js';
import { CreateItemDto, UpdateItemDto, ReorderDto, ApiResponse, Item } from '../../shared/types/index.js';

export class ItemController {
  /**
   * POST /categories/:categoryId/items - Create item
   */
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const categoryId = req.params.categoryId as string;
      const dto = req.body as CreateItemDto;
      const item = await itemService.create(categoryId, req.profileId, dto);

      if (!item) {
        res.status(403).json({
          success: false,
          error: 'Not authorized to modify this category',
        } as ApiResponse);
        return;
      }

      res.status(201).json({
        success: true,
        data: item,
        message: 'Item created successfully',
      } as ApiResponse<Item>);
    } catch (error) {
      console.error('Create item error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create item',
      } as ApiResponse);
    }
  }

  /**
   * GET /categories/:categoryId/items - Get all items
   */
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const categoryId = req.params.categoryId as string;
      const items = await itemService.getAllByCategory(categoryId, req.profileId);

      if (items === null) {
        res.status(403).json({
          success: false,
          error: 'Not authorized to view this category',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: items,
      } as ApiResponse<Item[]>);
    } catch (error) {
      console.error('Get items error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch items',
      } as ApiResponse);
    }
  }

  /**
   * PUT /items/:id - Update item
   */
  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const dto = req.body as UpdateItemDto;
      const item = await itemService.update(id, req.profileId, dto);

      if (!item) {
        res.status(404).json({
          success: false,
          error: 'Item not found or not authorized',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: item,
        message: 'Item updated successfully',
      } as ApiResponse<Item>);
    } catch (error) {
      console.error('Update item error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update item',
      } as ApiResponse);
    }
  }

  /**
   * DELETE /items/:id - Delete item
   */
  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const deleted = await itemService.delete(id, req.profileId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Item not found or not authorized',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Item deleted successfully',
      } as ApiResponse);
    } catch (error) {
      console.error('Delete item error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete item',
      } as ApiResponse);
    }
  }

  /**
   * PUT /items/reorder - Reorder items
   */
  async reorder(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { items } = req.body as { items: ReorderDto[] };
      const success = await itemService.reorder(items, req.profileId);

      if (!success) {
        res.status(400).json({
          success: false,
          error: 'Failed to reorder items',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Items reordered successfully',
      } as ApiResponse);
    } catch (error) {
      console.error('Reorder items error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reorder items',
      } as ApiResponse);
    }
  }
}

export const itemController = new ItemController();
