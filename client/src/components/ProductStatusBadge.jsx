import Badge from './ui/Badge';

const MAP = {
  pending: 'warning',
  approved: 'neutral',
  published: 'success',
  rejected: 'danger',
};

export default function ProductStatusBadge({ status }) {
  return <Badge variant={MAP[status] || 'neutral'}>{status}</Badge>;
}
