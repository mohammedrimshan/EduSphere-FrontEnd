import React from 'react';

const lessons = [
  {
    id: 1,
    title: "Introduction about XD",
    duration: "30 mins",
    isActive: true
  },
  // Add more lessons as needed
].concat(Array(15).fill(null).map((_, i) => ({
  id: i + 2,
  title: "Introduction about XD",
  duration: "30 mins",
  isActive: false
})));

const courses = [
  {
    id: 1,
    thumbnail: "/placeholder.svg",
    category: "Design",
    duration: "3 Month",
    title: "AWS Certified solutions Architect",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
    instructor: {
      name: "Lina",
      avatar: "/placeholder.svg"
    },
    originalPrice: 100,
    discountedPrice: 80
  },
  // Duplicate the course 3 more times
  ...Array(3).fill(null).map((_, i) => ({
    id: i + 2,
    thumbnail: "/placeholder.svg",
    category: "Design",
    duration: "3 Month",
    title: "AWS Certified solutions Architect",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
    instructor: {
      name: "Lina",
      avatar: "/placeholder.svg"
    },
    originalPrice: 100,
    discountedPrice: 80
  }))
];

const CourseCard = ({ course }) => (
  <div className="flex-none w-72 bg-white rounded-lg shadow-md overflow-hidden">
    <img 
      src={course.thumbnail} 
      alt={course.title}
      className="w-full h-48 object-cover"
    />
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">{course.category}</span>
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {course.duration}
        </div>
      </div>
      
      <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
      <p className="text-gray-600 text-sm mb-4">{course.description}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src={course.instructor.avatar} 
            alt={course.instructor.name}
            className="w-8 h-8 rounded-full mr-2"
          />
          <span className="text-sm">{course.instructor.name}</span>
        </div>
        <div className="text-right">
          <span className="text-gray-400 line-through text-sm mr-2">${course.originalPrice}</span>
          <span className="text-green-500 font-semibold">${course.discountedPrice}</span>
        </div>
      </div>
    </div>
  </div>
);

const PreviewLesson = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-700 text-white p-4 flex justify-between items-center">
        <div className="flex items-center">
          <button className="mr-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-semibold">Learn about Adobe XD & Prototyping</h1>
            <p className="text-sm opacity-80">Introduction about XD</p>
          </div>
        </div>
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>1 hour</span>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-white p-6 min-h-screen">
          <div className="mb-6">
            <h2 className="font-semibold mb-4">Change Simplification</h2>
            {lessons.slice(0, 4).map(lesson => (
              <div key={lesson.id} 
                className={`flex items-center p-3 rounded-lg mb-2 ${lesson.isActive ? 'bg-green-500 text-white' : 'bg-gray-100'}`}>
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm">{lesson.title}</p>
                  <p className="text-xs opacity-80">{lesson.duration}</p>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h2 className="font-semibold mb-4">Lessons</h2>
            {lessons.slice(4).map(lesson => (
              <div key={lesson.id} 
                className="flex items-center p-3 rounded-lg mb-2 bg-gray-100">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm">{lesson.title}</p>
                  <p className="text-xs opacity-80">{lesson.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200">
              <img 
                src="/placeholder.svg" 
                alt="Course video"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">06 Super Coins on the way</h2>
                <div className="flex gap-4">
                  <button className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800">
                    Attend Quiz →
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center">
                    <span>Chat with Tutor</span>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </button>
                </div>
              </div>

              <p className="text-gray-600 mb-8">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>

              {/* Instructor Review */}
              <div className="bg-green-600 text-white p-6 rounded-lg">
                <div className="flex items-start">
                  <img 
                    src="/placeholder.svg" 
                    alt="Rulkin Simons"
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="font-semibold mb-1">Rulkin Simons</h3>
                    <div className="flex mb-2">
                      {[1,2,3,4,5].map(star => (
                        <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm opacity-90">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Student Also Bought Section */}
          <div className="bg-white rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Student also bought</h2>
              <button className="text-blue-500 hover:text-blue-600">See all</button>
            </div>
            
            <div className="flex gap-6 overflow-x-auto pb-4 -mx-2 px-2">
              {courses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewLesson;