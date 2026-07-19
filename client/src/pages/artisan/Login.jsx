import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Required'),
});

// Standalone artisan login — reached by direct URL after admin approval,
// intentionally not linked from the public storefront nav.
export default function ArtisanLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    setError('');
    try {
      const { data } = await api.post('/auth/artisan/login', values);
      setAuth(data);
      navigate('/artisan');
    } catch (e) {
      setError(e.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-cream px-6">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="font-display text-2xl font-bold text-navy">VIRASAT</div>
          <div className="text-xs uppercase tracking-[0.3em] text-gold">Artisan Portal</div>
        </div>
        <h1 className="mt-6 text-center font-display text-3xl text-navy">Artisan login</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <Input label="Email" type="email" {...register('email')} error={formState.errors.email?.message} />
          <Input
            label="Password"
            type="password"
            {...register('password')}
            error={formState.errors.password?.message}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={formState.isSubmitting}>
            Log in
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-navy/50">
          Access is enabled once an admin approves your artisan account.
        </p>
      </div>
    </div>
  );
}
