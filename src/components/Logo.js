export default function Logo({ size = "md", showText = true }) {
  const sizeClasses = {
    sm: "w-6 h-6 text-sm",
    md: "w-8 h-8 text-sm", 
    lg: "w-10 h-10 text-lg",
    xl: "w-12 h-12 text-xl"
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`${sizeClasses[size]} bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center`}>
        <span className="text-white font-bold">F</span>
      </div>
      {showText && (
        <span className="text-xl font-bold text-gray-900">FinanceTracker</span>
      )}
    </div>
  );
} 