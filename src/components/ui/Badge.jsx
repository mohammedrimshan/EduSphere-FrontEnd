import * as React from "react"
import PropTypes from "prop-types";

export const Badge = ({ text, variant = "default", className = "" }) => {
  const badgeClass = `
    inline-block px-3 py-1 text-sm font-semibold rounded-full
    ${
      variant === "primary"
        ? "bg-blue-500 text-white"
        : variant === "success"
        ? "bg-green-500 text-white"
        : variant === "danger"
        ? "bg-red-500 text-white"
        : "bg-gray-200 text-gray-700"
    }
    ${className}
  `;

  return <span className={badgeClass}>{text}</span>;
};

Badge.propTypes = {
  text: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(["default", "primary", "success", "danger"]),
  className: PropTypes.string,
};

export default Badge;
