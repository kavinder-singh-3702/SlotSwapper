export type EventStatus = 'BUSY' | 'SWAPPABLE' | 'SWAP_PENDING';

export type SwapRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export type CalendarEvent = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: EventStatus;
};

export type SwappableSlot = CalendarEvent & {
  owner: {
    id: string;
    name: string;
    email: string;
  };
};

export type PopulatedSwapRequest = {
  id: string;
  status: SwapRequestStatus;
  createdAt: string;
  requester: {
    id: string;
    name: string;
    email: string;
  };
  responder: {
    id: string;
    name: string;
    email: string;
  };
  requesterSlot: SwappableSlot;
  responderSlot: SwappableSlot;
};

export type EventContextValue = {
  events: CalendarEvent[];
  swappableSlots: SwappableSlot[];
  incomingRequests: PopulatedSwapRequest[];
  outgoingRequests: PopulatedSwapRequest[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createEvent: (payload: CreateEventPayload) => Promise<void>;
  updateEventStatus: (eventId: string, status: EventStatus) => Promise<void>;
  requestSwap: (params: SwapRequestPayload) => Promise<void>;
  respondToRequest: (requestId: string, accepted: boolean) => Promise<void>;
};

export type CreateEventPayload = {
  title: string;
  startTime: string;
  endTime: string;
  status?: EventStatus;
};

export type SwapRequestPayload = {
  mySlotId: string;
  theirSlotId: string;
};
