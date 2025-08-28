'use client';

import { forwardRef } from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>((
  { label, error, helperText, className = '', ...props },
  ref
) => {
  return (
    <div className="mb-4">
      <label 
        htmlFor={props.id || props.name} 
        className="block text-sm font-medium text-body-primary mb-2"
      >
        {label}
        {props.required && <span className="text-error ml-1">*</span>}
      </label>
      
      <input
        ref={ref}
        className={`
          w-full px-3 py-2 border rounded-lg shadow-sm transition-colors
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
          disabled:bg-light disabled:text-body-secondary disabled:cursor-not-allowed
          ${error 
            ? 'border-error bg-error/10 text-error placeholder-error'
            : 'border-default bg-surface text-body-primary placeholder-body-secondary'
          }
          ${className}
        `}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-error">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-body-secondary">
          {helperText}
        </p>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;