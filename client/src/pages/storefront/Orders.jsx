import useFetch from '../../hooks/useFetch';
import { formatINR, formatDate } from '../../lib/format';
import Badge from '../../components/ui/Badge';
import { Loader, ErrorState, Empty } from '../../components/StateViews';

const STATUS_VARIANT = {
  pending: 'warning',
  paid: 'neutral',
  shipped: 'neutral',
  delivered: 'success',
};

export default function Orders() {
  const { data, loading, error } = useFetch('/orders', []);

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-display text-4xl text-navy">My orders</h1>

      {data?.length ? (
        <div className="mt-8 space-y-4">
          {data.map((o) => (
            <div key={o._id} className="rounded-xl bg-white p-5 ring-1 ring-navy/5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs text-navy/40">#{o._id.slice(-8)}</div>
                  <div className="text-sm text-navy/60">{formatDate(o.createdAt)}</div>
                </div>
                <Badge variant={STATUS_VARIANT[o.status] || 'neutral'}>{o.status}</Badge>
              </div>
              <div className="mt-3 space-y-1 text-sm text-navy/70">
                {o.items.map((it, i) => (
                  <div key={i} className="flex justify-between">
                    <span>
                      {it.title} × {it.quantity}
                    </span>
                    <span>{formatINR((it.price || 0) * it.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-between border-t border-navy/10 pt-3 font-semibold text-navy">
                <span>Total</span>
                <span>{formatINR(o.total)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty message="You haven't placed any orders yet." />
      )}
    </div>
  );
}
