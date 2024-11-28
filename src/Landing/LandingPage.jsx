import React, { useState, useEffect } from "react";
import {
  Star,
  ChevronRight,
  ChevronLeft,
  Monitor,
  Palette,
  Database,
  Briefcase,
  User,
  ArrowRight,
} from "lucide-react";
import Banner from "../assets/Banner.svg";
import Office from "../assets/Office.svg";
import Graphics from "../assets/grapics.jpg";
import SQL from "../assets/SQL.jpg";
import HTML from "../assets/HTML.png";
import MONGO from "../assets/MONGODB.png";
import USER1 from "../assets/User1.jpg";
import Tutor from "../assets/Tutor.svg";
import Student from "../assets/Student.svg";
import Banner2 from "../assets/Banner2.svg";
import { useNavigate } from "react-router-dom";
import Button from '../ui/Button'
import Card from '../ui/Card'
import LoadingPage from "../ui/Loading";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();  

  const handleRegister = () => {
    navigate("/user/register");  
  };

  const handleLogin =()=>{
    navigate('/user/login')
  }

  const handleTutor =()=>{
    navigate('/tutor/tutor-login')
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingPage />;
  }
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center px-4">
          <a
            className="flex items-center gap-2 font-bold text-2xl text-green-500"
            href="#"
          >
            EduSphere
          </a>
          <nav className="ml-auto flex gap-6">
            <a className="text-sm font-medium hover:text-green-500" href="#">
              Home
            </a>
            <a className="text-sm font-medium hover:text-green-500" href="#">
              About Us
            </a>
            <a className="text-sm font-medium hover:text-green-500" href="#">
              Contact
            </a>
            <a className="text-sm font-medium hover:text-green-500" href="#">
              Courses
            </a>
            <a className="text-sm font-medium hover:text-green-500" href="#">
              Tutors
            </a>
          </nav>
          <Button className="ml-6" onClick={handleLogin}>LOGIN</Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl font-bold leading-tight">
                You bring the <span className="text-green-500">expertise</span>,
                we'll make it unforgettable.
              </h1>
              <p className="text-gray-600 text-lg max-w-md">
                Using highly personalised activities, videos and animations you
                can energize your students and motivate them to achieve their
                learning goals as they progress through a journey.
              </p>
              <div className="flex gap-4">
                <Button variant="outline" onClick={handleRegister}>Register</Button>
                <Button onClick={handleLogin}>LOGIN</Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-full filter blur-3xl opacity-20"></div>
              <img
                alt="Professional teacher"
                className="relative rounded-3xl"
                src={Banner}
                width={600}
                height={600}
              />
            </div>
          </div>
        </section>

{/* Categories Section */}
<section className="bg-gray-50 py-20">
  <div className="container mx-auto px-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="flex items-center justify-center gap-4 p-6 bg-white rounded-xl shadow-sm">
        <Monitor className="h-10 w-10 text-blue-500" /> 
        <div className="text-center"> 
          <h3 className="font-semibold text-lg">Web Development</h3> 
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 p-6 bg-white rounded-xl shadow-sm">
        <Palette className="h-10 w-10 text-purple-500" />
        <div className="text-center"> 
          <h3 className="font-semibold text-lg">User Experience</h3> 
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 p-6 bg-white rounded-xl shadow-sm">
        <Database className="h-10 w-10 text-green-500" />
        <div className="text-center">
          <h3 className="font-semibold text-lg">Marketing</h3> 
        </div>
      </div>
    </div>
  </div>
</section>

        {/* About Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="space-y-12">
            <div className="space-y-4">
              <span className="text-green-500 font-medium">About Us</span>
              <h2 className="text-4xl font-bold">
                eLearning providing the best opportunities to the students
                around the globe.
              </h2>
            </div>
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="flex justify-start">
                <img
                  alt="Office space"
                  className="rounded-xl"
                  src={Office}
                  width={500}
                  height={300}
                />
              </div>
              <div className="flex justify-start">
                <p className="text-gray-600">
                  Install our top-rated dropshipping app to your e-commerce site
                  and get access to US Suppliers, AliExpress vendors, and the
                  best dropshipping and custom products. Start selling the right
                  products to the customer base that you know best.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/*contact us*/}

        <div
          className="relative bg-cover bg-center rounded-lg overflow-hidden"
          style={{
            backgroundImage:`url(${Banner2})`,
            height: "300px",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-center">
            <div className="text-white space-y-4 px-6">
              <h2 className="text-3xl font-bold">
                Join Us by Creating Account or Start a Free Trial
              </h2>
              <p className="text-lg">
                Install our top-rated dropshipping app to your e-commerce site
                and get access to US Suppliers, AliExpress vendors, and the best
                dropshipping and custom products.
              </p>
              <button className="bg-gray-800 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors duration-200">
                Contact Us
              </button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <h3 className="text-4xl font-bold">250+</h3>
              <p className="text-gray-600">Courses by our best mentors</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl font-bold">1000+</h3>
              <p className="text-gray-600">Courses by our best mentors</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl font-bold">15+</h3>
              <p className="text-gray-600">Courses by our best mentors</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl font-bold">2400+</h3>
              <p className="text-gray-600">Courses by our best mentors</p>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="container mx-auto px-4 py-20">
          <div className="space-y-12">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Top Categories</h2>
              <a href="#" className="text-green-500 hover:underline">
                See All
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 space-y-4 flex flex-col items-center justify-center">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Palette className="h-6 w-6 text-green-500" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold">Design</h3>
                  <p className="text-sm text-gray-600">11 Courses</p>
                </div>
              </Card>
              <Card className="p-6 space-y-4 flex flex-col items-center justify-center">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Monitor className="h-6 w-6 text-blue-500" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold">Development</h3>
                  <p className="text-sm text-gray-600">11 Courses</p>
                </div>
              </Card>
              <Card className="p-6 space-y-4 flex flex-col items-center justify-center">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Database className="h-6 w-6 text-purple-500" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold">Development</h3>
                  <p className="text-sm text-gray-600">11 Courses</p>
                </div>
              </Card>
              <Card className="p-6 space-y-4 flex flex-col items-center justify-center">
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-orange-500" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold">Business</h3>
                  <p className="text-sm text-gray-600">11 Courses</p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Course Cards */}
        <section className="container mx-auto px-4 py-20">
          <div className="space-y-12">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Best Seller Courses</h2>
              <a href="#" className="text-green-500 hover:underline">
                See All
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Beginner's Guide to Design",
                  image: Graphics,
                  price: "$149.9",
                  instructor: "Ronald Richards",
                  duration: "22 Total Hours, 155 Lectures, Beginner",
                  ratings: 1200,
                },
                {
                  title: "Beginner's Guide to HTML",
                  image: HTML,
                  price: "$149.9",
                  instructor: "Ronald Richards",
                  duration: "22 Total Hours, 155 Lectures, Beginner",
                  ratings: 1200,
                },
                {
                  title: "MongoDB Essentials",
                  image: MONGO,
                  price: "$149.9",
                  instructor: "Ronald Richards",
                  duration: "22 Total Hours, 155 Lectures, Beginner",
                  ratings: 1200,
                },
                {
                  title: "SQL Masterclass",
                  image: SQL,
                  price: "$149.9",
                  instructor: "Ronald Richards",
                  duration: "22 Total Hours, 155 Lectures, Beginner",
                  ratings: 1200,
                },
              ].map((course, index) => (
                <Card key={index} className="overflow-hidden">
                  <img
                    alt={course.title}
                    className="w-full h-48 object-cover"
                    src={course.image}
                  />
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold">{course.title}</h3>
                    <p className="text-sm text-gray-600">
                      by {course.instructor}
                    </p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                      <span className="text-sm text-gray-600">
                        ({course.ratings})
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{course.duration}</p>
                    <p className="font-bold text-green-500">{course.price}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <div className="space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">
                  What Our Customer Say About Us
                </h2>
              </div>
              <div className="relative">
                <div className="flex gap-6 overflow-hidden">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="min-w-[300px] p-6 space-y-4">
                      <p className="text-gray-600 italic">
                        "Every e best courses are top-notch! An awesome working
                        tool worth I appreciate the up-to-date working tool
                        worth I appreciate the up-to-date"
                      </p>
                      <div className="flex items-center gap-4">
                        <img
                          alt="Jane Doe"
                          className="rounded-full"
                          height="48"
                          src={USER1}
                          width="48"
                        />
                        <div>
                          <h4 className="font-semibold">Jane Doe</h4>
                          <p className="text-sm text-gray-600">Student</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                <button className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg">
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Sections1 */}

        <div className="max-w-7xl mx-auto px-4 py-12 space-y-24">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 order-2 md:order-1">
              <div className="inline-block">
                <p className="text-green-500 font-semibold">Join Us</p>
              </div>
              <h2 className="text-3xl font-bold">Become an Instructor</h2>
              <p className="text-gray-600">
                Instructors from around the world teach millions of students on
                Byway. We provide the tools and skills to teach what you love.
              </p>
              <button onClick={handleTutor} className="group bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors duration-200 flex items-center">
                Start Your Instructor Journey
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="relative order-1 md:order-2">
              <div className="absolute inset-0 bg-purple-200 rounded-[2.5rem] transform -rotate-6" />
              <img
                alt="Instructor"
                className="relative rounded-[2.5rem] w-full object-cover"
                height={500}
                src={Tutor}
                width={500}
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-100 rounded-[2.5rem] transform rotate-6" />
              <img
                alt="Student"
                className="relative rounded-[2.5rem] w-full object-cover"
                height={500}
                src={Student}
                width={500}
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">
                Transform your life through education
              </h2>
              <p className="text-gray-600">
                Learners around the world are launching new careers, advancing
                in their fields, and enriching their lives.
              </p>
              <button className="group bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors duration-200 flex items-center">
                Checkout Courses
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <section className="bg-gray-900 text-white py-20">
          <div className="container mx-auto px-4 text-center space-y-6">
            <h2 className="text-3xl font-bold">
              Join Us by Creating Account or Start a Free Trial
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Install our top-rated dropshipping app to your e-commerce site and
              get access to US Suppliers, AliExpress vendors, and the best
              dropshipping and custom products.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleRegister}>Register</Button>
              <Button variant="outline" className="text-white border-white">
                Contact Us
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-6">
            <a href="#" className="text-2xl font-bold">
              EduSphere
            </a>
            <nav className="flex gap-6">
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
              <a href="#" className="hover:text-green-500">
                Login
              </a>
            </nav>
            <div className="flex gap-4">
              <a href="#" className="hover:text-green-500">
                <span className="sr-only">Twitter</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
