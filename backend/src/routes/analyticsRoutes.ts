import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';

const router = Router();
const analyticsController = new AnalyticsController();

router.get('/sprints/:sprintId/analytics', authenticate, (req, res) =>
  analyticsController.getSprintAnalytics(req, res)
);
router.get('/team/:teamId/velocity', authenticate, (req, res) =>
  analyticsController.getTeamVelocity(req, res)
);
router.get('/tasks/distribution', authenticate, (req, res) =>
  analyticsController.getTaskDistribution(req, res)
);

export default router;
