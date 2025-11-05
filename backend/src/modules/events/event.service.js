import Event from '../../models/Event.js';
import { EVENT_STATUS } from '../../constants/eventStatus.js';

export const listEventsForUser = async (userId) => {
  return Event.find({ owner: userId }).sort({ startTime: 1 });
};

export const createEventForUser = async (userId, { title, startTime, endTime, status }) => {
  if (!title || !startTime || !endTime) {
    const error = new Error('title, startTime, and endTime are required.');
    error.statusCode = 400;
    throw error;
  }

  const event = await Event.create({
    title,
    startTime,
    endTime,
    status: status ?? EVENT_STATUS.BUSY,
    owner: userId
  });

  return event;
};

export const getEventForUser = async (userId, eventId) => {
  const event = await Event.findOne({ _id: eventId, owner: userId });
  if (!event) {
    const error = new Error('Event not found.');
    error.statusCode = 404;
    throw error;
  }
  return event;
};

export const updateEventForUser = async (userId, eventId, updates) => {
  const allowedFields = ['title', 'startTime', 'endTime', 'status'];
  const payload = {};

  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      payload[field] = updates[field];
    }
  });

  const event = await Event.findOneAndUpdate(
    { _id: eventId, owner: userId },
    payload,
    { new: true, runValidators: true }
  );

  if (!event) {
    const error = new Error('Event not found.');
    error.statusCode = 404;
    throw error;
  }

  return event;
};

export const deleteEventForUser = async (userId, eventId) => {
  const event = await Event.findOneAndDelete({ _id: eventId, owner: userId });

  if (!event) {
    const error = new Error('Event not found.');
    error.statusCode = 404;
    throw error;
  }
};
