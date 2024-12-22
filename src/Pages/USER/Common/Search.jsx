import React from 'react';
import { Link } from 'react-router-dom';

const SearchResults = ({ results, onClose }) => {
  if (results.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 max-h-96 overflow-y-auto z-50">
      {results.map((course) => (
        <Link
          key={course._id}
          to={`/user/course/${course._id}`}
          className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          onClick={onClose}
        >
          <img
            src={course.course_thumbnail}
            alt={course.title}
            className="h-16 w-24 object-cover rounded"
          />
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 dark:text-white">
              {course.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {course.tutor.name} • {course.category.name}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-yellow-400">★</span>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {course.average_rating.toFixed(1)}
              </span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                ${course.price}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};
