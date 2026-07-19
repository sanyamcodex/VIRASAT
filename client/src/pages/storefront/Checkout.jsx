import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../lib/api';
import { loadRazorpay } from '../../lib/razorpay';
import { useCartStore } from '../../store/cartStore';
import { formatINR } from '../../lib/format';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Empty } from '../../components/StateViews';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  phone: z.string().min(8, 'Enter a valid phone'),
  address: z.string().min(1, 'Required'),
  city: z.string().min(1, 'Required'),
  state: z.string().min(1, 'Required'),
  pincode: z.string().min(4, 'Required'),
});

export default function Checkout() {
  const navigate = useNavigate();
  const { items, clear } = useCartStore();
  const subtotal = items.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) });

  if (!items.length)
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Empty message="Your cart is empty." />
      </div>
    );

  const pay = async (shipping) => {
    setError('');
    setBusy(true);
    const ok = await loadRazorpay();
    if (!ok) {
      setError('Could not load the payment gateway. Check your connection.');
      setBusy(false);
      return;
    }
    try {
      const { data } = await api.post('/checkout/order', { shipping });
      const rzp = new window.Razorpay({
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'VIRASAT',
        description: 'Order payment',
        order_id: data.razorpayOrderId,
        prefill: { name: shipping.name, contact: shipping.phone },
        theme: { color: '#C9622B' },
        handler: async (resp) => {
          try {
            await api.post('/checkout/verify', {
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
            });
            await clear();
            navigate('/orders');
          } catch {
            setError('Payment verification failed. Contact support if charged.');
          }
        },
      });
      rzp.on('payment.failed', () => setError('Payment failed. Please try again.'));
      rzp.open();
    } catch (e) {
      setError(e.response?.data?.message || 'Could not start checkout.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-6 py-12 md:grid-cols-[1fr_20rem]">
      <div>
        <h1 className="font-display text-4xl text-navy">Checkout</h1>
        <form onSubmit={handleSubmit(pay)} className="mt-6 grid gap-4 md:grid-cols-2">
          <Input label="Full name" {...register('name')} error={formState.errors.name?.message} />
          <Input label="Phone" {...register('phone')} error={formState.errors.phone?.message} />
          <Input
            label="Address"
            className="md:col-span-2"
            {...register('address')}
            error={formState.errors.address?.message}
          />
          <Input label="City" {...register('city')} error={formState.errors.city?.message} />
          <Input label="State" {...register('state')} error={formState.errors.state?.message} />
          <Input
            label="Pincode"
            {...register('pincode')}
            error={formState.errors.pincode?.message}
          />
          {error && <p className="text-sm text-red-500 md:col-span-2">{error}</p>}
          <Button type="submit" size="lg" className="md:col-span-2" disabled={busy || formState.isSubmitting}>
            {busy ? 'Processing…' : `Pay ${formatINR(subtotal)}`}
          </Button>
        </form>
      </div>

      {/* Summary */}
      <aside className="h-fit rounded-xl bg-white p-5 ring-1 ring-navy/5">
        <h2 className="font-display text-xl text-navy">Order summary</h2>
        <div className="mt-4 space-y-2 text-sm">
          {items.map(({ product, quantity }) => (
            <div key={product._id} className="flex justify-between">
              <span className="text-navy/70">
                {product.title} × {quantity}
              </span>
              <span className="text-navy">{formatINR(product.price * quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between border-t border-navy/10 pt-4 font-semibold text-navy">
          <span>Total</span>
          <span>{formatINR(subtotal)}</span>
        </div>
      </aside>
    </div>
  );
}
