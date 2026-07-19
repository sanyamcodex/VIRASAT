import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import CategoryCard from '../../components/CategoryCard';
import Input from '../../components/ui/Input';
import { Loader, ErrorState, Empty } from '../../components/StateViews';

export default function ArtForms() {
  const { data, loading, error } = useFetch('/categories', []);
  const [q, setQ] = useState('');

  const filtered = (data || []).filter((c) =>
    c.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-terracotta">
          The crafts of India
        </div>
        <h1 className="mt-2 font-display text-4xl text-navy">Art Forms</h1>
        <p className="mx-auto mt-3 max-w-xl text-navy/60">
          Centuries-old traditions, kept alive by the artisans who practise them.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-md">
        <Input
          placeholder="Search art forms, regions, traditions…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorState message={error} />
      ) : filtered.length ? (
        <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((c) => (
            <CategoryCard key={c._id} category={c} />
          ))}
        </div>
      ) : (
        <Empty message="No art forms found." />
      )}
    </div>
  );
}
