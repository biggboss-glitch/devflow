import { Router } from 'express';
import { OrganizationController } from '../controllers/organizationController';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/authorization';

const router = Router();
const organizationController = new OrganizationController();

router.post('/', authenticate, requireAdmin, (req, res) =>
  organizationController.create(req, res)
);
router.get('/', authenticate, (req, res) => organizationController.getAll(req, res));
router.get('/:id', authenticate, (req, res) => organizationController.getById(req, res));
router.patch('/:id', authenticate, requireAdmin, (req, res) =>
  organizationController.update(req, res)
);
router.delete('/:id', authenticate, requireAdmin, (req, res) =>
  organizationController.delete(req, res)
);

export default router;
