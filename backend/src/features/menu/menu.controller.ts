import { Request, Response } from 'express';
import { menuService } from './menu.service.js';
import { ApiResponse } from '../../shared/types/index.js';

export class MenuController {
  /**
   * GET /menu/:slug - Get public menu by business slug
   */
  async getBySlug(req: Request, res: Response): Promise<void> {
    try {
      const slug = req.params.slug as string;
      const menu = await menuService.getBySlug(slug);

      if (!menu) {
        res.status(404).json({
          success: false,
          error: 'Menu not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: menu,
      } as ApiResponse);
    } catch (error) {
      console.error('Get menu error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch menu',
      } as ApiResponse);
    }
  }
}

export const menuController = new MenuController();
