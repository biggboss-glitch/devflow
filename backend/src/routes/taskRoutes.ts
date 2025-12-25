import { Router } from 'express';
import { TaskController } from '../controllers/taskController';
import { authenticate } from '../middleware/auth';

const router = Router();
const taskController = new TaskController();

router.post('/', authenticate, (req, res) => taskController.create(req, res));
router.get('/', authenticate, (req, res) => taskController.getAll(req, res));
router.get('/:id', authenticate, (req, res) => taskController.getById(req, res));
router.patch('/:id', authenticate, (req, res) => taskController.update(req, res));
router.delete('/:id', authenticate, (req, res) => taskController.delete(req, res));
router.patch('/:id/status', authenticate, (req, res) => taskController.updateStatus(req, res));
router.post('/:id/assign', authenticate, (req, res) => taskController.assign(req, res));

export default router;
