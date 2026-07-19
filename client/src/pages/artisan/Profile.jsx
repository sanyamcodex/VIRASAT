import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import useFetch from '../../hooks/useFetch';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Loader, ErrorState } from '../../components/StateViews';

export default function Profile() {
  const { data, loading, error, refetch } = useFetch('/artisan/profile', []);
  const { register, handleSubmit, reset, formState } = useForm();
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (data)
      reset({
        bio: data.bio || '',
        region: data.region || '',
        craft: data.craft || '',
        story: data.story || '',
      });
  }, [data, reset]);

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} />;

  const onSubmit = async (values) => {
    setMsg('');
    setErr('');
    const fd = new FormData();
    ['bio', 'region', 'craft', 'story'].forEach((f) => fd.append(f, values[f] || ''));
    if (values.photos) Array.from(values.photos).forEach((p) => fd.append('photos', p));
    try {
      await api.patch('/artisan/profile', fd);
      setMsg('Profile updated.');
      refetch();
    } catch (e) {
      setErr(e.response?.data?.message || 'Could not update profile');
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl text-navy">Story &amp; profile</h1>

      {data?.photos?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {data.photos.map((ph, i) => (
            <img
              key={i}
              src={ph.url}
              alt=""
              className="h-20 w-20 rounded-lg object-cover ring-1 ring-navy/10"
            />
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <Input label="Craft" {...register('craft')} placeholder="e.g. Warli painting" />
        <Input label="Region" {...register('region')} placeholder="e.g. Maharashtra" />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-navy">Short bio</label>
          <textarea
            {...register('bio')}
            className="min-h-[80px] rounded-lg border border-navy/15 bg-white px-3 py-2 text-navy"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-navy">Your story</label>
          <textarea
            {...register('story')}
            className="min-h-[140px] rounded-lg border border-navy/15 bg-white px-3 py-2 text-navy"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-navy">Add photos</label>
          <input type="file" accept="image/*" multiple {...register('photos')} className="text-sm" />
        </div>

        {msg && <p className="text-sm text-green-600">{msg}</p>}
        {err && <p className="text-sm text-red-500">{err}</p>}
        <Button type="submit" disabled={formState.isSubmitting}>
          Save profile
        </Button>
      </form>
    </div>
  );
}
