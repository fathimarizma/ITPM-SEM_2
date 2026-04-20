import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import ListingCard from '../components/ListingCard/ListingCard';
import { toast } from 'react-toastify';

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, listing: null });
  const navigate = useNavigate();

  const fetchListings = async () => {
    try {
      const { data } = await api.get('/listings/my-listings');
      setListings(data.data);
    } catch (error) {
      toast.error('Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleDeleteClick = (listing) => {
    setDeleteModal({ isOpen: true, listing });
  };

  const confirmDelete = async () => {
    if (!deleteModal.listing) return;
    const id = deleteModal.listing._id;
    try {
      await api.delete(`/listings/${id}`);
      toast.success('Listing deleted successfully');
      setListings(listings.filter(l => l._id !== id));
      setDeleteModal({ isOpen: false, listing: null });
    } catch (error) {
      toast.error('Failed to delete listing');
      setDeleteModal({ isOpen: false, listing: null });
    }
  };

  const handleEdit = (id) => {
    navigate(`/listings/edit/${id}`);
  };

  const handlePreview = (listing) => {
    // In a full implementation, this opens the PreviewModal.
    // We will expand on this once we build the Modal.
    toast.info(`Previewing ${listing.title}`);
  };

  const filteredListings = filter === 'All' 
    ? listings 
    : listings.filter(l => l.status === filter);

  if (loading) return <div className="flex justify-center p-10">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Listings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all your boarding listings</p>
        </div>
        <button 
          onClick={() => navigate('/listings/add')}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium shadow-sm hover:bg-blue-700 transition"
        >
          + Add New Boarding
        </button>
      </div>

      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">Filter by status:</span>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm text-gray-700 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <div className="text-sm text-gray-500">
          Showing {filteredListings.length} of {listings.length} listings
        </div>
      </div>

      {filteredListings.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-200">
          <p className="text-gray-500">You don't have any {filter !== 'All' ? filter.toLowerCase() : ''} listings yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map(listing => (
            <ListingCard 
              key={listing._id}
              listing={listing}
              onDelete={handleDeleteClick}
              onEdit={handleEdit}
              onPreview={handlePreview}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.listing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-bold text-gray-800">"{deleteModal.listing.title}"</span> details from your list? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setDeleteModal({ isOpen: false, listing: null })}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyListings;
