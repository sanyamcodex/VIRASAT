import { Link } from 'react-router-dom';

// Category / art-form tile. No image field on Category yet → styled navy panel.
export default function CategoryCard({ category }) {
  return (
    <Link
      to={`/shop?category=${category._id}`}
      className="group relative block overflow-hidden rounded-xl bg-gradient-to-br from-navy to-navy/80 ring-1 ring-navy/10"
    >
      <div className="flex aspect-[3/4] flex-col justify-end p-4">
        <div className="font-display text-xl text-cream group-hover:text-gold">
          {category.name}
        </div>
        <div className="text-xs uppercase tracking-widest text-cream/50">Explore</div>
      </div>
    </Link>
  );
}
