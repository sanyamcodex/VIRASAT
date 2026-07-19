import { useState } from 'react';
import api from '../../lib/api';
import useFetch from '../../hooks/useFetch';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Loader, ErrorState, Empty } from '../../components/StateViews';

export default function Categories() {
  const { data, loading, error, refetch } = useFetch('/categories', []);
  const [name, setName] = useState('');
  const [err, setErr] = useState('');

  const add = async (e) => {
    e.preventDefault();
    setErr('');
    if (!name.trim()) return;
    try {
      await api.post('/categories', { name: name.trim() });
      setName('');
      refetch();
    } catch (e2) {
      setErr(e2.response?.data?.message || 'Could not add category');
    }
  };

  const rename = async (id, current) => {
    const next = window.prompt('New name?', current);
    if (next && next.trim() && next !== current) {
      await api.patch(`/categories/${id}`, { name: next.trim() });
      refetch();
    }
  };

  const remove = async (id) => {
    if (window.confirm('Delete this category?')) {
      await api.delete(`/categories/${id}`);
      refetch();
    }
  };

  const toggleFeatured = async (c) => {
    await api.patch(`/categories/${c._id}/featured`, { featured: !c.featured });
    refetch();
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl text-navy">Category management</h1>

      <form onSubmit={add} className="mt-6 flex gap-3">
        <Input
          placeholder="New category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">Add</Button>
      </form>
      {err && <p className="mt-2 text-sm text-red-500">{err}</p>}

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorState message={error} />
      ) : data?.length ? (
        <div className="mt-6 space-y-2">
          {data.map((c) => (
            <div
              key={c._id}
              className="flex items-center gap-3 rounded-xl bg-white p-4 ring-1 ring-navy/5"
            >
              <span className="flex-1 font-medium text-navy">{c.name}</span>
              {c.featured && <Badge variant="gi">Featured</Badge>}
              <button onClick={() => toggleFeatured(c)} className="text-sm text-navy/60 hover:underline">
                {c.featured ? 'Unfeature' : 'Feature'}
              </button>
              <button onClick={() => rename(c._id, c.name)} className="text-sm text-navy/60 hover:underline">
                Rename
              </button>
              <button onClick={() => remove(c._id)} className="text-sm text-red-500 hover:underline">
                Delete
              </button>
            </div>
          ))}
        </div>
      ) : (
        <Empty message="No categories yet." />
      )}
    </div>
  );
}
