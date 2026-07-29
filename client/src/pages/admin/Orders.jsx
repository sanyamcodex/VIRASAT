import { useState } from 'react';
import api from '../../lib/api';
import useFetch from '../../hooks/useFetch';
import { formatINR, formatDate } from '../../lib/format';
import { Loader, ErrorState, Empty } from '../../components/StateViews';

const FILTERS = ['all', 'pending', 'paid', 'shipped', 'delivered'];

export default function Orders() {
  const [status, setStatus] = useState('all');
  const url = status === 'all' ? '/admin/orders' : `/admin/orders?status=${status}`;
  const { data, loading, error, refetch } = useFetch(url, [status]);

  const setOrderStatus = async (id, next) => {
    await api.patch(`/admin/orders/${id}/status`, { status: next });
    refetch();
  };

  return (
    <div>
      <h1 className="font-display text-3xl text-navy">Order management</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setStatus(f)}
            className={`rounded-full px-4 py-1.5 text-sm capitalize ring-1 ring-navy/15 ${
              status === f ? 'bg-navy text-cream' : 'text-navy/70 hover:bg-navy/5'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorState message={error} />
      ) : data?.length ? (
        <div className="mt-6 overflow-x-auto rounded-card bg-white shadow-sm ring-1 ring-navy/5">
          <table className="w-full text-sm">
            <thead className="border-b border-navy/10 bg-cream/40 text-left text-xs uppercase tracking-wider text-stone">
              <tr>
                <th className="p-3 font-semibold">Order</th>
                <th className="p-3 font-semibold">Customer</th>
                <th className="p-3 font-semibold">Date</th>
                <th className="p-3 font-semibold">Total</th>
                <th className="p-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((o) => (
                <tr
                  key={o._id}
                  className="border-b border-navy/5 transition-colors last:border-0 hover:bg-cream/40"
                >
                  <td className="p-3 font-mono text-xs text-stone">#{o._id.slice(-8)}</td>
                  <td className="p-3 text-charcoal">{o.user?.name || '—'}</td>
                  <td className="p-3 text-stone">{formatDate(o.createdAt)}</td>
                  <td className="p-3 font-medium text-navy">{formatINR(o.total)}</td>
                  <td className="p-3">
                    <select
                      value={o.status}
                      onChange={(e) => setOrderStatus(o._id, e.target.value)}
                      className="rounded-lg border border-navy/15 bg-white px-2 py-1 text-navy"
                    >
                      {['pending', 'paid', 'shipped', 'delivered'].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty message="No orders found." />
      )}
    </div>
  );
}
