// Temporary stand-in for pages built in later phases (7–9). Keeps the route
// trees navigable without any data fetching.
export default function PagePlaceholder({ title, subtitle }) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="font-display text-3xl text-navy">{title}</h1>
      <p className="mt-2 text-navy/60">{subtitle || 'Coming soon.'}</p>
    </div>
  );
}
