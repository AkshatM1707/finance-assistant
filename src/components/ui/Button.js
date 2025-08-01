export default function Button({ 
  children, 
  variant = "primary", 
  size = "md", 
  isLoading = false,
  disabled = false,
  className = "",
  ...props 
}) {
  const baseClasses = "font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800";
  
  const variants = {
    primary: "gradient-primary text-white hover:shadow-glow focus:ring-indigo-500 shadow-lg hover:shadow-xl",
    secondary: "bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500 border border-gray-600",
    outline: "border-2 border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white focus:ring-indigo-500",
    ghost: "text-gray-300 hover:text-white hover:bg-gray-700 focus:ring-gray-500",
    success: "gradient-accent text-white hover:shadow-glow focus:ring-green-500 shadow-lg hover:shadow-xl",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-lg hover:shadow-xl",
    warning: "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500 shadow-lg hover:shadow-xl"
  };

  

  const classes = `${baseClasses} ${variants[variant]} ${className}`;

  return (
    <button 
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
} 