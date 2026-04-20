import React, { useState, useEffect, useContext } from 'react';
import { FiUsers, FiEye, FiStar, FiHeart } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';

const BoardingCard = ({ boarding, isSelected, onToggleCompare }) => {
  const { user, isAuthenticated, setUser } = useContext(AuthContext);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [showAllFacilities, setShowAllFacilities] = useState(false);
  const [loadingBookmark, setLoadingBookmark] = useState(false);

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
        // Optional: toast.success(data.message);
      }
    } catch (err) {
      toast.error('Failed to update bookmark');
    } finally {
      setLoadingBookmark(false);
    }
  };

  useEffect(() => {
    let interval;
    if (isHovering && boarding?.photos && boarding.photos.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % boarding.photos.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isHovering, boarding?.photos]);

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
    if (url.startsWith('blob:')) return url;
    return url;
  };

  const isNew = () => {
    const createdDate = new Date(boarding.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  return (
    <div className={`bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col transform hover:-translate-y-1 relative ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}>
      {/* Compare Checkbox */}
      <div
        className="absolute top-3 left-3 z-20"
        onClick={(e) => { e.stopPropagation(); onToggleCompare && onToggleCompare(boarding); }}
      >
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
          isSelected
            ? 'bg-blue-600 border-blue-600 text-white'
            : 'bg-white/80 border-gray-300 hover:border-blue-400 backdrop-blur-sm'
        }`}>
          {isSelected && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>

      <div
        className="relative h-40 bg-gray-100 group shrink-0"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => { setIsHovering(false); setCurrentImageIndex(0); }}
      >
        {boarding.photos && boarding.photos.length > 0 ? (
          <img
            src={getImageUrl(boarding.photos[currentImageIndex])}
            alt="Listing Cover"
            className="w-full h-full object-cover transition-opacity duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-4 text-center">
            <span className="text-xs">No cover photo</span>
          </div>
        )}

        {isNew() && (
          <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold rounded-full bg-orange-100 text-orange-700 shadow-sm z-10">
            New
          </span>
        )}

        {boarding.photos && boarding.photos.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            {boarding.photos.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${i === currentImageIndex ? 'w-2.5 bg-white' : 'w-1 bg-white/60'}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-3.5 flex flex-col flex-1">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="font-bold text-gray-900 text-sm mb-0.5 truncate" title={boarding.title}>
              {boarding.title || 'Untitled Boarding'}
            </h3>
            <p className="text-gray-500 text-xs mb-2">{boarding.accommodationType || 'Any Type'}</p>
          </div>
          
          {/* Bookmark Icon */}
          <button
            onClick={handleBookmarkToggle}
            disabled={loadingBookmark}
            className={`flex-shrink-0 p-1.5 rounded-full transition-all shadow-sm border ${
              isBookmarked 
                ? 'bg-rose-50 text-rose-500 hover:bg-rose-100 border-rose-200' 
                : 'bg-gray-50 text-gray-400 hover:text-rose-500 hover:bg-rose-50 border-gray-200'
            }`}
            title="Save Boarding"
          >
            <FiHeart size={16} className={isBookmarked ? 'fill-current' : ''} />
          </button>
        </div>

        <p className="text-blue-600 font-bold text-base mb-2">
          Rs. {boarding.monthlyRent ? Number(boarding.monthlyRent).toLocaleString() : '0'}
          <span className="text-[11px] text-gray-500 font-normal">/month</span>
        </p>

        <div className="flex gap-3 text-[11px] text-gray-500 mb-3">
          <span className="flex items-center gap-1"><FiUsers size={11} /> {boarding.capacity || 1}</span>
          <span className="flex items-center gap-1"><FiEye size={11} /> {boarding.viewCount || 0}</span>
          <span className="flex items-center gap-1 text-yellow-500"><FiStar size={11} /> {boarding.averageRating || '0.0'}</span>
        </div>

        {boarding.description && (
          <p className="text-gray-600 text-xs mb-2 line-clamp-2" title={boarding.description}>
            {boarding.description}
          </p>
        )}

        {boarding.facilities && boarding.facilities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {(showAllFacilities ? boarding.facilities : boarding.facilities.slice(0, 3)).map((f, i) => (
              <span key={i} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[9px] rounded-full font-medium border border-blue-100">{f}</span>
            ))}
            {!showAllFacilities && boarding.facilities.length > 3 && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowAllFacilities(true); }}
                className="px-1.5 py-0.5 bg-gray-50 hover:bg-gray-100 text-gray-500 text-[9px] rounded-full font-medium border border-gray-200 transition-colors cursor-pointer"
              >
                +{boarding.facilities.length - 3} more
              </button>
            )}
            {showAllFacilities && boarding.facilities.length > 3 && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowAllFacilities(false); }}
                className="px-1.5 py-0.5 bg-gray-50 hover:bg-gray-100 text-gray-500 text-[9px] rounded-full font-medium border border-gray-200 transition-colors cursor-pointer"
              >
                Show less
              </button>
            )}
          </div>
        )}

        <div className="mt-auto">
          <p className="text-gray-500 text-[11px] mb-2.5 truncate italic" title={boarding.address}>
            {boarding.address || 'Address not listed'}
          </p>

          <button
            onClick={(e) => {
              e.stopPropagation();
              const cleanNumber = boarding.contactNumber?.replace(/[^0-9]/g, '') || '';
              const waNumber = cleanNumber.startsWith('94') ? cleanNumber : (cleanNumber.startsWith('0') ? `94${cleanNumber.slice(1)}` : `94${cleanNumber}`);
              window.open(`https://wa.me/${waNumber}`, '_blank');
            }}
            className="w-full text-center py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-xs shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer border-none"
          >
            <FaWhatsapp size={14} />
            WhatsApp Contact
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoardingCard;
