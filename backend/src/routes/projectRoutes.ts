import { Router } from 'express';
import { ProjectController } from '../controllers/projectController';
import { authenticate } from '../middleware/auth';
import { requireTeamLead } from '../middleware/authorization';

const router = Router();
const projectController = new ProjectController();

router.post('/', authenticate, requireTeamLead, (req, res) => projectController.create(req, res));
router.get('/', authenticate, (req, res) => projectController.getAll(req, res));
router.get('/:id', authenticate, (req, res) => projectController.getById(req, res));
router.patch('/:id', authenticate, requireTeamLead, (req, res) =>
  projectController.update(req, res)
);
router.delete('/:id', authenticate, requireTeamLead, (req, res) =>
  projectController.delete(req, res)
);

export default router;
