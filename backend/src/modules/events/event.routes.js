import { Router } from 'express';
import { authenticate } from '../../middleware/authMiddleware.js';
import {
  createEvent,
  deleteEvent,
  getEventById,
  getMyEvents,
  updateEvent
} from './event.controller.js';

const router = Router();

router.use(authenticate);
router.get('/', getMyEvents);
router.post('/', createEvent);
router.get('/:id', getEventById);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

export default router;
