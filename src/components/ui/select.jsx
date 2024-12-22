import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const SelectContext = createContext();

export const Select = ({ children, onValueChange, defaultValue }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(defaultValue || '');
  const selectRef = useRef(null);

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleSelectValue = (value) => {
    setSelectedValue(value);
    setIsOpen(false);
    if (onValueChange) {
      onValueChange(value);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <SelectContext.Provider value={{ isOpen, toggleOpen, selectedValue, handleSelectValue }}>
      <div className="relative inline-block text-left" ref={selectRef}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger = ({ children, className = '' }) => {
  const { isOpen, toggleOpen, selectedValue } = useContext(SelectContext);

  return (
    <button
      type="button"
      onClick={toggleOpen}
      className={`inline-flex justify-between items-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${className}`}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
    >
      {selectedValue || children}
      <FaChevronDown className={`ml-2 h-5 w-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
    </button>
  );
};

export const SelectContent = ({ children, className = '' }) => {
  const { isOpen } = useContext(SelectContext);

  if (!isOpen) return null;

  return (
    <div className={`absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg ${className}`}>
      <ul
        className="max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
        role="listbox"
      >
        {children}
      </ul>
    </div>
  );
};

export const SelectItem = ({ children, value, className = '' }) => {
  const { handleSelectValue, selectedValue } = useContext(SelectContext);
  const isSelected = selectedValue === value;

  return (
    <li
      className={`cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white ${
        isSelected ? 'bg-indigo-600 text-white' : 'text-gray-900'
      } ${className}`}
      role="option"
      aria-selected={isSelected}
      onClick={() => handleSelectValue(value)}
    >
      {children}
    </li>
  );
};

export const SelectValue = ({ placeholder }) => {
  const { selectedValue } = useContext(SelectContext);
  return <span>{selectedValue || placeholder}</span>;
};

