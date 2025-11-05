import mongoose from '../../config/database.js';
import Event from '../../models/Event.js';
import SwapRequest from '../../models/SwapRequest.js';
import { EVENT_STATUS, SWAP_REQUEST_STATUS } from '../../constants/eventStatus.js';
import { emitToUser } from '../../config/socket.js';

const swapRequestPopulateConfig = [
  { path: 'requester', select: 'name email' },
  { path: 'responder', select: 'name email' },
  {
    path: 'requesterSlot',
    populate: { path: 'owner', select: 'name email' }
  },
  {
    path: 'responderSlot',
    populate: { path: 'owner', select: 'name email' }
  }
];

const SWAP_SOCKET_EVENTS = {
  REQUEST_RECEIVED: 'swap:request-received',
  REQUEST_ACCEPTED: 'swap:request-accepted'
};

const populateSwapRequest = async (swapRequest) => {
  if (!swapRequest) {
    return swapRequest;
  }

  await swapRequest.populate(swapRequestPopulateConfig);
  return swapRequest;
};

export const findSwappableSlots = async (userId) => {
  return Event.find({
    owner: { $ne: userId },
    status: EVENT_STATUS.SWAPPABLE
  })
    .populate('owner', 'name email')
    .sort({ startTime: 1 });
};

export const listSwapRequestsForUser = async (userId) => {
  const [incoming, outgoing] = await Promise.all([
    SwapRequest.find({ responder: userId }).populate(swapRequestPopulateConfig).sort({ createdAt: -1 }),
    SwapRequest.find({ requester: userId }).populate(swapRequestPopulateConfig).sort({ createdAt: -1 })
  ]);

  return { incoming, outgoing };
};

export const createSwapRequestForUser = async (userId, { mySlotId, theirSlotId }) => {
  if (!mySlotId || !theirSlotId) {
    const error = new Error('mySlotId and theirSlotId are required.');
    error.statusCode = 400;
    throw error;
  }

  if (mySlotId === theirSlotId) {
    const error = new Error('Cannot swap the same slot.');
    error.statusCode = 400;
    throw error;
  }

  let mySlotLocked;
  let theirSlotLocked;

  try {
    const [mySlot, theirSlot] = await Promise.all([
      Event.findOne({ _id: mySlotId, owner: userId }),
      Event.findById(theirSlotId)
    ]);

    if (!mySlot) {
      const error = new Error('Your slot could not be found.');
      error.statusCode = 404;
      throw error;
    }

    if (!theirSlot) {
      const error = new Error('Requested slot could not be found.');
      error.statusCode = 404;
      throw error;
    }

    if (theirSlot.owner.equals(userId)) {
      const error = new Error('Cannot create a swap with your own slot.');
      error.statusCode = 400;
      throw error;
    }

    if (mySlot.status !== EVENT_STATUS.SWAPPABLE || theirSlot.status !== EVENT_STATUS.SWAPPABLE) {
      const error = new Error('Both slots must be swappable to initiate a request.');
      error.statusCode = 400;
      throw error;
    }

    mySlotLocked = await Event.findOneAndUpdate(
      { _id: mySlotId, owner: userId, status: EVENT_STATUS.SWAPPABLE },
      { status: EVENT_STATUS.SWAP_PENDING },
      { new: true }
    );

    if (!mySlotLocked) {
      const error = new Error('Your slot is no longer swappable.');
      error.statusCode = 409;
      throw error;
    }

    theirSlotLocked = await Event.findOneAndUpdate(
      { _id: theirSlotId, status: EVENT_STATUS.SWAPPABLE },
      { status: EVENT_STATUS.SWAP_PENDING },
      { new: true }
    );

    if (!theirSlotLocked) {
      const error = new Error('Requested slot is no longer available for swap.');
      error.statusCode = 409;
      throw error;
    }

    const swapRequest = await SwapRequest.create({
      requester: userId,
      responder: theirSlotLocked.owner,
      requesterSlot: mySlotId,
      responderSlot: theirSlotId
    });

    await populateSwapRequest(swapRequest);

    emitToUser(theirSlotLocked.owner, SWAP_SOCKET_EVENTS.REQUEST_RECEIVED, {
      swapRequest
    });

    return swapRequest;
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

    throw error;
  }
};

export const respondToSwapRequestForUser = async (userId, requestId, accepted) => {
  const context = { requestId, accepted, userId };

  let session;
  let result;
  try {
    session = await mongoose.startSession();

    await session.withTransaction(async () => {
      result = await processSwapResponse(context, session);
    });
  } catch (error) {
    if (isTransactionUnsupported(error)) {
      result = await processSwapResponse(context);
    } else {
      throw error;
    }
  } finally {
    if (session) {
      session.endSession();
    }
  }

  if (result?.swapRequest) {
    await populateSwapRequest(result.swapRequest);

    if (result.swapRequest.status === SWAP_REQUEST_STATUS.ACCEPTED) {
      const requesterId =
        result.swapRequest.requester?._id ?? result.swapRequest.requester;

      emitToUser(requesterId, SWAP_SOCKET_EVENTS.REQUEST_ACCEPTED, {
        message: result.message,
        swapRequest: result.swapRequest
      });
    }
  }

  return result;
};

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

    return {
      message: 'Swap request rejected.',
      swapRequest
    };
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

  return {
    message: 'Swap request accepted. Slots have been exchanged.',
    swapRequest
  };
};

const isTransactionUnsupported = (error) =>
  error?.message?.includes('Transaction') &&
  error?.message?.includes('replica set');
