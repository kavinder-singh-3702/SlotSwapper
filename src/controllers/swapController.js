import mongoose from '../config/database.js';
import Event from '../models/Event.js';
import SwapRequest from '../models/SwapRequest.js';
import { EVENT_STATUS, SWAP_REQUEST_STATUS } from '../constants/eventStatus.js';

/**
 * Retrieve swappable slots that belong to other users.
 */
export const getSwappableSlots = async (req, res, next) => {
  try {
    const slots = await Event.find({
      owner: { $ne: req.user.id },
      status: EVENT_STATUS.SWAPPABLE
    })
      .populate('owner', 'name email')
      .sort({ startTime: 1 });

    res.json(slots);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a swap request by validating that both events are swappable.
 */
export const createSwapRequest = async (req, res, next) => {
  let mySlotLocked;
  let theirSlotLocked;

  try {
    const { mySlotId, theirSlotId } = req.body;

    if (!mySlotId || !theirSlotId) {
      return res.status(400).json({ message: 'mySlotId and theirSlotId are required.' });
    }

    if (mySlotId === theirSlotId) {
      return res.status(400).json({ message: 'Cannot swap the same slot.' });
    }

    const [mySlot, theirSlot] = await Promise.all([
      Event.findOne({ _id: mySlotId, owner: req.user.id }),
      Event.findById(theirSlotId)
    ]);

    if (!mySlot) {
      return res.status(404).json({ message: 'Your slot could not be found.' });
    }

    if (!theirSlot) {
      return res.status(404).json({ message: 'Requested slot could not be found.' });
    }

    if (theirSlot.owner.equals(req.user.id)) {
      return res.status(400).json({ message: 'Cannot create a swap with your own slot.' });
    }

    if (mySlot.status !== EVENT_STATUS.SWAPPABLE || theirSlot.status !== EVENT_STATUS.SWAPPABLE) {
      return res.status(400).json({ message: 'Both slots must be swappable to initiate a request.' });
    }

    mySlotLocked = await Event.findOneAndUpdate(
      { _id: mySlotId, owner: req.user.id, status: EVENT_STATUS.SWAPPABLE },
      { status: EVENT_STATUS.SWAP_PENDING },
      { new: true }
    );

    if (!mySlotLocked) {
      return res.status(409).json({ message: 'Your slot is no longer swappable.' });
    }

    theirSlotLocked = await Event.findOneAndUpdate(
      { _id: theirSlotId, status: EVENT_STATUS.SWAPPABLE },
      { status: EVENT_STATUS.SWAP_PENDING },
      { new: true }
    );

    if (!theirSlotLocked) {
      await Event.updateOne({ _id: mySlotId }, { status: EVENT_STATUS.SWAPPABLE });
      return res.status(409).json({ message: 'Requested slot is no longer available for swap.' });
    }

    const swapRequest = await SwapRequest.create({
      requester: req.user.id,
      responder: theirSlotLocked.owner,
      requesterSlot: mySlotId,
      responderSlot: theirSlotId
    });

    res.status(201).json(swapRequest);
  } catch (error) {
    try {
      if (mySlotLocked) {
        await Event.updateOne({ _id: mySlotLocked._id }, { status: EVENT_STATUS.SWAPPABLE });
      }
      if (theirSlotLocked) {
        await Event.updateOne({ _id: theirSlotLocked._id }, { status: EVENT_STATUS.SWAPPABLE });
      }
    } catch (rollbackError) {
      console.error('Failed to rollback swap request state:', rollbackError);
    }

    next(error);
  }
};

/**
 * Shared business logic for responding to a swap request. Optional sessions let us
 * execute inside a MongoDB transaction when available, or fall back to best-effort
 * sequential updates on standalone deployments.
 */
const processSwapResponse = async ({ requestId, accepted, userId }, session) => {
  const withSession = (query) => (session ? query.session(session) : query);
  const saveWithSession = (doc) => (session ? doc.save({ session }) : doc.save());

  const swapRequest = await withSession(SwapRequest.findById(requestId));

  if (!swapRequest) {
    const error = new Error('Swap request not found.');
    error.statusCode = 404;
    throw error;
  }

  if (!swapRequest.responder.equals(userId)) {
    const error = new Error('You are not allowed to respond to this request.');
    error.statusCode = 403;
    throw error;
  }

  if (swapRequest.status !== SWAP_REQUEST_STATUS.PENDING) {
    const error = new Error('This request has already been processed.');
    error.statusCode = 400;
    throw error;
  }

  const [requesterSlot, responderSlot] = await Promise.all([
    withSession(Event.findById(swapRequest.requesterSlot)),
    withSession(Event.findById(swapRequest.responderSlot))
  ]);

  if (!requesterSlot || !responderSlot) {
    const error = new Error('One or more slots were not found.');
    error.statusCode = 404;
    throw error;
  }

  if (!accepted) {
    swapRequest.status = SWAP_REQUEST_STATUS.REJECTED;
    requesterSlot.status = EVENT_STATUS.SWAPPABLE;
    responderSlot.status = EVENT_STATUS.SWAPPABLE;

    await Promise.all([
      saveWithSession(swapRequest),
      saveWithSession(requesterSlot),
      saveWithSession(responderSlot)
    ]);

    return { statusCode: 200, body: { message: 'Swap request rejected.' } };
  }

  const originalRequester = requesterSlot.owner;
  requesterSlot.owner = responderSlot.owner;
  responderSlot.owner = originalRequester;
  requesterSlot.status = EVENT_STATUS.BUSY;
  responderSlot.status = EVENT_STATUS.BUSY;
  swapRequest.status = SWAP_REQUEST_STATUS.ACCEPTED;

  await Promise.all([
    saveWithSession(requesterSlot),
    saveWithSession(responderSlot),
    saveWithSession(swapRequest)
  ]);

  return { statusCode: 200, body: { message: 'Swap request accepted. Slots have been exchanged.' } };
};

/**
 * Detect whether MongoDB rejected our transaction because the server is not part of a replica set.
 */
const isTransactionUnsupported = (error) =>
  error?.message?.includes('Transaction') &&
  error?.message?.includes('replica set');

/**
 * Respond to a swap request. Accepting swaps the ownership of the involved slots.
 */
export const respondToSwapRequest = async (req, res, next) => {
  const { requestId } = req.params;
  const { accepted } = req.body;

  if (accepted === undefined) {
    return res.status(400).json({ message: 'Request body must include accepted: true|false.' });
  }

  const context = { requestId, accepted, userId: req.user.id };

  let session;
  try {
    session = await mongoose.startSession();
    let responsePayload;

    await session.withTransaction(async () => {
      responsePayload = await processSwapResponse(context, session);
    });

    return res.status(responsePayload.statusCode).json(responsePayload.body);
  } catch (error) {
    if (isTransactionUnsupported(error)) {
      // Transactions require MongoDB replica sets. If unavailable, re-run the logic without sessions
      // so self-hosted single-node environments can still complete the workflow.
      try {
        const responsePayload = await processSwapResponse(context);
        return res.status(responsePayload.statusCode).json(responsePayload.body);
      } catch (fallbackError) {
        return next(fallbackError);
      }
    }

    return next(error);
  } finally {
    if (session) {
      session.endSession();
    }
  }
};
