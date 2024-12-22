const Badge = ({ children, variant = "default" }) => {
    const variantStyles = {
      default: "bg-gray-100 text-gray-800",
      outline: "border border-gray-300 text-gray-700"
    };
  
    return (
      <span className={`px-2 py-1 rounded text-xs ${variantStyles[variant]}`}>
        {children}
      </span>
    );
  };

  export default Badge