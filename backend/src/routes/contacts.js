import { Router } from 'express';
import {
  listContacts,
  createContact,
  getContact,
  updateContact,
  deleteContact,
} from '../controllers/contactsController.js';

const router = Router();

router.get('/', listContacts);

router.post('/', createContact);

router.get('/:id', getContact);

router.patch('/:id', updateContact);

router.delete('/:id', deleteContact);

export default router;
