import { useState } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import { formatINR } from '../../lib/format';
import Button from '../../components/ui/Button';
import ProductStatusBadge from '../../components/ProductStatusBadge';
import { Loader, ErrorState, Empty } from '../../components/StateViews';

const FILTERS = ['all', 'pending', 'approved', 'published', 'rejected'];

export default function Products() {
  const [status, setStatus] = useState('all');
  const url = status === 'all' ? '/artisan/products' : `/artisan/products?status=${status}`;
  const { data, loading, error } = useFetch(url, [status]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-navy">My products</h1>
        <Button as={Link} to="/artisan/products/new">
          + Add product
        </Button>
      </div>

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
        <div className="mt-6 space-y-3">
          {data.map((p) => {
            const editable = ['pending', 'rejected'].includes(p.status);
            return (
              <div
                key={p._id}
                className="flex items-center gap-4 rounded-xl bg-white p-4 ring-1 ring-navy/5"
              >
                <div className="h-16 w-16 overflow-hidden rounded bg-navy/5">
                  {p.images?.[0]?.url && (
                    <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-display text-lg text-navy">{p.title}</div>
                  <div className="text-sm text-navy/60">{formatINR(p.price)}</div>
                  {p.status === 'rejected' && p.rejectionReason && (
                    <div className="mt-1 text-xs text-red-500">
                      Rejected: {p.rejectionReason}
                    </div>
                  )}
                </div>
                <ProductStatusBadge status={p.status} />
                {editable && (
                  <Button as={Link} to={`/artisan/products/${p._id}/edit`} variant="outline" size="sm">
                    Edit
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <Empty message="No products yet. Add your first creation." />
      )}
    </div>
  );
}
