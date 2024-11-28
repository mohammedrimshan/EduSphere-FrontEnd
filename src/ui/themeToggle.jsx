import React from 'react';
import { Sun, Moon } from 'lucide-react';
import Button from '../ui/Button';  // Update the import path according to your project structure

const ThemeToggle = ({ theme, onToggle }) => {
  return (
    <div className="relative inline-block">
      <Button
        variant="ghost"
        onClick={onToggle}
        className="relative w-14 h-8 rounded-full bg-slate-200 dark:bg-slate-700 p-1 transition-colors duration-200 ease-in-out"
      >
        <div
          className={`
            absolute top-1 left-1 w-6 h-6 rounded-full 
            transform transition-transform duration-200 ease-in-out
            flex items-center justify-center
            ${theme === 'dark' ? 'translate-x-6 bg-slate-800' : 'translate-x-0 bg-white'}
          `}
        >
          {theme === 'dark' ? (
            <Moon className="h-4 w-4 text-yellow-400" />
          ) : (
            <Sun className="h-4 w-4 text-yellow-500" />
          )}
        </div>
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  );
};

export default ThemeToggle;