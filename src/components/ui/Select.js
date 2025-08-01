import { useState, useRef, useEffect } from 'react';

export default function Select({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  required = false,
  error,
  className = "",
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-200 mb-2">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-left ${
            error ? 'border-red-500 focus:ring-red-500' : ''
          } ${isOpen ? 'ring-2 ring-indigo-500 border-transparent' : ''}`}
          {...props}
        >
          <span className={selectedOption ? 'text-white' : 'text-gray-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg 
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-xl shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors ${
                  value === option.value ? 'bg-indigo-600 text-white' : 'text-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
} 