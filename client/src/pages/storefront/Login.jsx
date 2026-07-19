import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Required'),
});

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/';
  const setAuth = useAuthStore((s) => s.setAuth);
  const mergeOnLogin = useCartStore((s) => s.mergeOnLogin);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    setError('');
    try {
      const { data } = await api.post('/auth/user/login', values);
      setAuth(data);
      await mergeOnLogin();
      navigate(redirect);
    } catch (e) {
      setError(e.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-display text-4xl text-navy">Welcome back</h1>
      <p className="mt-1 text-navy/60">Log in to your VIRASAT account.</p>

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

      <div className="my-6 flex items-center gap-3 text-xs text-navy/40">
        <span className="h-px flex-1 bg-navy/10" /> OR <span className="h-px flex-1 bg-navy/10" />
      </div>

      <Button
        as="a"
        href={`${API_BASE}/auth/google`}
        variant="outline"
        size="lg"
        className="w-full"
      >
        Continue with Google
      </Button>

      <p className="mt-6 text-center text-sm text-navy/60">
        New here?{' '}
        <Link to="/register" className="text-terracotta hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
