import {
  createSwapRequestForUser,
  findSwappableSlots,
  listSwapRequestsForUser,
  respondToSwapRequestForUser
} from './swap.service.js';

/**
 * Retrieve swappable slots that belong to other users.
 */
export const getSwappableSlots = async (req, res, next) => {
  try {
    const slots = await findSwappableSlots(req.user.id);
    res.json(slots);
  } catch (error) {
    next(error);
  }
};

/**
 * List swap requests where the authenticated user is either the requester or responder.
 */
export const listSwapRequests = async (req, res, next) => {
  try {
    const data = await listSwapRequestsForUser(req.user.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a swap request by validating that both events are swappable.
 */
export const createSwapRequest = async (req, res, next) => {
  try {
    const swapRequest = await createSwapRequestForUser(req.user.id, req.body);
    res.status(201).json(swapRequest);
  } catch (error) {
    handleServiceError(error, res, next);
  }
};

/**
 * Respond to a swap request. Accepting swaps the ownership of the involved slots.
 */
export const respondToSwapRequest = async (req, res, next) => {
  const { accepted } = req.body;

  if (accepted === undefined) {
    return res.status(400).json({ message: 'Request body must include accepted: true|false.' });
  }

  try {
    const result = await respondToSwapRequestForUser(req.user.id, req.params.requestId, accepted);
    res.json(result);
  } catch (error) {
    handleServiceError(error, res, next);
  }
};

const handleServiceError = (error, res, next) => {
  if (error?.statusCode) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  return next(error);
};
