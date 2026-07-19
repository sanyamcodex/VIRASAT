export default function RatingStars({ value = 0, className = '' }) {
  const full = Math.round(value);
  return (
    <span className={`text-gold ${className}`} aria-label={`${value} out of 5`}>
      {'★'.repeat(full)}
      <span className="text-navy/20">{'★'.repeat(5 - full)}</span>
    </span>
  );
}
