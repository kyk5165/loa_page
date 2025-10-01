import React from 'react';
import { Check } from 'lucide-react';

export const Checkbox = ({ 
  checked, 
  onChange, 
  label, 
  className = '',
  disabled = false,
  ...props 
}) => {
  return (
    <label className={`inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        <div className={`w-5 h-5 rounded border-2 transition-all ${
          checked 
            ? 'bg-blue-600 border-blue-600' 
            : 'bg-white border-gray-300 hover:border-blue-400'
        }`}>
          {checked && (
            <Check className="w-4 h-4 text-white absolute top-0 left-0" strokeWidth={3} />
          )}
        </div>
      </div>
      {label && (
        <span className="ml-2 text-sm font-medium text-gray-700">
          {label}
        </span>
      )}
    </label>
  );
};

export default Checkbox;
