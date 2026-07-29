// Generic surface. `polaroid` gives the WeaveHand-style white-framed photo card
// (extra bottom padding + subtle lift) used for product / story cards.
export default function Card({ polaroid = false, className = '', children, ...props }) {
  return (
    <div
      className={`bg-white ring-1 ring-navy/5 ${
        polaroid
          ? 'rounded-card p-3 pb-5 shadow-polaroid transition duration-300 ease-out hover:-translate-y-1 hover:shadow-lg'
          : 'rounded-card shadow-sm'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
