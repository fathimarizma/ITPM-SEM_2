import React, { useState, useEffect, useContext } from 'react';
import { FiHeart } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axiosConfig';
import PublicNavbar from '../../components/Layout/PublicNavbar';
import BoardingCard from '../../components/Boardings/BoardingCard';
import BoardingModal from '../../components/Boardings/BoardingModal';

const SavedBoardings = () => {
  const { user } = useContext(AuthContext);
  const [boardings, setBoardings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBoarding, setSelectedBoarding] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchSavedBoardings();
  }, [user?.bookmarks]); // Re-fetch if bookmarks change implicitly or explicitly

  const fetchSavedBoardings = async () => {
    try {
      const { data } = await api.get('/boardings/saved/bookmarks');
      if (data && data.success) {
        setBoardings(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch saved boardings', err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = async (boarding) => {
    const updatedBoarding = { ...boarding, viewCount: (boarding.viewCount || 0) + 1 };
    setSelectedBoarding(updatedBoarding);
    setBoardings((prev) => prev.map((b) => (b._id === boarding._id ? updatedBoarding : b)));
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <PublicNavbar activePage="saved" />

      <div className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiHeart className="text-rose-500 fill-current" />
            Saved Boardings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Boardings you've bookmarked for later viewing.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-600"></div>
          </div>
        ) : boardings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100 flex flex-col items-center justify-center max-w-lg mx-auto mt-10">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
              <FiHeart size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Saved Boardings Yet</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm">
              When you see a boarding you like, click the heart icon to save it here for quick access later!
            </p>
            <a href="/search" className="bg-[#0b2b56] hover:bg-[#081f40] text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
              Explore Boardings
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {boardings.map((boarding) => (
              <div key={boarding._id} onClick={() => openModal(boarding)}>
                <BoardingCard boarding={boarding} />
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && selectedBoarding && (
        <BoardingModal
          boarding={selectedBoarding}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default SavedBoardings;
