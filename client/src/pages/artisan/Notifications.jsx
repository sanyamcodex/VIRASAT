import api from '../../lib/api';
import useFetch from '../../hooks/useFetch';
import { formatDate } from '../../lib/format';
import Button from '../../components/ui/Button';
import { Loader, ErrorState, Empty } from '../../components/StateViews';

export default function Notifications() {
  const { data, loading, error, refetch } = useFetch('/artisan/notifications', []);

  const markRead = async (id) => {
    await api.patch(`/artisan/notifications/${id}/read`);
    refetch();
  };
  const markAll = async () => {
    await api.patch('/artisan/notifications/read-all');
    refetch();
  };

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} />;

  const hasUnread = data?.some((n) => !n.read);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-navy">Notifications</h1>
        {hasUnread && (
          <Button variant="outline" size="sm" onClick={markAll}>
            Mark all read
          </Button>
        )}
      </div>

      {data?.length ? (
        <div className="mt-6 space-y-3">
          {data.map((n) => (
            <div
              key={n._id}
              className={`flex items-start justify-between gap-4 rounded-xl p-4 ring-1 ring-navy/5 ${
                n.read ? 'bg-white' : 'bg-gold/10'
              }`}
            >
              <div>
                <p className="text-navy">{n.message}</p>
                <span className="text-xs text-navy/40">{formatDate(n.createdAt)}</span>
              </div>
              {!n.read && (
                <button
                  onClick={() => markRead(n._id)}
                  className="whitespace-nowrap text-sm text-terracotta hover:underline"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Empty message="No notifications." />
      )}
    </div>
  );
}
