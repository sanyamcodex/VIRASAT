import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { formatINR } from '../../lib/format';
import Button from '../../components/ui/Button';
import { Empty } from '../../components/StateViews';

export default function Cart() {
  const navigate = useNavigate();
  const { items, updateItem, removeItem, hydrate } = useCartStore();
  const { accessToken, role } = useAuthStore();
  const subtotal = items.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const checkout = () => {
    if (accessToken && role === 'user') navigate('/checkout');
    else navigate('/login?redirect=/checkout');
  };

  if (!items.length)
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-display text-4xl text-navy">Your cart</h1>
        <Empty message="Your cart is empty." />
        <div className="text-center">
          <Button as={Link} to="/shop">
            Browse products
          </Button>
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-display text-4xl text-navy">Your cart</h1>

      <div className="mt-8 space-y-4">
        {items.map(({ product, quantity }) => (
          <div
            key={product._id}
            className="flex items-center gap-4 rounded-xl bg-white p-4 ring-1 ring-navy/5"
          >
            <div className="h-20 w-20 overflow-hidden rounded bg-navy/5">
              {product.images?.[0]?.url && (
                <img
                  src={product.images[0].url}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="flex-1">
              <Link to={`/product/${product._id}`} className="font-display text-lg text-navy">
                {product.title}
              </Link>
              <div className="text-sm text-navy/60">{formatINR(product.price)}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="h-8 w-8 rounded-full ring-1 ring-navy/15"
                onClick={() => updateItem(product._id, quantity - 1)}
              >
                −
              </button>
              <span className="w-6 text-center">{quantity}</span>
              <button
                className="h-8 w-8 rounded-full ring-1 ring-navy/15"
                onClick={() => updateItem(product._id, quantity + 1)}
              >
                +
              </button>
            </div>
            <div className="w-24 text-right font-semibold text-navy">
              {formatINR(product.price * quantity)}
            </div>
            <button
              className="text-sm text-red-500 hover:underline"
              onClick={() => removeItem(product._id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between rounded-xl bg-white p-5 ring-1 ring-navy/5">
        <div className="text-lg">
          Subtotal: <span className="font-semibold text-navy">{formatINR(subtotal)}</span>
        </div>
        <Button size="lg" onClick={checkout}>
          Proceed to checkout
        </Button>
      </div>
    </div>
  );
}
