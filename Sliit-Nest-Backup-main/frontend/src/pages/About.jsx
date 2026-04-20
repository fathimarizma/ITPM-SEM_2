import React from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiUsers, FiCode, FiHeart } from 'react-icons/fi';
import PublicNavbar from '../components/Layout/PublicNavbar';
import PublicFooter from '../components/Layout/PublicFooter';

const About = () => {
  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col pt-16 md:pt-0">
      <PublicNavbar activePage="about" />

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-[#0b2b56] text-white py-20 px-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b2b56]/90 to-[#081f40] z-0"></div>
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-extrabold mb-4"
          >
            About SLIIT Nest
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-teal-400 font-semibold mb-6"
          >
            Your Ultimate Student Housing & Roommate Partner
          </motion.p>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-white/80 max-w-3xl mx-auto leading-relaxed"
          >
            Finding the perfect place to stay while balancing studies and work shouldn't be a struggle. SLIIT Nest was born out of a simple mission: to simplify the accommodation hunt for the SLIIT student community.
          </motion.p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto max-w-5xl px-4 py-16 flex-1 space-y-16">
        
        {/* Mission Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center text-2xl shadow-sm">
              <FiHeart />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1f2937]">Why We Built This?</h2>
          </div>
          <p className="text-[#4b5563] text-lg leading-relaxed">
            We understand that a "boarding place" is more than just a room—it’s where you study for exams, collaborate on projects, and build lifelong friendships. That’s why we’ve built a dedicated platform that bridges the gap between students and quality housing providers.
          </p>
        </motion.section>

        {/* What We Offer */}
        <section>
          <h2 className="text-3xl font-bold text-[#1f2937] text-center mb-10">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Verified Boarding Listings", desc: "Explore a curated list of accommodation options located conveniently around the SLIIT campus." },
              { title: "Smart Roommate Matching", desc: "Our unique Roommate Finder & Social Matching module helps you find companions who share your lifestyle, habits, and interests." },
              { title: "Student-Centric Design", desc: "Built by students, for students. We prioritize ease of use, transparency, and security in every listing." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="text-teal-500 mb-4 bg-teal-50 w-12 h-12 flex items-center justify-center rounded-xl text-xl">
                  <FiCheckCircle />
                </div>
                <h3 className="text-xl font-bold text-[#1f2937] mb-3">{feature.title}</h3>
                <p className="text-[#6b7280] leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section>
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-full mb-4">
              <FiUsers size={32} />
            </div>
            <h2 className="text-3xl font-bold text-[#1f2937] mb-4">Meet the Development Team</h2>
            <p className="text-[#6b7280] max-w-2xl mx-auto">
              SLIIT Nest is conceptualized and built by a dedicated team of student developers from SLIIT, committed to providing modern solutions for student housing challenges.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {["Chamudi Tharuka", "Fathima Rizma", "Sasanka Bandara", "Dasun Wasala"].map((name, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center hover:scale-105 transition-transform"
              >
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#0b2b56] to-indigo-800 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 shadow-md">
                  {name.charAt(0)}
                </div>
                <h4 className="font-bold text-[#1f2937]">{name}</h4>
                <p className="text-xs text-[#6b7280] mt-1">Full Stack Developer</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Technology Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-[#0b2b56] to-indigo-900 rounded-3xl p-8 md:p-12 text-center text-white"
        >
          <div className="text-teal-400 mb-6 flex justify-center">
            <FiCode size={48} />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Technology</h2>
          <h3 className="text-xl font-medium text-teal-400 mb-4">Powered by SLIIT Nest</h3>
          <p className="text-white/80 max-w-3xl mx-auto leading-relaxed text-lg">
            Developed using the MERN Stack (MongoDB, Express.js, React, Node.js) to ensure high performance, scalability, and a seamless user experience.
          </p>
        </motion.section>
        
      </div>

      <PublicFooter />
    </div>
  );
};

export default About;
