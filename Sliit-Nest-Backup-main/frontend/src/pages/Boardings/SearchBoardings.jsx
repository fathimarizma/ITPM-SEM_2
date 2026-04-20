import React, { useState, useEffect } from 'react';
import PublicNavbar from '../../components/Layout/PublicNavbar';
import BoardingCard from '../../components/Boardings/BoardingCard';
import BoardingFilter from '../../components/Boardings/BoardingFilter';
import BoardingModal from '../../components/Boardings/BoardingModal';
import CompareModal from '../../components/Boardings/CompareModal';
import api from '../../api/axiosConfig';
import { FiFilter, FiX, FiLayers } from 'react-icons/fi';
import { toast } from 'react-toastify';

const SearchBoardings = () => {
  const [boardings, setBoardings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    type: '',
    capacity: '',
    facilities: '',
    rating: ''
  });

  const [selectedBoarding, setSelectedBoarding] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Compare state
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    fetchBoardings();
  }, [filters]);

  const fetchBoardings = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''));
      const { data } = await api.get('/boardings', { params });
      if (data && data.success) {
        setBoardings(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch boardings', err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = async (boarding) => {
    const updatedBoarding = { ...boarding, viewCount: (boarding.viewCount || 0) + 1 };
    setSelectedBoarding(updatedBoarding);
    setBoardings(prev => prev.map(b => b._id === boarding._id ? updatedBoarding : b));
    setIsModalOpen(true);
    try {
      await api.post(`/boardings/${boarding._id}/views`);
    } catch (err) {
      console.error('Failed to increment view count', err);
    }
  };

  const closeModal = () => {
    setSelectedBoarding(null);
    setIsModalOpen(false);
  };

  const refreshBoarding = async () => {
    await fetchBoardings();
  };

  const toggleCompare = (boarding) => {
    setCompareList(prev => {
      const exists = prev.find(b => b._id === boarding._id);
      if (exists) {
        return prev.filter(b => b._id !== boarding._id);
      }
      if (prev.length >= 3) {
        toast.warning('Maximum 3 boardings can be compared');
        return prev;
      }
      return [...prev, boarding];
    });
  };

  const isInCompare = (boardingId) => compareList.some(b => b._id === boardingId);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <PublicNavbar activePage="boardings" />

      {/* Main Content Area */}
      <div className="flex-1 max-w-[1440px] mx-auto w-full px-3 sm:px-4 lg:px-6 py-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-800">Find Boardings</h1>
            <p className="text-[11px] text-gray-400">{boardings.length} results found</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Compare Button */}
            {compareList.length > 0 && (
              <button
                onClick={() => setShowCompare(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                <FiLayers size={13} />
                Compare ({compareList.length})
              </button>
            )}
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowMobileFilter(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm"
            >
              <FiFilter size={13} />
              Filters
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          {/* Left Filter Sidebar - desktop */}
          <div className="hidden lg:block w-[240px] xl:w-[260px] shrink-0">
            <BoardingFilter filters={filters} setFilters={setFilters} />
          </div>

          {/* Mobile Filter Overlay */}
          {showMobileFilter && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileFilter(false)} />
              <div className="absolute left-0 top-0 bottom-0 w-[300px] max-w-[85vw] bg-white shadow-2xl z-50 overflow-y-auto">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <span className="font-bold text-sm text-gray-800">Filters</span>
                  <button onClick={() => setShowMobileFilter(false)} className="text-gray-500 hover:text-gray-800">
                    <FiX size={18} />
                  </button>
                </div>
                <div className="p-2">
                  <BoardingFilter filters={filters} setFilters={setFilters} />
                </div>
              </div>
            </div>
          )}

          {/* Boardings Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : boardings.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-10 text-center border border-gray-100">
                <h3 className="text-base font-bold text-gray-800 mb-1">No Boardings Found</h3>
                <p className="text-gray-400 text-xs">Try adjusting your filters to find more options.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                {boardings.map(boarding => (
                  <div key={boarding._id} onClick={() => openModal(boarding)}>
                    <BoardingCard
                      boarding={boarding}
                      isSelected={isInCompare(boarding._id)}
                      onToggleCompare={toggleCompare}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compare Floating Bar */}
      {compareList.length > 0 && !showCompare && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg px-4 py-2.5">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-500">Selected for comparison:</span>
              <div className="flex items-center gap-2">
                {compareList.map(b => (
                  <div key={b._id} className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">
                    <span className="text-[11px] font-medium text-blue-800 max-w-[120px] truncate">{b.title}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleCompare(b); }}
                      className="text-blue-400 hover:text-blue-600"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
                {compareList.length < 3 && (
                  <span className="text-[10px] text-gray-400 italic">Select up to {3 - compareList.length} more</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCompareList([])}
                className="text-xs text-gray-500 hover:text-gray-700 font-medium px-2 py-1"
              >
                Clear
              </button>
              <button
                onClick={() => setShowCompare(true)}
                disabled={compareList.length < 2}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                <FiLayers size={12} />
                Compare Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isModalOpen && selectedBoarding && (
        <BoardingModal
          boarding={selectedBoarding}
          onClose={closeModal}
          onReviewAdded={refreshBoarding}
        />
      )}

      {/* Compare Modal */}
      {showCompare && compareList.length >= 2 && (
        <CompareModal
          boardings={compareList}
          onClose={() => setShowCompare(false)}
        />
      )}
    </div>
  );
};

export default SearchBoardings;
