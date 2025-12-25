import { Router } from 'express';
import { SprintController } from '../controllers/sprintController';
import { authenticate } from '../middleware/auth';
import { requireTeamLead } from '../middleware/authorization';

const router = Router();
const sprintController = new SprintController();

router.post('/', authenticate, requireTeamLead, (req, res) => sprintController.create(req, res));
router.get('/', authenticate, (req, res) => sprintController.getAll(req, res));
router.get('/:id', authenticate, (req, res) => sprintController.getById(req, res));
router.patch('/:id', authenticate, requireTeamLead, (req, res) =>
  sprintController.update(req, res)
);
router.delete('/:id', authenticate, requireTeamLead, (req, res) =>
  sprintController.delete(req, res)
);

export default router;
