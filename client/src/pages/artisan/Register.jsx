import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../lib/api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
  craft: z.string().min(1, 'Required'),
  region: z.string().min(1, 'Required'),
  phone: z.string().min(8, 'Enter a valid phone'),
});

// Public artisan application. Creates User(role=artisan) + ArtisanProfile
// (verified=false → lands in the admin "Artisan approvals" queue).
export default function ArtisanRegister() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    setError('');
    try {
      await api.post('/auth/artisan/register', values);
      setSubmitted(true);
    } catch (e) {
      setError(e.response?.data?.message || 'Could not submit your application');
    }
  };

  if (submitted) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream px-6">
        <div className="w-full max-w-md text-center">
          <div className="font-display text-2xl font-bold text-navy">VIRASAT</div>
          <div className="text-xs uppercase tracking-[0.3em] text-gold">Artisan Portal</div>
          <h1 className="mt-8 font-display text-3xl text-navy">Application received</h1>
          <p className="mt-3 text-navy/70">
            Thank you for applying to sell on VIRASAT. Your account is now pending
            review — access is enabled once an admin approves your artisan account.
          </p>
          <Button as={Link} to="/artisan/login" size="lg" className="mt-8">
            Go to artisan login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center bg-cream px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="font-display text-2xl font-bold text-navy">VIRASAT</div>
          <div className="text-xs uppercase tracking-[0.3em] text-gold">Artisan Portal</div>
        </div>
        <h1 className="mt-6 text-center font-display text-3xl text-navy">Become an artisan</h1>
        <p className="mt-1 text-center text-navy/60">
          Apply to sell your craft. An admin reviews every application.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <Input label="Full name" {...register('name')} error={formState.errors.name?.message} />
          <Input label="Email" type="email" {...register('email')} error={formState.errors.email?.message} />
          <Input label="Password" type="password" {...register('password')} error={formState.errors.password?.message} />
          <Input label="Craft" placeholder="e.g. Warli painting" {...register('craft')} error={formState.errors.craft?.message} />
          <Input label="Region" placeholder="e.g. Maharashtra" {...register('region')} error={formState.errors.region?.message} />
          <Input label="Phone" {...register('phone')} error={formState.errors.phone?.message} />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={formState.isSubmitting}>
            Submit application
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-navy/60">
          Already approved?{' '}
          <Link to="/artisan/login" className="text-terracotta hover:underline">
            Artisan login
          </Link>
        </p>
      </div>
    </div>
  );
}
