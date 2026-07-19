const variants = {
  gi: 'bg-gold text-navy', // "GI Tag"-style verified badge
  verified: 'bg-navy text-cream',
  neutral: 'bg-navy/10 text-navy',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
};

export default function Badge({ variant = 'neutral', className = '', children, ...props }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
