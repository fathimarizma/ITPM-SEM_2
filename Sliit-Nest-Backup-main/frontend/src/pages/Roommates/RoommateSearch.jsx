import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { FiSearch, FiFilter, FiMapPin, FiDollarSign, FiUser, FiCalendar } from 'react-icons/fi';
import PublicNavbar from '../../components/Layout/PublicNavbar';
import PublicFooter from '../../components/Layout/PublicFooter';

const RoommateSearch = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters state
  const [filters, setFilters] = useState({
    gender: '',
    minBudget: '',
    maxBudget: '',
    location: '',
    nonSmoker: '',
    studyPreference: '',
    ageCategory: ''
  });

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      const { data } = await api.get(`/roommates?${params.toString()}`);
      setPosts(data);
    } catch (error) {
      console.error('Failed to fetch posts', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredPosts = posts.filter(post => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const fullName = `${post.user?.firstName || ''} ${post.user?.lastName || ''}`.toLowerCase();
    return (
      post.location?.toLowerCase().includes(term) ||
      post.bio?.toLowerCase().includes(term) ||
      fullName.includes(term) ||
      post.genderPreference?.toLowerCase().includes(term) ||
      post.ageCategory?.toLowerCase().includes(term) ||
      (post.budgetRange?.max && post.budgetRange.max.toString().includes(term))
    );
  });

  return (
    <div 
      className="min-h-screen font-sans flex flex-col bg-fixed bg-cover bg-center"
      style={{ backgroundImage: 'linear-gradient(rgba(243, 244, 246, 0.3), rgba(243, 244, 246, 0.4)), url(/sliit.jpg)' }}
    >
      <PublicNavbar activePage="roommates" />

      {/* 2. Sleek Hero Header */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
        className="text-white py-16 px-6 shadow-md relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: 'url(/roommate.jpg)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b2b56]/90 to-[#081f40]/80 z-0"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, type: "spring", stiffness: 100 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Find Your Perfect Roommate</h1>
            <p className="text-lg text-white/80 max-w-2xl mb-8 font-light">
              Connect with fellow SLIIT students based on lifestyle, budget, and habits. Your next great rental journey starts here.
            </p>
            <motion.div className="flex flex-col sm:flex-row gap-4 mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to="/roommates/add" 
                  className="inline-flex items-center justify-center bg-white text-[#0b2b56] font-bold px-8 py-3.5 rounded-lg shadow-xl border border-transparent hover:border-white hover:bg-transparent hover:text-white transition-all duration-300"
                >
                  Post Your Profile
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to="/search" 
                  className="inline-flex items-center justify-center bg-transparent border-2 border-teal-400 text-teal-400 font-bold px-8 py-3.5 rounded-lg shadow-lg hover:bg-teal-400 hover:text-[#0b2b56] transition-all duration-300"
                >
                  Find Boardings
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <div className="container mx-auto max-w-7xl px-4 py-12 flex flex-col md:flex-row gap-8">
        
        {/* Filters Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full md:w-1/4"
        >
          <div className="bg-gradient-to-b from-blue-50/40 to-white/40 backdrop-blur-xl p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/50 sticky top-24 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#0b2b56] via-indigo-600 to-teal-400"></div>
            <div className="flex items-center gap-2 mb-6">
              <FiFilter className="text-[#0b2b56]" size={20} />
              <h2 className="text-xl font-bold text-[#1f2937]">Filters</h2>
            </div>

            <div className="space-y-6">
              {[
                { label: 'Gender', name: 'gender', type: 'select', options: ['Male', 'Female'] },
                { label: 'Age Group', name: 'ageCategory', type: 'select', options: ['18 - 20', '21 - 25', '26 - 30', '31 - 35', '36 - 40', '41 - 50', 'Above 50'] },
                { label: 'Max Budget (LKR)', name: 'maxBudget', type: 'number', placeholder: 'e.g. 15000' },
                { label: 'Location', name: 'location', type: 'text', placeholder: 'e.g. Malabe, Kaduwela' },
                { label: 'Study Habits', name: 'studyPreference', type: 'select', options: ['Quiet', 'Group', 'Flexible'] }
              ].map((field, idx) => (
                <motion.div 
                  key={field.name}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + (idx * 0.1) }}
                >
                  <label className="block text-sm font-semibold text-[#1f2937] mb-2">{field.label}</label>
                  {field.type === 'select' ? (
                    <select 
                      name={field.name} value={filters[field.name]} onChange={handleFilterChange}
                      className="w-full bg-white/40 backdrop-blur-sm text-[#1f2937] text-sm py-3 px-4 rounded-xl border border-white/50 focus:ring-2 focus:ring-[#0b2b56]/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)] outline-none transition"
                    >
                      <option value="">Any</option>
                      {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input 
                      type={field.type} name={field.name} value={filters[field.name]} onChange={handleFilterChange} placeholder={field.placeholder}
                      className="w-full bg-white/40 backdrop-blur-sm text-[#1f2937] text-sm py-3 px-4 rounded-xl border border-white/50 focus:ring-2 focus:ring-[#0b2b56]/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)] outline-none transition"
                    />
                  )}
                </motion.div>
              ))}

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                <label className="flex items-center gap-3 text-sm font-semibold text-[#1f2937] cursor-pointer p-3.5 bg-white/40 backdrop-blur-sm rounded-xl border border-white/50 hover:bg-white/50 shadow-sm transition">
                  <input 
                    type="checkbox" name="nonSmoker" value="true" checked={filters.nonSmoker === 'true'}
                    onChange={(e) => setFilters(prev => ({ ...prev, nonSmoker: e.target.checked ? 'true' : '' }))}
                    className="w-5 h-5 text-[#0b2b56] focus:ring-[#0b2b56] rounded border-gray-300"
                  />
                  Non-Smoker Preferred
                </label>
              </motion.div>
            </div>
            
            <motion.button 
               whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setFilters({ gender: '', minBudget: '', maxBudget: '', location: '', nonSmoker: '', studyPreference: '', ageCategory: '' })}
              className="w-full mt-8 py-3.5 text-sm font-bold bg-white/40 backdrop-blur-sm shadow-[0_4px_10px_rgba(0,0,0,0.03)] rounded-xl text-[#0b2b56] hover:text-white border border-white/50 hover:bg-[#0b2b56]/80 transition-all duration-300"
            >
              Reset Filters
            </motion.button>
          </div>
        </motion.div>

        {/* Results Stream */}
        <div className="w-full md:w-3/4">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-center bg-gradient-to-r from-blue-50/40 to-indigo-50/40 backdrop-blur-xl p-5 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-white/50 gap-4">
            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
              <h2 className="text-xl font-bold text-[#1f2937] whitespace-nowrap">Matched Roommates</h2>
              <div className="text-sm font-medium bg-[#0b2b56]/10 text-[#0b2b56] px-3 py-1 rounded-full shrink-0">
                {filteredPosts.length} Result{filteredPosts.length !== 1 && 's'}
              </div>
            </div>
            
            <div className="relative w-full sm:max-w-md">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by location, bio, budget..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/40 backdrop-blur-sm text-gray-800 text-sm py-3 pl-11 pr-4 rounded-xl border border-white/50 focus:outline-none focus:border-[#0b2b56]/30 focus:ring-4 focus:ring-[#0b2b56]/10 transition shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]"
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded w-full mt-6"></div>
                  </div>
                ))}
              </motion.div>
            ) : filteredPosts.length > 0 ? (
              <motion.div key="results" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPosts.map((post, i) => (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.4, type: "spring", stiffness: 100 }}
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    className="bg-gradient-to-br from-white/95 via-blue-50/90 to-indigo-50/90 backdrop-blur-lg p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.05)] border border-white flex flex-col relative group hover:shadow-[0_20px_40px_rgba(11,43,86,0.12)] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 h-full w-[6px] bg-gradient-to-b from-teal-400 via-blue-500 to-[#0b2b56] opacity-70 group-hover:opacity-100 group-hover:w-2 transition-all duration-300 animate-[pulse_3s_ease-in-out_infinite]"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-teal-400/20 transition-all"></div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-1 bg-gradient-to-r from-[#0b2b56] via-indigo-500 to-teal-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-[shimmer_3s_linear_infinite]">
                          {post.user?.firstName ? `${post.user.firstName} ${post.user.lastName}` : 'Future Roommate 🌟'}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="flex items-center gap-1 text-sm bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-3 py-1 rounded-full border border-blue-200/60 font-medium shadow-sm">
                            <FiMapPin size={13} className="text-teal-500" /> {post.location}
                          </span>
                        </div>
                      </div>
                      <div className="relative group/avatar cursor-pointer shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-tr from-teal-400 to-blue-500 rounded-full blur opacity-40 group-hover/avatar:opacity-80 animate-pulse transition-opacity"></div>
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post._id}`}
                          alt="Avatar" 
                          className="w-16 h-16 rounded-full border-[3px] border-white shadow-md relative z-10 group-hover/avatar:scale-105 transition-transform duration-300 bg-blue-50 overflow-hidden object-cover"
                        />
                      </div>
                    </div>

                    <p className="text-sm text-[#6b7280] line-clamp-3 mb-6 bg-gray-50/80 p-3 rounded-xl border border-gray-100 min-h-[70px]">
                      "{post.bio}"
                    </p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm text-[#1f2937] font-medium">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#0b2b56]"><FiDollarSign /></div>
                        <span>Up to LKR {post.budgetRange.max}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-[#1f2937] font-medium">
                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600"><FiMapPin /></div>
                        <span>{post.location}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-[#1f2937] font-medium">
                        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600"><FiUser /></div>
                        <span>Looking for: {post.genderPreference}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-[#1f2937] font-medium">
                        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600"><FiCalendar /></div>
                        <span>Age: {post.ageCategory || 'Not Specified'}</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-5 border-t border-gray-100 relative z-10">
                      <Link 
                        to={`/roommates/${post._id}`}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#0b2b56] to-indigo-800 shadow-md hover:shadow-[0_8px_20px_rgba(11,43,86,0.3)] text-white font-bold rounded-xl transition-all duration-300 relative overflow-hidden group/btn"
                      >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                        <span className="relative z-10 flex items-center gap-2">View Full Profile</span>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="empty" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100"
              >
                <motion.div 
                  animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
                  className="w-24 h-24 bg-[#0b2b56]/5 text-[#0b2b56] rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <FiSearch size={40} />
                </motion.div>
                <h3 className="text-2xl font-bold text-[#1f2937] mb-3">No profiles matched your criteria</h3>
                <p className="text-[#6b7280]">Try clearing some filters or exploring different options.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};

export default RoommateSearch;
