import { forwardRef } from 'react';

// forwardRef so it drops straight into React Hook Form's register().
const Input = forwardRef(function Input(
  { label, error, id, className = '', ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-navy">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={`rounded-lg border bg-white px-3 py-2 text-navy outline-none transition focus:ring-2 focus:ring-terracotta/20 ${
          error ? 'border-red-400' : 'border-navy/15 focus:border-terracotta'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
});

export default Input;
