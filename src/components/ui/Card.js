export default function Card({ 
  children, 
  className = "", 
  padding = "p-6",
  hover = false,
  ...props 
}) {
  const baseClasses = "gradient-card rounded-2xl shadow-card";
  const hoverClasses = hover ? "hover:shadow-glow transition-all duration-200" : "";
  
  return (
    <div className={`${baseClasses} ${padding} ${hoverClasses} ${className}`} {...props}>
      {children}
    </div>
  );
} 