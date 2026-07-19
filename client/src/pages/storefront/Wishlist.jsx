import { Link } from 'react-router-dom';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCartStore } from '../../store/cartStore';
import { formatINR } from '../../lib/format';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Empty } from '../../components/StateViews';

export default function Wishlist() {
  const { items, remove } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  if (!items.length)
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-display text-4xl text-navy">Wishlist</h1>
        <Empty message="Your wishlist is empty." />
      </div>
    );

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-4xl text-navy">Wishlist</h1>
      <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => (
          <Card key={p._id} polaroid className="flex flex-col">
            <Link to={`/product/${p._id}`}>
              <div className="aspect-[4/5] overflow-hidden rounded-sm bg-navy/5">
                {p.images?.[0]?.url && (
                  <img src={p.images[0].url} alt={p.title} className="h-full w-full object-cover" />
                )}
              </div>
            </Link>
            <Link
              to={`/product/${p._id}`}
              className="mt-3 font-display text-lg text-navy hover:text-terracotta"
            >
              {p.title}
            </Link>
            <div className="font-semibold text-navy">{formatINR(p.price)}</div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" className="flex-1" onClick={() => addItem(p)}>
                Add to cart
              </Button>
              <Button size="sm" variant="outline" onClick={() => remove(p._id)}>
                Remove
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
