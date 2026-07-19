import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import useFetch from '../../hooks/useFetch';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

// Admin direct listing — creates a product already published, bypassing the queue.
export default function DirectListing() {
  const navigate = useNavigate();
  const categories = useFetch('/categories', []);
  const { register, handleSubmit, formState } = useForm();
  const [error, setError] = useState('');

  const onSubmit = async (values) => {
    setError('');
    const fd = new FormData();
    fd.append('title', values.title);
    if (values.description) fd.append('description', values.description);
    fd.append('price', values.price);
    fd.append('category', values.category);
    if (values.images) Array.from(values.images).forEach((f) => fd.append('images', f));
    try {
      await api.post('/admin/products', fd);
      navigate('/admin/moderation');
    } catch (e) {
      setError(e.response?.data?.message || 'Could not create listing');
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl text-navy">Direct listing</h1>
      <p className="mt-1 text-navy/60">Published immediately, no moderation.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <Input label="Title" {...register('title', { required: true })} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-navy">Description</label>
          <textarea
            {...register('description')}
            className="min-h-[100px] rounded-lg border border-navy/15 bg-white px-3 py-2 text-navy"
          />
        </div>
        <Input label="Price (₹)" type="number" {...register('price', { required: true })} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-navy">Category</label>
          <select
            {...register('category', { required: true })}
            className="rounded-lg border border-navy/15 bg-white px-3 py-2 text-navy"
          >
            <option value="">Select a category…</option>
            {categories.data?.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-navy">Images</label>
          <input type="file" accept="image/*" multiple {...register('images')} className="text-sm" />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={formState.isSubmitting}>
          Publish listing
        </Button>
      </form>
    </div>
  );
}
