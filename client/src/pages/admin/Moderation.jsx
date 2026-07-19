import { useState } from 'react';
import api from '../../lib/api';
import useFetch from '../../hooks/useFetch';
import { formatINR } from '../../lib/format';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ProductStatusBadge from '../../components/ProductStatusBadge';
import { Loader, ErrorState, Empty } from '../../components/StateViews';

const FILTERS = ['pending', 'published', 'rejected', 'all'];

// One row of the queue with an inline editor (edit fields before approving).
function ModerationRow({ product, categories, onChange }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: product.title,
    price: product.price,
    description: product.description || '',
    category: product.category || '',
  });
  const [busy, setBusy] = useState(false);

  const act = async (fn) => {
    setBusy(true);
    try {
      await fn();
      await onChange();
    } finally {
      setBusy(false);
    }
  };

  const saveEdits = () => act(() => api.patch(`/admin/products/${product._id}`, form));
  const approve = () => act(() => api.patch(`/admin/products/${product._id}/approve`));
  const reject = () => {
    const reason = window.prompt('Reason for rejection?');
    if (reason) act(() => api.patch(`/admin/products/${product._id}/reject`, { reason }));
  };
  const toggleFeatured = () =>
    act(() => api.patch(`/admin/products/${product._id}/featured`, { featured: !product.featured }));

  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-navy/5">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 overflow-hidden rounded bg-navy/5">
          {product.images?.[0]?.url && (
            <img src={product.images[0].url} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="flex-1">
          <div className="font-display text-lg text-navy">{product.title}</div>
          <div className="text-sm text-navy/60">
            {formatINR(product.price)} · {product.category?.name || '—'}
          </div>
        </div>
        <ProductStatusBadge status={product.status} />
        <button onClick={() => setOpen((o) => !o)} className="text-sm text-navy/60 hover:underline">
          {open ? 'Close' : 'Edit'}
        </button>
      </div>

      {open && (
        <div className="mt-4 grid gap-3 border-t border-navy/10 pt-4 md:grid-cols-2">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Input
            label="Price"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-sm font-medium text-navy">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="min-h-[80px] rounded-lg border border-navy/15 bg-white px-3 py-2 text-navy"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-navy">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="rounded-lg border border-navy/15 bg-white px-3 py-2 text-navy"
            >
              <option value="">Select…</option>
              {categories?.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" onClick={saveEdits} disabled={busy}>
              Save edits
            </Button>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-navy/10 pt-3">
        {product.status !== 'published' && (
          <Button size="sm" onClick={approve} disabled={busy}>
            Approve &amp; publish
          </Button>
        )}
        {product.status !== 'rejected' && (
          <Button size="sm" variant="outline" onClick={reject} disabled={busy}>
            Reject
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={toggleFeatured} disabled={busy}>
          {product.featured ? '★ Featured' : '☆ Feature'}
        </Button>
      </div>
    </div>
  );
}

export default function Moderation() {
  const [status, setStatus] = useState('pending');
  const url = status === 'all' ? '/admin/products' : `/admin/products?status=${status}`;
  const { data, loading, error, refetch } = useFetch(url, [status]);
  const categories = useFetch('/categories', []);

  return (
    <div>
      <h1 className="font-display text-3xl text-navy">Moderation queue</h1>

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
          {data.map((p) => (
            <ModerationRow
              key={p._id}
              product={p}
              categories={categories.data}
              onChange={refetch}
            />
          ))}
        </div>
      ) : (
        <Empty message="Nothing in this queue." />
      )}
    </div>
  );
}
