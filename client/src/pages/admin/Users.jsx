import { useState } from 'react';
import api from '../../lib/api';
import useFetch from '../../hooks/useFetch';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Loader, ErrorState, Empty } from '../../components/StateViews';

const FILTERS = ['all', 'user', 'artisan', 'admin'];

export default function Users() {
  const [role, setRole] = useState('all');
  const url = role === 'all' ? '/admin/users' : `/admin/users?role=${role}`;
  const { data, loading, error, refetch } = useFetch(url, [role]);

  const setDisabled = async (id, disabled) => {
    await api.patch(`/admin/users/${id}/disable`, { disabled });
    refetch();
  };

  return (
    <div>
      <h1 className="font-display text-3xl text-navy">User management</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setRole(f)}
            className={`rounded-full px-4 py-1.5 text-sm capitalize ring-1 ring-navy/15 ${
              role === f ? 'bg-navy text-cream' : 'text-navy/70 hover:bg-navy/5'
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
        <div className="mt-6 overflow-x-auto rounded-xl bg-white ring-1 ring-navy/5">
          <table className="w-full text-sm">
            <thead className="border-b border-navy/10 text-left text-navy/50">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.map((u) => (
                <tr key={u._id} className="border-b border-navy/5 last:border-0">
                  <td className="p-3 text-navy">{u.name}</td>
                  <td className="p-3 text-navy/60">{u.email}</td>
                  <td className="p-3 capitalize text-navy/60">{u.role}</td>
                  <td className="p-3">
                    {u.disabled ? (
                      <Badge variant="danger">Disabled</Badge>
                    ) : (
                      <Badge variant="success">Active</Badge>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {u.role !== 'admin' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDisabled(u._id, !u.disabled)}
                      >
                        {u.disabled ? 'Enable' : 'Disable'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty message="No users found." />
      )}
    </div>
  );
}
