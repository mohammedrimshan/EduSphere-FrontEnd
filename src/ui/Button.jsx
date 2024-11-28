const Button = ({ children, className, variant, onClick }) => {
  const baseStyle = "px-4 py-2 rounded-full font-medium";
  const variantStyles = {
    default: "bg-green-500 text-white hover:bg-green-600",
    outline: "border border-current hover:bg-white hover:text-gray-900",
  };
  return (
    <button
      className={`${baseStyle} ${
        variantStyles[variant] || variantStyles.default
      } ${className}`}
      onClick={onClick} 
    >
      {children}
    </button>
  );
};

export default Button