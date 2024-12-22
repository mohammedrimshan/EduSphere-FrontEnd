import React, { useState, useEffect } from "react";
import { Star, ChevronRight, ChevronLeft, Monitor, Palette, Database, Briefcase, User, ArrowRight, Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import CourseSections from "./CourseCard";
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

  const navigationLinks = [
    { href: "#", label: "Home" },
    { href: "/user/aboutus", label: "About Us" },
    { href: "/user/contact", label: "Contact" },

  ];

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
          
          {/* Mobile Menu */}
          <div className="md:hidden ml-auto flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4">
                  {navigationLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="block px-2 py-1 text-lg hover:text-green-500"
                    >
                      {link.label}
                    </a>
                  ))}
                  <div className="mt-4 space-y-2">
                    <Button onClick={handleLogin} className="w-full">
                      LOGIN
                    </Button>
                    <Button onClick={handleRegister} variant="outline" className="w-full">
                      Register
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Navigation */}
          <nav className="ml-auto hidden md:flex gap-6">
            {navigationLinks.map((link) => (
              <a
                key={link.label}
                className="text-sm font-medium hover:text-green-500"
                href={link.href}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <Button className="ml-6 hidden md:inline-flex" onClick={handleLogin}>
            LOGIN
          </Button>
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
              <CourseSections />
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
      {/* Company Info */}
      <div className="space-y-4">
        <a href="#" className="text-2xl font-bold block">
          EduSphere
        </a>
        <p className="text-gray-400 text-sm">
          Empowering learners worldwide with quality education and innovative teaching methods.
        </p>
      </div>

      {/* Quick Links */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Quick Links</h3>
        <nav className="flex flex-col space-y-2">
          <a href="#" className="hover:text-green-500 text-gray-400">Home</a>
          <a href="#" className="hover:text-green-500 text-gray-400">Features</a>
          <a href="#" className="hover:text-green-500 text-gray-400">Benefits</a>
          <a href="#" className="hover:text-green-500 text-gray-400">Courses</a>
        </nav>
      </div>

      {/* Support */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Support</h3>
        <nav className="flex flex-col space-y-2">
          <a href="#" className="hover:text-green-500 text-gray-400">Help Center</a>
          <a href="#" className="hover:text-green-500 text-gray-400">Terms of Service</a>
          <a href="#" className="hover:text-green-500 text-gray-400">Privacy Policy</a>
          <a href="#" className="hover:text-green-500 text-gray-400">Contact Us</a>
        </nav>
      </div>

      {/* Contact Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Contact Info</h3>
        <div className="flex flex-col space-y-2 text-gray-400">
          <p>Email: info@edusphere.com</p>
          <p>Phone: (123) 456-7890</p>
          <p>Address: 123 Education St, Learning City, 12345</p>
        </div>
      </div>
    </div>

    {/* Bottom Bar */}
    <div className="pt-8 mt-8 border-t border-gray-800">
      <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <p className="text-sm text-gray-400">
          © 2024 EduSphere. All rights reserved.
        </p>
        <div className="flex space-x-6">
          <a href="#" className="text-gray-400 hover:text-green-500">
            <span className="sr-only">Facebook</span>
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
            </svg>
          </a>
          <a href="#" className="text-gray-400 hover:text-green-500">
            <span className="sr-only">Twitter</span>
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
            </svg>
          </a>
          <a href="#" className="text-gray-400 hover:text-green-500">
            <span className="sr-only">LinkedIn</span>
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </div>
</footer>
    </div>
  );
}

