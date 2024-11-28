const Card = ({ children, className }) => {
  return (
    <div className={`bg-white rounded-xl shadow ${className}`}>{children}</div>
  );
};

export default Card