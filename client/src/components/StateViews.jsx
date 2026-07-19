export const Loader = ({ label = 'Loading…' }) => (
  <div className="py-16 text-center text-navy/50">{label}</div>
);

export const ErrorState = ({ message }) => (
  <div className="py-16 text-center text-red-500">
    {message || 'Something went wrong.'}
  </div>
);

export const Empty = ({ message }) => (
  <div className="py-16 text-center text-navy/50">{message || 'Nothing here yet.'}</div>
);
