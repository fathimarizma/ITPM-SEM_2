import React, { useState, useEffect } from 'react';
import { FiUsers, FiEye, FiStar } from 'react-icons/fi';

const PreviewModal = ({ isOpen, onClose, data }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [showAllFacilities, setShowAllFacilities] = useState(false);

  useEffect(() => {
    let interval;
    if (isHovering && data?.photos && data.photos.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % data.photos.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isHovering, data?.photos]);

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
    if (url.startsWith('blob:')) return url;
    return url;
  };

  if (!isOpen) return null;

  // Render a mocked up "Student Dashboard Card" exactly like it appears on the live site
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 overflow-y-auto px-4">
      <div className="bg-gray-50 rounded-xl shadow-2xl p-6 relative w-full max-w-md my-8 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-xl font-bold text-gray-800">Student View Preview</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 font-bold text-2xl leading-none">&times;</button>
        </div>

        {/* The Mocked Student Listing Card */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mx-auto w-full max-w-[350px]">
          <div 
            className="relative h-48 bg-gray-100 cursor-default group"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => { setIsHovering(false); setCurrentImageIndex(0); }}
          >
            {data.photos && data.photos.length > 0 ? (
              <img 
                src={getImageUrl(data.photos[currentImageIndex])} 
                alt="Listing Cover" 
                className="w-full h-full object-cover transition-opacity duration-300"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                <span>No cover photo</span>
              </div>
            )}
            <span className="absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-full bg-orange-100 text-orange-700 shadow-sm">
              New
            </span>

            {data.photos && data.photos.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {data.photos.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all ${i === currentImageIndex ? 'w-3 bg-white' : 'w-1.5 bg-white/60'}`} 
                  />
                ))}
              </div>
            )}
          </div>

          <div className="p-5 flex flex-col">
            <h3 className="font-bold text-gray-900 text-lg mb-1 truncate" title={data.title}>
              {data.title || 'Untitled Boarding'}
            </h3>
            <p className="text-gray-500 text-sm mb-3">{data.accommodationType || 'Any Type'}</p>
            
            <p className="text-blue-600 font-bold text-xl mb-3">
              Rs. {data.monthlyRent ? Number(data.monthlyRent).toLocaleString() : '0'}
              <span className="text-sm text-gray-500 font-normal">/month</span>
            </p>

            <div className="flex gap-4 text-xs text-gray-500 mb-4">
              <span className="flex items-center gap-1"><FiUsers /> {data.capacity || 1} {data.capacity > 1 ? 'people' : 'person'}</span>
              <span className="flex items-center gap-1"><FiEye /> 0</span>
              <span className="flex items-center gap-1 text-yellow-500"><FiStar /> 0.0</span>
            </div>

            {data.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2" title={data.description}>
                {data.description}
              </p>
            )}

            {data.facilities && data.facilities.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {(showAllFacilities ? data.facilities : data.facilities.slice(0, 3)).map((f, i) => (
                  <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded-full font-medium tracking-wide border border-blue-100">{f}</span>
                ))}
                {!showAllFacilities && data.facilities.length > 3 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowAllFacilities(true); }}
                    className="px-2 py-0.5 bg-gray-50 hover:bg-gray-100 text-gray-500 text-[10px] rounded-full font-medium border border-gray-200 transition-colors cursor-pointer"
                  >
                    +{data.facilities.length - 3} more
                  </button>
                )}
                {showAllFacilities && data.facilities.length > 3 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowAllFacilities(false); }}
                    className="px-2 py-0.5 bg-gray-50 hover:bg-gray-100 text-gray-500 text-[10px] rounded-full font-medium border border-gray-200 transition-colors cursor-pointer"
                  >
                    Show less
                  </button>
                )}
              </div>
            )}

            <p className="text-gray-500 text-xs mb-4 truncate italic" title={data.address}>
              {data.address || 'Address not listed'}
            </p>

            <button className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-sm shadow transition-colors">
              WhatsApp Contact
            </button>
          </div>
        </div>
        
        <p className="text-center text-sm text-gray-500 mt-6 bg-white p-3 rounded-lg border border-gray-200 shadow-inner">
          This is exactly how your listing card will appear to students on their feed once approved by an Admin.
        </p>

      </div>
    </div>
  );
};

export default PreviewModal;
