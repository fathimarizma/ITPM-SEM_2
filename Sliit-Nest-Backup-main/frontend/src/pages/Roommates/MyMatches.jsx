import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axiosConfig';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import PublicNavbar from '../../components/Layout/PublicNavbar';
import PublicFooter from '../../components/Layout/PublicFooter';
import { FiCheck, FiX, FiMessageCircle, FiUser, FiMapPin } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const MyMatches = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const [reqRes, matRes] = await Promise.all([
        api.get('/connections/my-requests'),
        api.get('/connections/my-matches')
      ]);
      setRequests(reqRes.data.data);
      setMatches(matRes.data.data);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleRespond = async (connectionId, status) => {
    try {
      await api.put('/connections/respond', { connectionId, status });
      toast.success(`Request ${status} successfully`);
      fetchConnections();
    } catch (error) {
      toast.error('Failed to update request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen font-sans flex flex-col relative overflow-hidden">
        <div className="fixed inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: 'url(/green.jpg)', filter: 'blur(5px)', transform: 'scale(1.1)' }} />
        <div className="fixed inset-0 z-0 bg-[#f3f4f6]/65" />
        <div className="relative z-10 flex flex-col min-h-screen w-full">
          <PublicNavbar activePage="roommates" />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0b2b56]"></div>
          </div>
          <PublicFooter />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans flex flex-col relative overflow-hidden">
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{ 
          backgroundImage: 'url(/green.jpg)', 
          filter: 'blur(5px)',
          transform: 'scale(1.1)' 
        }} 
      />
      <div className="fixed inset-0 z-0 bg-[#f3f4f6]/65" />

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <PublicNavbar activePage="roommates" />
        
        <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-12">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-extrabold text-[#0b2b56] mb-2">My Matches & Requests</h1>
          <p className="text-gray-500 mb-8">Manage your roommate connection requests and active matches.</p>
        </motion.div>

        {/* Incoming Requests Section */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[#1f2937] mb-4 flex items-center gap-2">
            Incoming Requests <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">{requests.length}</span>
          </h2>
          
          {requests.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-gray-100 text-center shadow-sm">
              <p className="text-gray-500">No pending incoming requests.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <AnimatePresence>
                {requests.map((req) => (
                  <motion.div 
                    key={req._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-100 text-[#0b2b56] rounded-full flex items-center justify-center font-bold text-lg">
                        {req.sender.firstName?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <Link to={`#`} className="text-lg font-bold text-[#1f2937] hover:text-[#0b2b56] transition inline-block">
                          {req.sender.firstName} {req.sender.lastName}
                        </Link>
                        <p className="text-xs text-teal-600 font-medium">SLIIT Student</p>
                      </div>
                    </div>
                    {req.post && (
                      <div className="mb-3 px-3 py-2 bg-[#0b2b56]/5 rounded-lg flex items-center gap-2">
                        <FiMapPin className="text-[#0b2b56]" size={14} />
                        <span className="text-xs text-[#1f2937] font-medium">
                          Regarding post in <span className="font-bold text-[#0b2b56]">{req.post.location}</span>
                        </span>
                      </div>
                    )}
                    {req.message && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mb-4 italic">"{req.message}"</p>
                    )}
                    <div className="flex gap-2 mt-auto">
                      <button 
                        onClick={() => handleRespond(req._id, 'accepted')}
                        className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-[#16a34a] text-white rounded-lg font-medium hover:bg-[#15803d] transition"
                      >
                        <FiCheck /> Accept
                      </button>
                      <button 
                        onClick={() => handleRespond(req._id, 'rejected')}
                        className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                      >
                        <FiX /> Reject
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* Active Matches Section */}
        <section>
          <h2 className="text-xl font-bold text-[#1f2937] mb-4 flex items-center gap-2">
            Active Matches <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{matches.length}</span>
          </h2>

          {matches.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-gray-100 text-center shadow-sm">
              <p className="text-gray-500">You don't have any active matches yet.</p>
              <Link to="/roommates" className="text-[#0b2b56] font-bold hover:underline mt-2 inline-block">Find Roommates</Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {matches.map((match) => (
                <motion.div 
                  key={match.connectionId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-5 rounded-xl border-l-4 border-[#16a34a] border-y border-r border-gray-100 shadow-sm flex items-center gap-4"
                >
                  <div className="w-14 h-14 bg-green-50 text-[#16a34a] rounded-full flex items-center justify-center font-bold text-xl">
                    {match.user.firstName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-bold text-[#1f2937]">{match.user.firstName} {match.user.lastName}</p>
                    <p className="text-xs text-gray-500 mb-2">Matched on {new Date(match.matchedAt).toLocaleDateString()}</p>
                    {match.post && (
                      <div className="mb-4 text-xs font-medium text-gray-600 flex items-center gap-1.5">
                        <FiMapPin className="text-gray-400" />
                        Regarding post in <span className="font-bold text-gray-700">{match.post.location}</span>
                      </div>
                    )}
                    <a 
                      href={match.user.phoneNumber ? `https://wa.me/94${match.user.phoneNumber.substring(1)}?text=Hi%20${encodeURIComponent(match.user.firstName)},%20we%20matched%20on%20SLIIT%20Nest!` : '#'}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-[#16a34a] hover:text-[#15803d]"
                      onClick={(e) => { if (!match.user.phoneNumber) e.preventDefault(); }}
                    >
                      <FiMessageCircle /> Chat on WhatsApp
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="w-full mt-auto">
        <PublicFooter />
      </div>
     </div>
    </div>
  );
};

export default MyMatches;
