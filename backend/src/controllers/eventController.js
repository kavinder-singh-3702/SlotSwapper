import Event from '../models/Event.js';
import { EVENT_STATUS } from '../constants/eventStatus.js';

/**
 * Return events owned by the authenticated user.
 */
export const getMyEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ owner: req.user.id }).sort({ startTime: 1 });
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
    const { title, startTime, endTime, status = EVENT_STATUS.BUSY } = req.body;

    if (!title || !startTime || !endTime) {
      return res.status(400).json({ message: 'title, startTime, and endTime are required.' });
    }

    const event = await Event.create({
      title,
      startTime,
      endTime,
      status,
      owner: req.user.id
    });

    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch a single event ensuring ownership before returning.
 */
export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, owner: req.user.id });

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    res.json(event);
  } catch (error) {
    next(error);
  }
};

/**
 * Update mutable fields on an event owned by the user.
 */
export const updateEvent = async (req, res, next) => {
  try {
    const allowedFields = ['title', 'startTime', 'endTime', 'status'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    res.json(event);
  } catch (error) {
    next(error);
  }
};

/**
 * Remove an event owned by the user.
 */
export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, owner: req.user.id });

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
