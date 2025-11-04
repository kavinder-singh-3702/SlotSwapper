'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { apiRequest } from '../services/api';
import type {
  CalendarEvent,
  CreateEventPayload,
  EventContextValue,
  EventStatus,
  PopulatedSwapRequest,
  SwapRequestPayload,
  SwappableSlot
} from '../types/events';

const EventContext = createContext<EventContextValue | undefined>(undefined);

const mapEvent = (event: any): CalendarEvent => ({
  id: event._id ?? event.id,
  title: event.title,
  startTime: event.startTime,
  endTime: event.endTime,
  status: event.status
});

const mapSlot = (event: any): SwappableSlot => ({
  ...mapEvent(event),
  owner: {
    id: event.owner?._id ?? event.owner?.id ?? '',
    name: event.owner?.name ?? 'Unknown',
    email: event.owner?.email ?? 'unknown@example.com'
  }
});

const mapRequest = (request: any): PopulatedSwapRequest => ({
  id: request._id ?? request.id,
  status: request.status,
  createdAt: request.createdAt,
  requester: {
    id: request.requester?._id ?? request.requester?.id ?? '',
    name: request.requester?.name ?? 'Unknown',
    email: request.requester?.email ?? 'unknown@example.com'
  },
  responder: {
    id: request.responder?._id ?? request.responder?.id ?? '',
    name: request.responder?.name ?? 'Unknown',
    email: request.responder?.email ?? 'unknown@example.com'
  },
  requesterSlot: mapSlot(request.requesterSlot),
  responderSlot: mapSlot(request.responderSlot)
});

const defaultState = {
  events: [] as CalendarEvent[],
  swappableSlots: [] as SwappableSlot[],
  incomingRequests: [] as PopulatedSwapRequest[],
  outgoingRequests: [] as PopulatedSwapRequest[],
  loading: false,
  error: null as string | null
};

type EventProviderProps = {
  children: React.ReactNode;
};

export const EventProvider = ({ children }: EventProviderProps) => {
  const { token, isAuthenticated } = useAuth();
  const [state, setState] = useState(defaultState);

  // Convenience helper to restore the provider to a clean slate (used on logout).
  const resetState = useCallback(() => {
    setState({ ...defaultState });
  }, []);

  const refresh = useCallback(async () => {
    if (!token) {
      resetState();
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const [events, swappableSlots, requests] = await Promise.all([
        apiRequest<any[]>('/api/events', { method: 'GET' }, token),
        apiRequest<any[]>('/api/swappable-slots', { method: 'GET' }, token),
        apiRequest<{ incoming: any[]; outgoing: any[] }>('/api/swap-requests', { method: 'GET' }, token)
      ]);

      setState({
        events: events.map(mapEvent),
        swappableSlots: swappableSlots.map(mapSlot),
        incomingRequests: requests.incoming.map(mapRequest),
        outgoingRequests: requests.outgoing.map(mapRequest),
        loading: false,
        error: null
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error fetching data.';
      setState((prev) => ({ ...prev, loading: false, error: message }));
    }
  }, [resetState, token]);

  useEffect(() => {
    if (isAuthenticated) {
      void refresh();
    } else {
      resetState();
    }
  }, [isAuthenticated, refresh, resetState]);

  const createEvent = useCallback(async (payload: CreateEventPayload) => {
    if (!token) return;
    await apiRequest('/api/events', { method: 'POST', body: JSON.stringify(payload) }, token);
    await refresh();
  }, [refresh, token]);

  const updateEventStatus = useCallback(async (eventId: string, status: EventStatus) => {
    if (!token) return;
    await apiRequest(`/api/events/${eventId}`, { method: 'PUT', body: JSON.stringify({ status }) }, token);
    await refresh();
  }, [refresh, token]);

  const requestSwap = useCallback(async ({ mySlotId, theirSlotId }: SwapRequestPayload) => {
    if (!token) return;
    await apiRequest('/api/swap-request', {
      method: 'POST',
      body: JSON.stringify({ mySlotId, theirSlotId })
    }, token);
    await refresh();
  }, [refresh, token]);

  const respondToRequest = useCallback(async (requestId: string, accepted: boolean) => {
    if (!token) return;
    await apiRequest(`/api/swap-response/${requestId}`, {
      method: 'POST',
      body: JSON.stringify({ accepted })
    }, token);
    await refresh();
  }, [refresh, token]);

  const value = useMemo<EventContextValue>(() => ({
    ...state,
    refresh,
    createEvent,
    updateEventStatus,
    requestSwap,
    respondToRequest
  }), [createEvent, refresh, requestSwap, respondToRequest, state, updateEventStatus]);

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};

export const useEventContext = (): EventContextValue => {
  const ctx = useContext(EventContext);
  if (!ctx) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return ctx;
};
