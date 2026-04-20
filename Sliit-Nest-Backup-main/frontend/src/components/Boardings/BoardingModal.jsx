import React, { useState, useEffect, useContext } from 'react';
import { FiX, FiMapPin, FiUsers, FiCheckCircle, FiStar, FiEye, FiChevronLeft, FiChevronRight, FiHeart } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';

const BoardingModal = ({ boarding, onClose, onReviewAdded }) => {
  const { user, isAuthenticated, setUser } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingBookmark, setLoadingBookmark] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);

  const isBookmarked = user?.bookmarks?.includes(boarding._id);

  const handleBookmarkToggle = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated || user?.role !== 'Student') {
      toast.info('Please log in as a student to save boardings');
      return;
    }

    setLoadingBookmark(true);
    try {
      const { data } = await api.post(`/boardings/${boarding._id}/bookmark`);
      if (data.success) {
        setUser({ ...user, bookmarks: data.bookmarks });
      }
    } catch (err) {
      toast.error('Failed to update bookmark');
    } finally {
      setLoadingBookmark(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [boarding._id]);

  const fetchReviews = async () => {
    try {
      const { data } = await api.get(`/boardings/${boarding._id}/reviews`);
      if (data && data.success) {
        setReviews(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (newRating === 0) return toast.error('Please select a rating');
    if (!newComment.trim()) return toast.error('Comment cannot be empty');

    setLoading(true);
    try {
      await api.post(`/boardings/${boarding._id}/reviews`, {
        rating: newRating,
        comment: newComment
      });
      toast.success('Review added successfully!');
      setNewComment('');
      setNewRating(0);
      fetchReviews();
      if (onReviewAdded) onReviewAdded();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add review');
    } finally {
      setLoading(false);
    }
  };

  const cleanNumber = boarding.contactNumber?.replace(/[^0-9]/g, '') || '';
  const waNumber = cleanNumber.startsWith('94') ? cleanNumber : (cleanNumber.startsWith('0') ? `94${cleanNumber.slice(1)}` : `94${cleanNumber}`);
  const waLink = `https://wa.me/${waNumber}`;

  const photos = boarding.photos || [];
  const nextImg = () => setCurrentImg(prev => (prev + 1) % photos.length);
  const prevImg = () => setCurrentImg(prev => (prev - 1 + photos.length) % photos.length);

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
    return url;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-gray-900/60 backdrop-blur-sm overflow-hidden" onClick={onClose}>
      <div className={`bg-white w-full ${user?.role === 'Admin' ? 'max-w-2xl' : 'max-w-5xl'} max-h-[88vh] rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative`} onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-white/70 hover:bg-white text-gray-700 p-1.5 rounded-full backdrop-blur-md transition shadow-sm border border-gray-200"
        >
          <FiX size={16} />
        </button>

        {/* Left: Details */}
        <div className={`w-full ${user?.role === 'Admin' ? '' : 'md:w-3/5'} overflow-y-auto bg-gray-50 flex flex-col`} style={{ scrollbarWidth: 'thin' }}>
          {/* Image Gallery */}
          <div className="h-64 md:h-80 shrink-0 relative bg-gray-200">
            {photos.length > 0 ? (
              <>
                <img
                  src={getImageUrl(photos[currentImg])}
                  alt={boarding.title}
                  className="w-full h-full object-cover"
                />
                {photos.length > 1 && (
                  <>
                    <button onClick={prevImg} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-1.5 rounded-full transition">
                      <FiChevronLeft size={16} />
                    </button>
                    <button onClick={nextImg} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-1.5 rounded-full transition">
                      <FiChevronRight size={16} />
                    </button>
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                      {photos.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImg(i)}
                          className={`h-1 rounded-full transition-all ${i === currentImg ? 'w-3 bg-white' : 'w-1.5 bg-white/50'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
            )}
            
            {/* Bookmark Icon */}
            {user?.role === 'Student' && (
              <button
                onClick={handleBookmarkToggle}
                disabled={loadingBookmark}
                className={`absolute top-3 left-3 z-20 p-2 rounded-full backdrop-blur-md transition-all shadow-sm border border-gray-200/50 ${
                  isBookmarked 
                    ? 'bg-rose-50 text-rose-500 hover:bg-rose-100 border-rose-200' 
                    : 'bg-white/80 text-gray-500 hover:text-rose-500 hover:bg-white'
                }`}
              >
                <FiHeart size={20} className={isBookmarked ? 'fill-current' : ''} />
              </button>
            )}

            <div className="absolute bottom-3 left-3 bg-gray-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg shadow">
              <p className="text-[10px] text-gray-300 font-medium">Monthly Rent</p>
              <p className="text-base font-bold">Rs. {boarding.monthlyRent?.toLocaleString()}</p>
            </div>
          </div>

          <div className="p-5 pb-6">
            {/* Tags */}
            <div className="flex gap-1.5 items-center mb-3 flex-wrap">
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                {boarding.accommodationType}
              </span>
              <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
                <FiUsers size={10} /> {boarding.capacity} Persons
              </span>
              <span className="bg-gray-100 text-gray-600 text-[10px] font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <FiEye size={10} /> {boarding.viewCount || 0} views
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-gray-900 mb-1 leading-tight">{boarding.title}</h2>

            <p className="text-gray-500 flex items-center gap-1.5 mb-5 text-xs">
              <FiMapPin className="text-blue-500 shrink-0" size={12} />
              {boarding.address}
            </p>

            {/* Description */}
            <div className="mb-5">
              <h3 className="text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Description</h3>
              <p className="text-gray-600 text-xs leading-relaxed bg-white p-3 rounded-xl border border-gray-100">
                {boarding.description || 'No detailed description provided.'}
              </p>
            </div>

            {/* Facilities */}
            {boarding.facilities && boarding.facilities.length > 0 && (
              <div className="mb-5">
                <h3 className="text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Facilities</h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {boarding.facilities.map((fac, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-gray-700 bg-white px-2.5 py-1.5 rounded-lg border border-gray-100">
                      <FiCheckCircle className="text-blue-500 shrink-0" size={12} />
                      <span className="text-xs">{fac}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* WhatsApp CTA */}
            <div className="pt-4 border-t border-gray-200">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20b858] text-white font-bold py-2.5 rounded-xl transition shadow-md text-sm"
              >
                <FaWhatsapp size={18} /> Contact via WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Right: Reviews */}
        {user?.role !== 'Admin' && (
          <div className="w-full md:w-2/5 p-5 overflow-y-auto bg-white border-l border-gray-100" style={{ scrollbarWidth: 'thin' }}>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Ratings & Reviews</h3>
                <p className="text-gray-400 text-[11px] mt-0.5">{reviews.length} total reviews</p>
              </div>
              {boarding.averageRating > 0 && (
                <div className="flex items-center gap-1 bg-yellow-50 px-2.5 py-1 rounded-xl border border-yellow-200">
                  <FiStar className="fill-current text-yellow-500" size={14} />
                  <span className="text-lg font-black text-yellow-600">{boarding.averageRating}</span>
                </div>
              )}
            </div>

            {/* Review Form */}
            {isAuthenticated ? (
              user?.role === 'Student' ? (
                <form onSubmit={handleReviewSubmit} className="mb-5 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <h4 className="font-bold text-gray-700 mb-2 text-[10px] uppercase tracking-wider">Leave a Review as {user.firstName} {user.lastName}</h4>
                  <div className="flex gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className={`cursor-pointer transition-colors ${newRating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                      >
                        <FiStar size={18} className={newRating >= star ? 'fill-current' : ''} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your experience..."
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-xs outline-none resize-none h-16 mb-2"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition shadow-sm disabled:bg-gray-400 text-xs"
                  >
                    {loading ? 'Submitting...' : 'Post Review'}
                  </button>
                </form>
              ) : (
                <div className="mb-5 p-3 bg-blue-50 text-blue-800 rounded-lg text-[11px] border border-blue-100 text-center">
                  Only logged-in students can add reviews.
                </div>
              )
            ) : (
              <div className="mb-5 p-3 bg-gray-50 text-gray-500 rounded-lg text-[11px] border border-gray-200 text-center">
                Log in as a Student to share your experience.
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-2.5">
              {reviews.length === 0 ? (
                <p className="text-gray-400 text-center py-6 italic bg-gray-50 rounded-xl text-xs">No reviews yet. Be the first!</p>
              ) : (
                reviews.map(review => (
                  <div key={review._id} className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h5 className="font-bold text-gray-800 text-xs">
                          {review.studentId?.firstName} {review.studentId?.lastName}
                        </h5>
                        <p className="text-[10px] text-gray-400">{new Date(review.createdAt).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div className="flex items-center gap-0.5 text-yellow-500 bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-100">
                        <FiStar className="fill-current" size={10} />
                        <span className="text-[10px] font-bold text-yellow-700">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardingModal;
