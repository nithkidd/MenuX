import { Router, Request, Response } from 'express';
import { itemController } from './item.controller.js';
import { AuthRequest } from '../../shared/middleware/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Item
 *   description: Menu item management
 */

/**
 * @swagger
 * /categories/{categoryId}/items:
 *   post:
 *     summary: Create a new item
 *     tags: [Item]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               image_url:
 *                 type: string
 *     responses:
 *       201:
 *         description: Item created successfully
 */
// Category-scoped routes
router.post('/categories/:categoryId/items', (req: Request, res: Response) => 
  itemController.create(req as unknown as AuthRequest, res)
);

/**
 * @swagger
 * /categories/{categoryId}/items:
 *   get:
 *     summary: Get all items for a category
 *     tags: [Item]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of items
 */
router.get('/categories/:categoryId/items', (req: Request, res: Response) => 
  itemController.getAll(req as unknown as AuthRequest, res)
);

/**
 * @swagger
 * /items/reorder:
 *   put:
 *     summary: Reorder items
 *     tags: [Item]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     sort_order:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Items reordered successfully
 */
// Item-specific routes
router.put('/items/reorder', (req: Request, res: Response) => 
  itemController.reorder(req as unknown as AuthRequest, res)
);

/**
 * @swagger
 * /items/{id}:
 *   put:
 *     summary: Update an item
 *     tags: [Item]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               image_url:
 *                 type: string
 *               is_available:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Item updated successfully
 */
router.put('/items/:id', (req: Request, res: Response) => 
  itemController.update(req as unknown as AuthRequest, res)
);

/**
 * @swagger
 * /items/{id}:
 *   delete:
 *     summary: Delete an item
 *     tags: [Item]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item deleted successfully
 */
router.delete('/items/:id', (req: Request, res: Response) => 
  itemController.delete(req as unknown as AuthRequest, res)
);

export default router;
