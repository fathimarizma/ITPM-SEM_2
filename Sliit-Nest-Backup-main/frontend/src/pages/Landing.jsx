import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiStar, FiShield, FiUsers, FiFilter, FiMessageCircle, FiSearch } from 'react-icons/fi';
import PublicNavbar from '../components/Layout/PublicNavbar';
import PublicFooter from '../components/Layout/PublicFooter';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <PublicNavbar activePage="home" />

      {/* 2. Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center text-center px-4 overflow-hidden">
        {/* Background Image & Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')" }}
        ></div>
        {/* Dark Blue Overlay */}
        <div className="absolute inset-0 z-0 bg-[#0b2b56]/85 mix-blend-multiply"></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0b2b56]/90 to-transparent"></div>
        
        <div className="z-10 max-w-4xl flex flex-col items-center mt-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6 tracking-tight">
            Find Your Perfect Boarding<br/>Near SLIIT – Fast, Safe &<br/>Trusted
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl font-light">
            Exclusive platform for SLIIT students – peer reviews, roommate matching, and verified listings near Malabe campus
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link to="/search" className="flex items-center justify-center gap-2 px-8 py-3.5 bg-[#0b2b56] text-white rounded-lg font-medium text-lg hover:bg-[#081f40] transition border border-[#0b2b56]">
              <FiSearch size={20} />
              Search Boardings Now
            </Link>
            <Link to="/roommates" className="flex items-center justify-center gap-2 px-8 py-3.5 bg-transparent border border-white text-white rounded-lg font-medium text-lg hover:bg-white/10 transition">
              <FiUsers size={20} />
              Find a Roommate
            </Link>
          </div>

          {/* Badges */}
          <div className="flex items-center justify-center flex-wrap gap-4 sm:gap-12 text-sm text-white/90">
            <div className="flex items-center gap-2"><FiShield className="text-[#00d084]"/> SLIIT Students Only</div>
            <span className="text-white/40 hidden sm:block">•</span>
            <div className="flex items-center gap-2"><FiStar className="text-[#00d084]"/> Peer Reviews</div>
            <span className="text-white/40 hidden sm:block">•</span>
            <div className="flex items-center gap-2"><FiMessageCircle className="text-[#00d084]"/> Verified Listings</div>
          </div>
        </div>
      </section>

      {/* 3. Problem / Solution Section */}
      <section className="py-24 px-6 md:px-16 container mx-auto bg-white">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Problem */}
          <div className="pr-10">
            <span className="inline-block px-3 py-1 bg-red-50 text-red-500 rounded-full text-xs font-semibold mb-6">The Problem</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0b2b56] mb-6 leading-tight">
              Struggling with scattered Facebook groups, fake listings, and bad roommate matches?
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed">
              Finding accommodation near SLIIT shouldn't be this complicated. Students waste hours searching through unreliable sources.
            </p>
          </div>
          
          {/* Solution */}
          <div>
            <span className="inline-block px-3 py-1 bg-teal-50 text-teal-600 rounded-full text-xs font-semibold mb-6">The Solution</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0b2b56] mb-6">
              SLIIT Nest solves it
            </h2>
            <p className="text-gray-500 text-lg mb-12 leading-relaxed">
              Advanced filters, real student reviews, roommate matching, and easy WhatsApp contact - all in one trusted platform.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-6 rounded-2xl text-center hover:shadow-md transition">
                <FiHome className="text-teal-500 text-2xl mx-auto mb-3" />
                <h3 className="text-xl font-black text-[#0b2b56]">100+</h3>
                <p className="text-xs text-gray-500 font-medium">Listings</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl text-center hover:shadow-md transition">
                <FiStar className="text-teal-500 text-2xl mx-auto mb-3" />
                <h3 className="text-xl font-black text-[#0b2b56]">4.5+</h3>
                <p className="text-xs text-gray-500 font-medium">Average Rating</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl text-center hover:shadow-md transition">
                <FiShield className="text-teal-500 text-2xl mx-auto mb-3" />
                <h3 className="text-xl font-black text-[#0b2b56]">SLIIT</h3>
                <p className="text-xs text-gray-500 font-medium">Exclusive</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl text-center hover:shadow-md transition">
                <FiUsers className="text-teal-500 text-2xl mx-auto mb-3" />
                <h3 className="text-xl font-black text-[#0b2b56]">500+</h3>
                <p className="text-xs text-gray-500 font-medium">Active Students</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section className="py-24 px-6 md:px-16 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0b2b56] mb-4">Everything You Need in One Place</h2>
            <p className="text-gray-500 text-lg">Built specifically for SLIIT students, by SLIIT students</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
               <div className="w-12 h-12 bg-gray-100 text-[#0b2b56] rounded-xl flex items-center justify-center mb-6">
                  <FiFilter size={20} />
               </div>
               <h3 className="text-xl font-bold text-[#0b2b56] mb-3">Advanced Search & Filters</h3>
               <p className="text-gray-500 leading-relaxed text-sm">
                 Find exactly what you need with filters for location near SLIIT, price range, accommodation type (single/shared/hall), and facilities (WiFi, meals, security).
               </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
               <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-6">
                  <FiStar size={20} />
               </div>
               <h3 className="text-xl font-bold text-[#0b2b56] mb-3">Peer Reviews & Ratings</h3>
               <p className="text-gray-500 leading-relaxed text-sm">
                 Only verified SLIIT students can post and read reviews. Get honest feedback from fellow students who've actually lived there.
               </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
               <div className="w-12 h-12 bg-[#0b2b56]/10 text-[#0b2b56] rounded-xl flex items-center justify-center mb-6">
                  <FiUsers size={20} />
               </div>
               <h3 className="text-xl font-bold text-[#0b2b56] mb-3">Roommate Matching</h3>
               <p className="text-gray-500 leading-relaxed text-sm">
                 Create your profile and connect with compatible roommates. Filter by gender, budget, lifestyle habits, and connect instantly via WhatsApp.
               </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
               <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-6">
                  <FiMessageCircle size={20} />
               </div>
               <h3 className="text-xl font-bold text-[#0b2b56] mb-3">Easy & Safe Contact</h3>
               <p className="text-gray-500 leading-relaxed text-sm">
                 Direct WhatsApp integration with light admin moderation. Connect with landlords and roommates without sharing personal info too early.
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section className="py-24 px-6 container mx-auto bg-white text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#0b2b56] mb-4">How It Works</h2>
        <p className="text-gray-500 text-lg mb-20">Get started in just 4 simple steps</p>

        <div className="flex flex-col md:flex-row justify-center items-start gap-8 mb-20 max-w-5xl mx-auto relative">
          
          {/* Step 1 */}
          <div className="flex-1 flex flex-col items-center">
            <h1 className="text-5xl font-black text-teal-100 mb-6 font-mono">01</h1>
            <h3 className="text-lg font-bold text-[#0b2b56] mb-3">Register & Verify</h3>
            <p className="text-sm text-gray-500 px-4 leading-relaxed">Sign up with your SLIIT email address and verify your student status</p>
          </div>
          
          <div className="hidden md:block w-16 border-t-2 border-gray-100 mt-6 relative"></div>
          
          {/* Step 2 */}
          <div className="flex-1 flex flex-col items-center">
            <h1 className="text-5xl font-black text-teal-100 mb-6 font-mono">02</h1>
            <h3 className="text-lg font-bold text-[#0b2b56] mb-3">Search & Filter</h3>
            <p className="text-sm text-gray-500 px-4 leading-relaxed">Browse boardings or roommates using our advanced filters</p>
          </div>
          
          <div className="hidden md:block w-16 border-t-2 border-gray-100 mt-6 relative"></div>

          {/* Step 3 */}
          <div className="flex-1 flex flex-col items-center">
            <h1 className="text-5xl font-black text-teal-100 mb-6 font-mono">03</h1>
            <h3 className="text-lg font-bold text-[#0b2b56] mb-3">Read Reviews</h3>
            <p className="text-sm text-gray-500 px-4 leading-relaxed">Check real peer reviews and preview all the details you need</p>
          </div>
          
          <div className="hidden md:block w-16 border-t-2 border-gray-100 mt-6 relative"></div>

          {/* Step 4 */}
          <div className="flex-1 flex flex-col items-center">
            <h1 className="text-5xl font-black text-teal-100 mb-6 font-mono">04</h1>
            <h3 className="text-lg font-bold text-[#0b2b56] mb-3">Connect & Move In</h3>
            <p className="text-sm text-gray-500 px-4 leading-relaxed">Contact directly via WhatsApp and secure your new home!</p>
          </div>
        </div>

        <Link to="/register" className="inline-flex items-center justify-center px-10 py-3.5 bg-[#0b2b56] text-white rounded-lg font-bold hover:bg-[#081f40] transition shadow-md">
          Get Started Now
        </Link>
      </section>
      <PublicFooter />
    </div>
  );
};

export default Landing;
