import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import useFetch from '../../hooks/useFetch';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Loader } from '../../components/StateViews';

// Handles both create (/products/new) and edit (/products/:id/edit).
// Images are sent as multipart form-data → the server uploads them to Cloudinary.
export default function ProductForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const categories = useFetch('/categories', []);
  const own = useFetch(editing ? '/artisan/products' : null, [id]);
  const product = editing ? own.data?.find((p) => p._id === id) : null;

  const { register, handleSubmit, reset, formState } = useForm();
  const [error, setError] = useState('');

  useEffect(() => {
    if (product)
      reset({
        title: product.title,
        description: product.description || '',
        price: product.price,
        category: product.category,
      });
  }, [product, reset]);

  const onSubmit = async (values) => {
    setError('');
    const fd = new FormData();
    fd.append('title', values.title);
    if (values.description) fd.append('description', values.description);
    fd.append('price', values.price);
    fd.append('category', values.category);
    if (values.images) Array.from(values.images).forEach((f) => fd.append('images', f));

    try {
      if (editing) await api.patch(`/artisan/products/${id}`, fd);
      else await api.post('/artisan/products', fd);
      navigate('/artisan/products');
    } catch (e) {
      setError(e.response?.data?.message || 'Could not save product');
    }
  };

  if (editing && own.loading) return <Loader />;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl text-navy">
        {editing ? 'Edit product' : 'Add product'}
      </h1>
      {editing && product?.status === 'rejected' && product.rejectionReason && (
        <p className="mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          Rejected: {product.rejectionReason}. Editing resubmits it for review.
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <Input label="Title" {...register('title', { required: true })} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-navy">Description</label>
          <textarea
            {...register('description')}
            className="min-h-[100px] rounded-lg border border-navy/15 bg-white px-3 py-2 text-navy"
          />
        </div>
        <Input label="Price (₹)" type="number" step="1" {...register('price', { required: true })} />
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
          <label className="text-sm font-medium text-navy">
            Images {editing && <span className="text-navy/40">(leave empty to keep current)</span>}
          </label>
          <input type="file" accept="image/*" multiple {...register('images')} className="text-sm" />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-3">
          <Button type="submit" disabled={formState.isSubmitting}>
            {editing ? 'Save changes' : 'Submit for review'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/artisan/products')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
