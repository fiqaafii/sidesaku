import { Router } from 'express';
import { getDesaList, createDesa, updateDesa } from '../controllers/desaController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/role.js';

const router = Router();
router.use(authenticateToken);
router.use(requireRole('super_admin'));

router.get('/', getDesaList);
router.post('/', createDesa);
router.put('/:id', updateDesa);

export default router;
