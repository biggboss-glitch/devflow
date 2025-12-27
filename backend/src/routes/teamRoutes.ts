import { Router } from 'express';
import { TeamController } from '../controllers/teamController';
import { authenticate } from '../middleware/auth';
import { requireTeamLead } from '../middleware/authorization';

const router = Router();
const teamController = new TeamController();

router.post('/', authenticate, requireTeamLead, (req, res) => teamController.create(req, res));
router.get('/', authenticate, (req, res) => teamController.getAll(req, res));
// IMPORTANT: Specific routes must come before parameterized routes
router.get('/available-users', authenticate, requireTeamLead, (req, res) => teamController.getAvailableUsers(req, res));
router.get('/:id', authenticate, (req, res) => teamController.getById(req, res));
router.patch('/:id', authenticate, requireTeamLead, (req, res) =>
  teamController.update(req, res)
);
router.delete('/:id', authenticate, requireTeamLead, (req, res) =>
  teamController.delete(req, res)
);
router.post('/:id/members', authenticate, requireTeamLead, (req, res) =>
  teamController.addMember(req, res)
);
router.delete('/:id/members/:userId', authenticate, requireTeamLead, (req, res) =>
  teamController.removeMember(req, res)
);
router.get('/:id/members', authenticate, (req, res) => teamController.getMembers(req, res));

export default router;
