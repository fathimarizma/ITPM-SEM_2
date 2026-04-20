import React from 'react';
import { FiX, FiStar, FiUsers, FiEye, FiMapPin, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const CompareModal = ({ boardings, onClose }) => {
  if (!boardings || boardings.length === 0) return null;

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
    return url;
  };

  // Collect all unique facilities across all boardings
  const allFacilities = [...new Set(boardings.flatMap(b => b.facilities || []))].sort();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-5xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 shrink-0">
          <h2 className="text-sm font-bold text-white">Compare Boardings ({boardings.length})</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-2.5 text-gray-500 font-semibold uppercase tracking-wider text-[10px] w-32 sticky left-0 bg-gray-50 z-10">Feature</th>
                {boardings.map(b => (
                  <th key={b._id} className="px-3 py-2.5 text-center min-w-[180px]">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-full h-24 rounded-lg overflow-hidden bg-gray-100">
                        {b.photos && b.photos.length > 0 ? (
                          <img src={getImageUrl(b.photos[0])} alt={b.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">No Image</div>
                        )}
                      </div>
                      <span className="font-bold text-gray-800 text-xs truncate max-w-[160px]">{b.title}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Type */}
              <tr className="hover:bg-gray-50/50">
                <td className="px-4 py-2 font-semibold text-gray-600 sticky left-0 bg-white text-[11px]">Type</td>
                {boardings.map(b => (
                  <td key={b._id} className="px-3 py-2 text-center">
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-medium">{b.accommodationType}</span>
                  </td>
                ))}
              </tr>
              {/* Monthly Rent */}
              <tr className="hover:bg-gray-50/50">
                <td className="px-4 py-2 font-semibold text-gray-600 sticky left-0 bg-white text-[11px]">Monthly Rent</td>
                {boardings.map(b => {
                  const rents = boardings.map(x => x.monthlyRent || 0);
                  const minRent = Math.min(...rents);
                  const isLowest = b.monthlyRent === minRent;
                  return (
                    <td key={b._id} className="px-3 py-2 text-center">
                      <span className={`font-bold text-sm ${isLowest ? 'text-green-600' : 'text-gray-800'}`}>
                        Rs. {(b.monthlyRent || 0).toLocaleString()}
                      </span>
                      {isLowest && <span className="block text-[9px] text-green-500 font-medium mt-0.5">Lowest</span>}
                    </td>
                  );
                })}
              </tr>
              {/* Capacity */}
              <tr className="hover:bg-gray-50/50">
                <td className="px-4 py-2 font-semibold text-gray-600 sticky left-0 bg-white text-[11px]">Capacity</td>
                {boardings.map(b => (
                  <td key={b._id} className="px-3 py-2 text-center">
                    <span className="flex items-center justify-center gap-1 text-gray-700">
                      <FiUsers size={12} /> {b.capacity} person{b.capacity > 1 ? 's' : ''}
                    </span>
                  </td>
                ))}
              </tr>
              {/* Rating */}
              <tr className="hover:bg-gray-50/50">
                <td className="px-4 py-2 font-semibold text-gray-600 sticky left-0 bg-white text-[11px]">Rating</td>
                {boardings.map(b => {
                  const ratings = boardings.map(x => x.averageRating || 0);
                  const bestRating = Math.max(...ratings);
                  const isBest = (b.averageRating || 0) === bestRating && bestRating > 0;
                  return (
                    <td key={b._id} className="px-3 py-2 text-center">
                      <span className={`flex items-center justify-center gap-0.5 font-bold ${isBest ? 'text-yellow-500' : 'text-gray-600'}`}>
                        <FiStar size={12} className={isBest ? 'fill-current' : ''} />
                        {b.averageRating || '0.0'}
                      </span>
                      {isBest && <span className="block text-[9px] text-yellow-500 font-medium mt-0.5">Best</span>}
                    </td>
                  );
                })}
              </tr>
              {/* Views */}
              <tr className="hover:bg-gray-50/50">
                <td className="px-4 py-2 font-semibold text-gray-600 sticky left-0 bg-white text-[11px]">Views</td>
                {boardings.map(b => (
                  <td key={b._id} className="px-3 py-2 text-center">
                    <span className="flex items-center justify-center gap-1 text-gray-600">
                      <FiEye size={12} /> {b.viewCount || 0}
                    </span>
                  </td>
                ))}
              </tr>
              {/* Address */}
              <tr className="hover:bg-gray-50/50">
                <td className="px-4 py-2 font-semibold text-gray-600 sticky left-0 bg-white text-[11px]">Location</td>
                {boardings.map(b => (
                  <td key={b._id} className="px-3 py-2 text-center">
                    <span className="flex items-center justify-center gap-1 text-gray-600 text-[11px]">
                      <FiMapPin size={11} className="shrink-0" />
                      <span className="truncate max-w-[140px]">{b.address || 'N/A'}</span>
                    </span>
                  </td>
                ))}
              </tr>
              {/* Reviews */}
              <tr className="hover:bg-gray-50/50">
                <td className="px-4 py-2 font-semibold text-gray-600 sticky left-0 bg-white text-[11px]">Reviews</td>
                {boardings.map(b => (
                  <td key={b._id} className="px-3 py-2 text-center text-gray-600">
                    {b.reviewCount || 0} reviews
                  </td>
                ))}
              </tr>
              {/* Facilities */}
              {allFacilities.map(fac => (
                <tr key={fac} className="hover:bg-gray-50/50">
                  <td className="px-4 py-1.5 font-medium text-gray-500 sticky left-0 bg-white text-[11px]">{fac}</td>
                  {boardings.map(b => {
                    const hasFac = b.facilities && b.facilities.includes(fac);
                    return (
                      <td key={b._id} className="px-3 py-1.5 text-center">
                        {hasFac ? (
                          <FiCheckCircle className="text-green-500 mx-auto" size={14} />
                        ) : (
                          <FiXCircle className="text-gray-300 mx-auto" size={14} />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompareModal;
