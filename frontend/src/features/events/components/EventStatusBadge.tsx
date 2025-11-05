import type { EventStatus } from '@/features/events/types';

const statusCopy: Record<EventStatus, { label: string; className: string }> = {
  BUSY: { label: 'Busy', className: 'tag busy' },
  SWAPPABLE: { label: 'Swappable', className: 'tag swappable' },
  SWAP_PENDING: { label: 'Swap pending', className: 'tag pending' }
};

type Props = {
  status: EventStatus;
};

export default function EventStatusBadge({ status }: Props) {
  const { label, className } = statusCopy[status];
  return <span className={className}>{label}</span>;
}
