import { useState } from 'react';
import api from '../../lib/api';
import useFetch from '../../hooks/useFetch';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Loader, ErrorState, Empty } from '../../components/StateViews';

const FILTERS = ['pending', 'verified', 'all'];

export default function Artisans() {
  const [status, setStatus] = useState('pending');
  const url = status === 'all' ? '/admin/artisans' : `/admin/artisans?status=${status}`;
  const { data, loading, error, refetch } = useFetch(url, [status]);

  const approve = async (id) => {
    await api.patch(`/admin/artisans/${id}/approve`);
    refetch();
  };

  return (
    <div>
      <h1 className="font-display text-3xl text-navy">Artisan approvals</h1>

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
          {data.map((a) => (
            <div
              key={a._id}
              className="flex items-center gap-4 rounded-xl bg-white p-4 ring-1 ring-navy/5"
            >
              <div className="flex-1">
                <div className="font-display text-lg text-navy">
                  {a.user?.name || 'Unnamed artisan'}
                </div>
                <div className="text-sm text-navy/60">
                  {[a.craft, a.region].filter(Boolean).join(' · ') || a.user?.email}
                </div>
              </div>
              {a.verified ? (
                <Badge variant="gi">Verified</Badge>
              ) : (
                <Button size="sm" onClick={() => approve(a._id)}>
                  Approve
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Empty message="No artisans in this list." />
      )}
    </div>
  );
}
