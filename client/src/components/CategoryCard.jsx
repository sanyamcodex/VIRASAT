import { useState } from 'react';
import { Link } from 'react-router-dom';

// Category / art-form tile. Shows the category image when present (with a navy
// overlay for text legibility); falls back to a navy gradient panel otherwise.
export default function CategoryCard({ category }) {
  const [broken, setBroken] = useState(false);
  const img = category.image?.url;
  const showImg = img && !broken;

  return (
    <Link
      to={`/shop?category=${category._id}`}
      className="group relative block overflow-hidden rounded-xl ring-1 ring-navy/10"
    >
      <div className="relative aspect-[3/4]">
        {showImg ? (
          <img
            src={img}
            alt={category.name}
            className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-105"
            onError={() => setBroken(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-navy to-navy/80" />
        )}
        {/* Legibility overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col p-4">
          <div className="font-display text-xl text-cream group-hover:text-gold">
            {category.name}
          </div>
          <div className="text-xs uppercase tracking-widest text-cream/60">Explore</div>
        </div>
      </div>
    </Link>
  );
}
