import { Router } from 'express';
import { authenticate } from '../../middleware/authMiddleware.js';
import {
  createSwapRequest,
  getSwappableSlots,
  listSwapRequests,
  respondToSwapRequest
} from './swap.controller.js';

const router = Router();

router.use(authenticate);
router.get('/swappable-slots', getSwappableSlots);
router.get('/swap-requests', listSwapRequests);
router.post('/swap-request', createSwapRequest);
router.post('/swap-response/:requestId', respondToSwapRequest);

export default router;
