import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/authorization';

const router = Router();
const userController = new UserController();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/', authenticate, requireAdmin, (req, res) =>
  userController.getAllUsers(req, res)
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticate, requireAdmin, (req, res) =>
  userController.getUserById(req, res)
);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Admin can create team_lead or developer users
 */
router.post('/', authenticate, requireAdmin, (req, res) =>
  userController.createUser(req, res)
);

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id', authenticate, requireAdmin, (req, res) =>
  userController.updateUser(req, res)
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticate, requireAdmin, (req, res) =>
  userController.deleteUser(req, res)
);

/**
 * @swagger
 * /api/users/{id}/promote:
 *   post:
 *     summary: Promote developer to team lead (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/promote', authenticate, requireAdmin, (req, res) =>
  userController.promoteToTeamLead(req, res)
);

/**
 * @swagger
 * /api/users/{id}/demote:
 *   post:
 *     summary: Demote team lead to developer (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/demote', authenticate, requireAdmin, (req, res) =>
  userController.demoteToDeveloper(req, res)
);

export default router;

