import { Router } from 'express';
import { requirePrivilege } from '../middleware/rbac.js';
import {
  listUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
} from '../controllers/usersController.js';

const router = Router();

router.get('/', requirePrivilege('users:read'), listUsers);

router.post('/', requirePrivilege('users:write'), createUser);

router.get('/:id', requirePrivilege('users:read'), getUser);

router.patch('/:id', requirePrivilege('users:write'), updateUser);

router.delete('/:id', requirePrivilege('users:write'), deleteUser);

export default router;
