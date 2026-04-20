import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiUsers, FiEye, FiStar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const ListingCard = ({ listing, onEdit, onDelete, onPreview }) => {

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [showAllFacilities, setShowAllFacilities] = useState(false);

  useEffect(() => {
    let interval;
    if (isHovering && listing.photos && listing.photos.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % listing.photos.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isHovering, listing.photos]);

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
    if (url.startsWith('blob:')) return url;
    return url;
  };

  const statusColors = {
    Approved: 'bg-green-100 text-green-700',
    Pending: 'bg-orange-100 text-orange-700',
    Rejected: 'bg-red-100 text-red-700'
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
      <div
        className="relative h-48 bg-gray-200 cursor-pointer group"
        onClick={() => onPreview(listing)}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => { setIsHovering(false); setCurrentImageIndex(0); }}
      >
        {listing.photos && listing.photos.length > 0 ? (
          <img
            src={getImageUrl(listing.photos[currentImageIndex])}
            alt={listing.title}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
        )}
        <span className={`absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-full ${statusColors[listing.status] || 'bg-gray-100 text-gray-800'}`}>
          {listing.status}
        </span>

        {listing.photos && listing.photos.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {listing.photos.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === currentImageIndex ? 'w-3 bg-white' : 'w-1.5 bg-white/60'}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-900 text-lg mb-1 truncate" title={listing.title}>
          {listing.title}
        </h3>
        <p className="text-gray-500 text-sm mb-3">{listing.accommodationType}</p>

        <p className="text-blue-600 font-bold text-xl mb-3">
          Rs. {listing.monthlyRent.toLocaleString()}<span className="text-sm text-gray-500 font-normal">/month</span>
        </p>

        <div className="flex gap-4 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1"><FiUsers /> {listing.capacity} {listing.capacity > 1 ? 'people' : 'person'}</span>
          <span className="flex items-center gap-1"><FiEye /> {listing.viewCount || 0}</span>
          <span className="flex items-center gap-1 text-yellow-500"><FiStar /> {listing.averageRating || '0.0'}</span>
        </div>

        {listing.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2" title={listing.description}>
            {listing.description}
          </p>
        )}

        {listing.facilities && listing.facilities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {(showAllFacilities ? listing.facilities : listing.facilities.slice(0, 3)).map((f, i) => (
              <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded-full font-medium tracking-wide border border-blue-100">{f}</span>
            ))}
            {!showAllFacilities && listing.facilities.length > 3 && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowAllFacilities(true); }}
                className="px-2 py-0.5 bg-gray-50 hover:bg-gray-100 text-gray-500 text-[10px] rounded-full font-medium border border-gray-200 transition-colors cursor-pointer"
              >
                +{listing.facilities.length - 3} more
              </button>
            )}
            {showAllFacilities && listing.facilities.length > 3 && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowAllFacilities(false); }}
                className="px-2 py-0.5 bg-gray-50 hover:bg-gray-100 text-gray-500 text-[10px] rounded-full font-medium border border-gray-200 transition-colors cursor-pointer"
              >
                Show less
              </button>
            )}
          </div>
        )}

        <p className="text-gray-500 text-xs mb-4 truncate italic">
          {listing.address}
        </p>

        <div className="mt-auto pt-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={() => onEdit(listing._id)}
            className="flex-1 flex justify-center items-center gap-2 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            <FiEdit className="w-4 h-4" /> Edit
          </button>
          <button
            onClick={() => onDelete(listing)}
            className="flex-1 flex justify-center items-center gap-2 py-2 border border-red-200 rounded-lg text-sm text-red-600 font-medium hover:bg-red-50 transition-colors"
          >
            <FiTrash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
