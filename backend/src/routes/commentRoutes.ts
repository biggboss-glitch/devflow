import { Router } from 'express';
import { CommentController } from '../controllers/commentController';
import { authenticate } from '../middleware/auth';

const router = Router();
const commentController = new CommentController();

router.post('/tasks/:taskId/comments', authenticate, (req, res) =>
  commentController.create(req, res)
);
router.get('/tasks/:taskId/comments', authenticate, (req, res) =>
  commentController.getByTask(req, res)
);
router.patch('/:id', authenticate, (req, res) => commentController.update(req, res));
router.delete('/:id', authenticate, (req, res) => commentController.delete(req, res));

export default router;
