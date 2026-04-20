import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { motion } from 'framer-motion';
import { FiMapPin, FiDollarSign, FiUser, FiInfo, FiLock, FiMessageCircle, FiArrowLeft, FiEdit2, FiTrash2, FiUserPlus, FiClock } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import PublicNavbar from '../../components/Layout/PublicNavbar';
import PublicFooter from '../../components/Layout/PublicFooter';

const RoommateProfile = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('none');
  const [isSender, setIsSender] = useState(false);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await api.get(`/roommates/${id}`);
        setPost(data);

        // If user logged in and it's not their own profile, fetch connection status
        const isSelf = user && (user._id === data.user?._id || user.id === data.user?._id);
        
        if (user && !isSelf) {
          setConnectionLoading(true);
          try {
            const statusRes = await api.get(`/connections/status/${data.user._id}/${data._id}`);
            if (statusRes.data.success) {
              setConnectionStatus(statusRes.data.status);
              setIsSender(statusRes.data.isSender);
            }
          } catch (statusError) {
            console.error('Error fetching connection status', statusError);
          } finally {
            setConnectionLoading(false);
          }
        } else if (isSelf) {
          setConnectionStatus('self');
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, user]);

  const handleSendRequest = async () => {
    if (isSending) return;
    setIsSending(true);
    try {
      await api.post('/connections/send', { receiverId: post.user?._id || post.user?.id, postId: id });
      setConnectionStatus('pending');
      setIsSender(true);
      toast.success('Connection request sent!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    } finally {
      setIsSending(false);
    }
  };

  const isVerified = user?.isVerified;

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

  if (!post) {
    return (
      <div className="min-h-screen font-sans flex flex-col relative overflow-hidden">
        <div className="fixed inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: 'url(/green.jpg)', filter: 'blur(5px)', transform: 'scale(1.1)' }} />
        <div className="fixed inset-0 z-0 bg-[#f3f4f6]/65" />
        <div className="relative z-10 flex flex-col min-h-screen w-full">
          <PublicNavbar activePage="roommates" />
          <div className="flex-1 flex items-center justify-center flex-col">
            <h2 className="text-2xl font-bold text-[#1f2937] mb-2">Profile Not Found</h2>
            <Link to="/roommates" className="text-[#0b2b56] hover:underline">Back to Search</Link>
          </div>
          <PublicFooter />
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this roommate profile?')) {
      try {
        await api.delete(`/roommates/${id}`);
        navigate('/roommates');
      } catch (error) {
        console.error('Failed to delete post:', error);
        alert('Failed to delete profile');
      }
    }
  };

  return (
    <div className="min-h-screen font-sans flex flex-col relative overflow-hidden">
      {/* Blurred Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{ 
          backgroundImage: 'url(/green.jpg)', 
          filter: 'blur(5px)',
          transform: 'scale(1.1)' 
        }} 
      />
      {/* Content overlay to retain readability */}
      <div className="fixed inset-0 z-0 bg-[#f3f4f6]/65" />

      {/* Main Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <PublicNavbar activePage="roommates" />
        <div className="max-w-4xl mx-auto py-12 px-4 flex-1 w-full">
          <Link to="/roommates" className="inline-flex items-center text-[#6b7280] hover:text-[#0b2b56] mb-6 transition font-medium">
            <FiArrowLeft className="mr-2" /> Back to Search
          </Link>
        
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden relative">
          
          {/* Header Area */}
          <div className="bg-[#0b2b56] pt-12 pb-24 px-8 text-center relative">
             <div className="absolute top-4 right-4 bg-white/20 px-3 py-1 rounded-full text-white text-xs font-semibold backdrop-blur-sm">
               Student Post
             </div>
          </div>
          
          <div className="px-8 pb-12 relative -mt-16">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
              <div className="bg-white p-2 rounded-full shadow-lg">
                <div className="w-28 h-28 bg-[#f3f4f6] text-[#0b2b56] rounded-full flex items-center justify-center font-bold text-4xl border-4 border-[#0b2b56]">
                  {post.user?.firstName ? post.user.firstName.charAt(0).toUpperCase() : 'U'}
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-extrabold text-[#1f2937] mb-1">{post.user?.firstName ? `${post.user.firstName} ${post.user.lastName}` : 'Future Roommate 🌟'}</h1>
                <div className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                  {post.user?.isVerified ? '✓ SLIIT Verified' : 'Unverified Identity'}
                </div>
              </div>
              <div className="shrink-0 flex gap-3">
                {user && post.user && (user._id === post.user._id || user.id === post.user._id) ? (
                  <>
                    <button 
                      onClick={() => navigate(`/roommates/edit/${post._id}`)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold shadow-md transition bg-blue-100 text-[#0b2b56] hover:bg-blue-200"
                    >
                      <FiEdit2 size={20} />
                      Edit
                    </button>
                    <button 
                      onClick={handleDelete}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold shadow-md transition bg-red-100 text-red-600 hover:bg-red-200"
                    >
                      <FiTrash2 size={20} />
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                     {connectionLoading ? (
                        <div className="h-12 w-32 bg-gray-200 rounded-lg animate-pulse" />
                     ) : !isVerified ? (
                       <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold shadow-md transition bg-gray-300 text-gray-500 cursor-not-allowed">
                          <FiLock size={20} /> Verify to Connect
                       </button>
                     ) : connectionStatus === 'accepted' ? (
                        <a 
                          href={post.whatsappNumber ? `https://wa.me/94${post.whatsappNumber.substring(1)}?text=Hi%20${encodeURIComponent(post.user?.firstName || 'there')},%20I%20saw%20your%20roommate%20profile%20on%20SLIIT%20Nest!` : '#'}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold shadow-md transition bg-[#16a34a] text-white hover:bg-[#15803d]"
                        >
                          <FiMessageCircle size={20} />
                          Chat on WhatsApp
                        </a>
                     ) : connectionStatus === 'pending' ? (
                        <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold shadow-md transition bg-yellow-100 text-yellow-700 cursor-not-allowed border border-yellow-200">
                          <FiClock size={20} />
                          {isSender ? 'Request Sent' : 'Request Received'}
                        </button>
                     ) : (
                        <button 
                          onClick={handleSendRequest}
                          disabled={isSending}
                          className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold shadow-md transition ${isSending ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-[#0b2b56] text-white hover:bg-[#081f40]'}`}
                        >
                          {isSending ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                              Sending...
                            </>
                          ) : (
                            <>
                              <FiUserPlus size={20} />
                              Send Connect Request
                            </>
                          )}
                        </button>
                     )}
                  </>
                )}
              </div>
            </div>

            <div className={`grid md:grid-cols-3 gap-8 ${!isVerified ? 'filter blur-sm select-none' : ''}`}>
              <div className="md:col-span-2 space-y-8">
                <section>
                  <h3 className="text-lg font-bold text-[#1f2937] mb-3 flex items-center gap-2">
                    <FiInfo className="text-[#0b2b56]" /> About Me
                  </h3>
                  <p className="text-[#6b7280] leading-relaxed">
                    {post.bio}
                  </p>
                </section>
                
                <section>
                  <h3 className="text-lg font-bold text-[#1f2937] mb-4">Preferences</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#f3f4f6] p-4 rounded-xl">
                      <p className="text-xs text-gray-500 font-semibold mb-1 uppercase">Gender</p>
                      <p className="text-[#1f2937] font-medium">{post.genderPreference}</p>
                    </div>
                    <div className="bg-[#f3f4f6] p-4 rounded-xl">
                      <p className="text-xs text-gray-500 font-semibold mb-1 uppercase">Study Habits</p>
                      <p className="text-[#1f2937] font-medium">{post.habits?.studyPreference || 'N/A'}</p>
                    </div>
                    <div className="bg-[#f3f4f6] p-4 rounded-xl">
                      <p className="text-xs text-gray-500 font-semibold mb-1 uppercase">Smoking</p>
                      <p className="text-[#1f2937] font-medium">{post.habits?.nonSmoker ? 'Non-smoker strictly' : 'No preference'}</p>
                    </div>
                    <div className="bg-[#f3f4f6] p-4 rounded-xl">
                      <p className="text-xs text-gray-500 font-semibold mb-1 uppercase">Age Group</p>
                      <p className="text-[#1f2937] font-medium">{post.ageCategory || 'N/A'}</p>
                    </div>
                  </div>
                </section>
              </div>

              <div className="bg-[#f8fafc] border border-gray-100 p-6 rounded-2xl h-fit">
                <h3 className="text-lg font-bold text-[#1f2937] mb-4">Quick Highlights</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-[#0b2b56]">
                      <FiDollarSign size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Budget Range</p>
                      <p className="text-[#1f2937] font-bold">LKR {post.budgetRange.min} - {post.budgetRange.max}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-teal-100 p-2 rounded-lg text-teal-600">
                      <FiMapPin size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Location Ref</p>
                      <p className="text-[#1f2937] font-bold">{post.location}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                      <FiUser size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Looking For</p>
                      <p className="text-[#1f2937] font-bold">{post.genderPreference} Roommate</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Unverified Overlay */}
            {!isVerified && (
              <div className="absolute inset-x-8 bottom-0 top-48 z-10 flex flex-col items-center justify-center py-20 bg-gradient-to-t from-white/90 via-white/80 to-transparent">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 text-center max-w-sm"
                >
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                    <FiLock size={28} />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full animate-ping"></div>
                  </div>
                  <h3 className="text-xl font-bold text-[#1f2937] mb-2">Private Content</h3>
                  <p className="text-gray-500 text-sm mb-6">
                    Verify your <span className="font-semibold text-teal-600">@my.sliit.lk</span> email to unlock features and view complete roommate details securely.
                  </p>
                  <Link 
                    to="/verify-email" 
                    className="block w-full py-3 bg-[#0b2b56] text-white font-bold rounded-lg hover:bg-opacity-90 transition"
                  >
                    Verify Account Now
                  </Link>
                </motion.div>
              </div>
            )}
            
          </div>
        </div>
      </div>
      <div className="w-full mt-auto">
        <PublicFooter />
      </div>
     </div>
    </div>
  );
};

export default RoommateProfile;
