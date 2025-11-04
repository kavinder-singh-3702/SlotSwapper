import mongoose from '../config/database.js';
import { SWAP_REQUEST_STATUS } from '../constants/eventStatus.js';

const swapRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    responder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    requesterSlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },
    responderSlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },
    status: {
      type: String,
      enum: Object.values(SWAP_REQUEST_STATUS),
      default: SWAP_REQUEST_STATUS.PENDING
    }
  },
  {
    timestamps: true
  }
);

const SwapRequest = mongoose.model('SwapRequest', swapRequestSchema);
export default SwapRequest;
