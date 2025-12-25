import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = Router();
const notificationController = new NotificationController();

router.get('/', authenticate, (req, res) => notificationController.getAll(req, res));
router.patch('/:id/read', authenticate, (req, res) => notificationController.markAsRead(req, res));
router.patch('/read-all', authenticate, (req, res) =>
  notificationController.markAllAsRead(req, res)
);
router.delete('/:id', authenticate, (req, res) => notificationController.delete(req, res));

export default router;
