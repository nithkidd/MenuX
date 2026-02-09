import { Router, Request, Response } from 'express';
import { categoryController } from './category.controller.js';
import { AuthRequest } from '../../shared/middleware/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Category
 *   description: Menu category management
 */

/**
 * @swagger
 * /business/{businessId}/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
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
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created successfully
 */
// Business-scoped routes
router.post('/business/:businessId/categories', (req: Request, res: Response) => 
  categoryController.create(req as unknown as AuthRequest, res)
);

/**
 * @swagger
 * /business/{businessId}/categories:
 *   get:
 *     summary: Get all categories for a business
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/business/:businessId/categories', (req: Request, res: Response) => 
  categoryController.getAll(req as unknown as AuthRequest, res)
);

/**
 * @swagger
 * /categories/reorder:
 *   put:
 *     summary: Reorder categories
 *     tags: [Category]
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
 *         description: Categories reordered successfully
 */
// Category-specific routes
router.put('/categories/reorder', (req: Request, res: Response) => 
  categoryController.reorder(req as unknown as AuthRequest, res)
);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Category]
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
 *     responses:
 *       200:
 *         description: Category updated successfully
 */
router.put('/categories/:id', (req: Request, res: Response) => 
  categoryController.update(req as unknown as AuthRequest, res)
);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Category]
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
 *         description: Category deleted successfully
 */
router.delete('/categories/:id', (req: Request, res: Response) => 
  categoryController.delete(req as unknown as AuthRequest, res)
);

export default router;
