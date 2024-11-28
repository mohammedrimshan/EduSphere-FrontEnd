import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Dropdown Menu Wrapper
export function DropdownMenu({ children }) {
  return <div className="relative inline-block">{children}</div>;
}

// Dropdown Menu Trigger Button
export function DropdownMenuTrigger({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none"
    >
      {children}
    </button>
  );
}

// Dropdown Menu Content Wrapper
export function DropdownMenuContent({ isOpen, children }) {
  if (!isOpen) return null;
  return (
    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-20">
      {children}
    </div>
  );
}

// Dropdown Menu Item
export function DropdownMenuItem({ children, onClick }) {
  return (
    <div
      onClick={onClick}
      className="px-4 py-2 cursor-pointer hover:bg-gray-100"
    >
      {children}
    </div>
  );
}
