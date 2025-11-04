import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  createSwapRequest,
  getSwappableSlots,
  respondToSwapRequest
} from '../controllers/swapController.js';

const router = Router();

router.use(authenticate);
router.get('/swappable-slots', getSwappableSlots);
router.post('/swap-request', createSwapRequest);
router.post('/swap-response/:requestId', respondToSwapRequest);

export default router;
