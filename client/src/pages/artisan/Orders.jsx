import api from '../../lib/api';
import useFetch from '../../hooks/useFetch';
import { formatINR, formatDate } from '../../lib/format';
import Badge from '../../components/ui/Badge';
import { Loader, ErrorState, Empty } from '../../components/StateViews';

const FULFILL_VARIANT = { pending: 'warning', shipped: 'neutral', delivered: 'success' };

export default function Orders() {
  const { data, loading, error, refetch } = useFetch('/artisan/orders', []);

  const updateItem = async (orderId, itemId, fulfillmentStatus) => {
    await api.patch(`/artisan/orders/${orderId}/items/${itemId}`, { fulfillmentStatus });
    refetch();
  };

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <h1 className="font-display text-3xl text-navy">Order fulfillment</h1>

      {data?.length ? (
        <div className="mt-6 space-y-4">
          {data.map((o) => (
            <div key={o._id} className="rounded-xl bg-white p-5 ring-1 ring-navy/5">
              <div className="flex items-center justify-between border-b border-navy/10 pb-3">
                <span className="font-mono text-xs text-navy/40">#{o._id.slice(-8)}</span>
                <span className="text-sm text-navy/50">{formatDate(o.createdAt)}</span>
              </div>
              <div className="mt-3 space-y-3">
                {o.items.map((it) => (
                  <div key={it._id} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="text-navy">
                        {it.title} × {it.quantity}
                      </div>
                      <div className="text-sm text-navy/50">
                        {formatINR((it.price || 0) * it.quantity)}
                      </div>
                    </div>
                    <Badge variant={FULFILL_VARIANT[it.fulfillmentStatus] || 'neutral'}>
                      {it.fulfillmentStatus}
                    </Badge>
                    <select
                      value={it.fulfillmentStatus}
                      onChange={(e) => updateItem(o._id, it._id, e.target.value)}
                      className="rounded-lg border border-navy/15 bg-white px-2 py-1 text-sm text-navy"
                    >
                      <option value="pending" disabled>
                        pending
                      </option>
                      <option value="shipped">shipped</option>
                      <option value="delivered">delivered</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty message="No orders to fulfill yet." />
      )}
    </div>
  );
}
