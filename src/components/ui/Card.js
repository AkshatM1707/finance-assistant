export default function Card({ 
  children, 
  className = "", 
  padding = "p-6",
  hover = false,
  ...props 
}) {
  const baseClasses = "bg-card border border-border rounded-xl shadow";
  const hoverClasses = hover ? "hover:shadow-md transition-all duration-200" : "";
  
  return (
    <div className={`${baseClasses} ${padding} ${hoverClasses} ${className}`} {...props}>
      {children}
    </div>
  );
}