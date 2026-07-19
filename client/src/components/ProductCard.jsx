import { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { formatINR } from '../lib/format';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';

// Polaroid-style product card (WeaveHand-inspired layout, VIRASAT branding).
export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);
  const toggle = useWishlistStore((s) => s.toggle);
  const inWishlist = useWishlistStore((s) => s.items.some((i) => i._id === product._id));
  const [broken, setBroken] = useState(false);
  const img = product.images?.[0]?.url;

  return (
    <Card polaroid className="flex flex-col">
      <Link to={`/product/${product._id}`}>
        <div className="aspect-[4/5] overflow-hidden rounded-sm bg-navy/5">
          {img && !broken ? (
            <img
              src={img}
              alt={product.title}
              className="h-full w-full object-cover"
              onError={() => setBroken(true)}
            />
          ) : (
            <div className="grid h-full place-items-center text-sm text-navy/30">
              No image
            </div>
          )}
        </div>
      </Link>

      <div className="mt-3 flex-1">
        {product.featured && (
          <Badge variant="gi" className="mb-1">
            Featured
          </Badge>
        )}
        <Link
          to={`/product/${product._id}`}
          className="block font-display text-lg leading-tight text-navy hover:text-terracotta"
        >
          {product.title}
        </Link>
        {product.artisanProfile?.region && (
          <div className="text-xs text-navy/50">{product.artisanProfile.region}</div>
        )}
        <div className="mt-1 font-semibold text-navy">{formatINR(product.price)}</div>
      </div>

      <div className="mt-3 flex gap-2">
        <Button size="sm" className="flex-1" onClick={() => addItem(product)}>
          Add to cart
        </Button>
        <Button
          size="sm"
          variant="outline"
          aria-label="Toggle wishlist"
          onClick={() =>
            toggle({
              _id: product._id,
              title: product.title,
              price: product.price,
              images: product.images,
            })
          }
        >
          {inWishlist ? '♥' : '♡'}
        </Button>
      </div>
    </Card>
  );
}
