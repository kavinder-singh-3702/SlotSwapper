import {
  createEventForUser,
  deleteEventForUser,
  getEventForUser,
  listEventsForUser,
  updateEventForUser
} from './event.service.js';

/**
 * Return events owned by the authenticated user.
 */
export const getMyEvents = async (req, res, next) => {
  try {
    const events = await listEventsForUser(req.user.id);
    res.json(events);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new event for the authenticated user.
 */
export const createEvent = async (req, res, next) => {
  try {
    const event = await createEventForUser(req.user.id, req.body);
    res.status(201).json(event);
  } catch (error) {
    handleServiceError(error, res, next);
  }
};

/**
 * Fetch a single event ensuring ownership before returning.
 */
export const getEventById = async (req, res, next) => {
  try {
    const event = await getEventForUser(req.user.id, req.params.id);
    res.json(event);
  } catch (error) {
    handleServiceError(error, res, next);
  }
};

/**
 * Update mutable fields on an event owned by the user.
 */
export const updateEvent = async (req, res, next) => {
  try {
    const event = await updateEventForUser(req.user.id, req.params.id, req.body);
    res.json(event);
  } catch (error) {
    handleServiceError(error, res, next);
  }
};

/**
 * Remove an event owned by the user.
 */
export const deleteEvent = async (req, res, next) => {
  try {
    await deleteEventForUser(req.user.id, req.params.id);
    res.status(204).send();
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
