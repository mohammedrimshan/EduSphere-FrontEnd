import React, { useState, useRef, useEffect } from 'react';
import { FaEllipsisV } from 'react-icons/fa';

export function DropdownMenu({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        <FaEllipsisV />
      </div>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export function DropdownMenuTrigger({ children, asChild, ...props }) {
  return <div {...props}>{children}</div>;
}

export function DropdownMenuContent({ children, ...props }) {
  return <div {...props}>{children}</div>;
}

export function DropdownMenuItem({ children, onClick, className = '', ...props }) {
  return (
    <div 
      onClick={onClick}
      className={`cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}