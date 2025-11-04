'use client';

import React, { useState } from 'react';
import { useEventContext } from '../../context/EventContext';
import type { EventStatus } from '../../types/events';

const defaultStatus: EventStatus = 'BUSY';

const EventForm: React.FC = () => {
  const { createEvent } = useEventContext();
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [status, setStatus] = useState<EventStatus>(defaultStatus);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setTitle('');
    setStartTime('');
    setEndTime('');
    setStatus(defaultStatus);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (new Date(startTime) >= new Date(endTime)) {
      setError('End time must be later than the start time.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createEvent({ title, startTime, endTime, status });
      reset();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create event.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="card" style={{ display: 'grid', gap: '1rem' }} onSubmit={handleSubmit}>
      <div>
        <h3 style={{ margin: 0 }}>Create new event</h3>
        <p className="muted" style={{ marginTop: '0.35rem' }}>
          Log recurring commitments or free time to keep your calendar in sync.
        </p>
      </div>
      <label className="label" htmlFor="event-title">
        <span>Title</span>
        <input
          id="event-title"
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Team sync"
          required
        />
      </label>
      <label className="label" htmlFor="event-start">
        <span>Start</span>
        <input
          id="event-start"
          className="input"
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
      </label>
      <label className="label" htmlFor="event-end">
        <span>End</span>
        <input
          id="event-end"
          className="input"
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
      </label>
      <label className="label" htmlFor="event-status">
        <span>Status</span>
        <select
          id="event-status"
          className="input"
          value={status}
          onChange={(e) => setStatus(e.target.value as EventStatus)}
        >
          <option value="BUSY">Busy</option>
          <option value="SWAPPABLE">Swappable</option>
        </select>
      </label>
      {error && <p style={{ color: 'var(--danger)', margin: 0 }}>{error}</p>}
      <button className="button" type="submit" disabled={submitting}>
        {submitting ? 'Saving…' : 'Add event'}
      </button>
    </form>
  );
};

export default EventForm;
