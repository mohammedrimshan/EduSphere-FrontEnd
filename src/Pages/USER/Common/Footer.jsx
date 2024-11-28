import React from 'react'

function Footer() {
  return (
    <div>
       {/* Footer */}
       <footer className="bg-gray-900 dark:bg-gray-800 text-white py-12">
            <div className="container mx-auto px-4">
              <div className="flex flex-col items-center gap-6">
                <a href="#" className="text-2xl font-bold">
                  EduSphere
                </a>
                <nav className="flex flex-wrap justify-center gap-6">
                  <a href="#" className="hover:text-green-500">
                    Home
                  </a>
                  <a href="#" className="hover:text-green-500">
                    Features
                  </a>
                  <a href="#" className="hover:text-green-500">
                    Benefits
                  </a>
                  <a href="#" className="hover:text-green-500">
                    Courses
                  </a>
                  <a href="#" className="hover:text-green-500">
                    Blogs
                  </a>
                </nav>
              </div>
            </div>
          </footer>
    </div>
  )
}

export default Footer
