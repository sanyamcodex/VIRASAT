const variants = {
  primary: 'bg-terracotta text-cream hover:bg-terracotta/90',
  secondary: 'bg-navy text-cream hover:bg-navy/90',
  outline: 'border border-navy/20 text-navy hover:bg-navy/5',
  ghost: 'text-navy hover:bg-navy/5',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5',
  lg: 'px-7 py-3 text-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  as: Comp = 'button',
  className = '',
  ...props
}) {
  return (
    <Comp
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
