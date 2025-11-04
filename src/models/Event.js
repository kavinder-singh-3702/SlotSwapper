import mongoose from '../config/database.js';
import { EVENT_STATUS } from '../constants/eventStatus.js';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(EVENT_STATUS),
      default: EVENT_STATUS.BUSY
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Ensure end time is always after the start time to avoid invalid schedules.
eventSchema.pre('validate', function validateTime(next) {
  if (this.endTime <= this.startTime) {
    return next(new Error('Event endTime must be later than startTime.'));
  }
  return next();
});

const Event = mongoose.model('Event', eventSchema);
export default Event;
