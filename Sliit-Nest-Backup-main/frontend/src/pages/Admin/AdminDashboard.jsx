import React, { useEffect, useState } from 'react';
import { FiGrid, FiUsers, FiCreditCard, FiEye, FiRefreshCw, FiCheck, FiX } from 'react-icons/fi';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import BoardingModal from '../../components/Boardings/BoardingModal';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('listings');
  const [payments, setPayments] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState([
    { name: 'Total Listings', value: '0', icon: FiGrid, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Verified Students', value: '0', icon: FiUsers, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Pending Payments', value: '0', icon: FiCreditCard, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  ]);

  useEffect(() => {
    if (activeTab === 'payments') {
      fetchPayments();
    } else if (activeTab === 'listings') {
      fetchListings();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchPayments();
    fetchListings();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (activeTab === 'payments') {
        fetchPayments();
      } else if (activeTab === 'listings') {
        fetchListings();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/payments');
      // Sort payments by creation date (newest first)
      const sortedPayments = response.data.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setPayments(sortedPayments);
      setLastUpdated(new Date());
      
      // Update stats
      const pendingCount = sortedPayments.filter(p => p.status === 'pending').length;
      setStats(prev => [
        prev[0],
        prev[1],
        { ...prev[2], value: pendingCount.toString() }
      ]);
    } catch (error) {
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchListings = async () => {
    try {
      const response = await api.get('/admin/listings/pending');
      // Sort listings by creation date (newest first)
      const sortedListings = response.data.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setListings(sortedListings);
      setLastUpdated(new Date());
    } catch (error) {
      toast.error('Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async (paymentId) => {
    console.log('Approving payment with ID:', paymentId);
    try {
      console.log('Making API call to:', `/payments/${paymentId}/approve`);
      const response = await api.put(`/payments/${paymentId}/approve`);
      console.log('API response:', response.data);
      toast.success('Payment approved and listing created');
      fetchPayments();
    } catch (error) {
      console.error('Error approving payment:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to approve payment');
    }
  };

  const handleRejectPayment = async (paymentId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    console.log('Rejecting payment with ID:', paymentId, 'Reason:', reason);
    try {
      console.log('Making API call to:', `/payments/${paymentId}/reject`);
      const response = await api.put(`/payments/${paymentId}/reject`, { adminNotes: reason });
      console.log('API response:', response.data);
      toast.success('Payment rejected');
      fetchPayments();
    } catch (error) {
      console.error('Error rejecting payment:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to reject payment');
    }
  };

  const handleViewListing = (listing) => {
    setSelectedListing(listing);
    setIsModalOpen(true);
  };

  const handleApproveListing = async (listingId) => {
    try {
      await api.put(`/admin/listings/${listingId}/approve`);
      toast.success('Listing approved successfully');
      fetchListings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve listing');
    }
  };

  const handleRejectListing = async (listingId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      await api.put(`/admin/listings/${listingId}/reject`, { reason });
      toast.success('Listing rejected');
      fetchListings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject listing');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'payments':
        return (
          <div className="bg-white shadow rounded-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Payment Approvals</h3>
                <p className="text-sm text-gray-500">
                  Review and approve boarding listing payments
                  {lastUpdated && (
                    <span className="ml-2 text-xs text-gray-400">
                      (Last updated: {lastUpdated.toLocaleTimeString()})
                    </span>
                  )}
                </p>
              </div>
              <button 
                onClick={fetchPayments}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                disabled={loading}
              >
                <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
            
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading payments...</div>
            ) : payments.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No pending payments</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listing Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Info</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{payment.listingId?.title || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{payment.listingId?.address || 'N/A'}</div>
                          <div className="text-xs text-gray-400">by {payment.user?.firstName || payment.user?.email?.split('@')[0] || 'Unknown'} {payment.user?.lastName || ''}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{payment.paymentMethod.replace('_', ' ')}</div>
                        <div className="text-xs text-gray-500">ID: {payment.transactionId}</div>
                        <button 
                          onClick={() => window.open(`/uploads/payments/${payment.paymentSlip}`, '_blank')}
                          className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                        >
                          <FiEye /> View Slip
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Rs. {payment.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          payment.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {payment.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApprovePayment(payment._id)}
                              className="text-green-600 hover:text-green-900 mr-4 flex items-center gap-1"
                            >
                              <FiCheck /> Approve
                            </button>
                            <button 
                              onClick={() => handleRejectPayment(payment._id)}
                              className="text-red-600 hover:text-red-900 flex items-center gap-1"
                            >
                              <FiX /> Reject
                            </button>
                          </>
                        )}
                        {payment.status !== 'pending' && payment.adminNotes && (
                          <div className="text-xs text-gray-500 italic">{payment.adminNotes}</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      case 'reviews':
        return (
          <div className="bg-white shadow rounded-lg border border-gray-100 p-6 text-center text-gray-500">
            No reported reviews at this time.
          </div>
        );
      case 'roommates':
        return (
          <div className="bg-white shadow rounded-lg border border-gray-100 p-6 text-center text-gray-500">
            No roommate posts require moderation.
          </div>
        );
      case 'listings':
      default:
        return (
          <div className="bg-white shadow rounded-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Pending Listing Approvals</h3>
                <p className="text-sm text-gray-500">
                  Review and approve boarding listings
                  {lastUpdated && (
                    <span className="ml-2 text-xs text-gray-400">
                      (Last updated: {lastUpdated.toLocaleTimeString()})
                    </span>
                  )}
                </p>
              </div>
              <button 
                onClick={fetchListings}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                disabled={loading}
              >
                <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
            
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading listings...</div>
            ) : listings.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No pending listings</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listing Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rent</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {listings.map((listing) => (
                    <tr key={listing._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{listing.title}</div>
                          <div className="text-sm text-gray-500">{listing.accommodationType}</div>
                          <div className="text-xs text-gray-400">Capacity: {listing.capacity}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {listing.ownerId?.firstName} {listing.ownerId?.lastName}
                        </div>
                        <div className="text-xs text-gray-500">{listing.ownerId?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {listing.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Rs. {listing.monthlyRent?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleViewListing(listing)}
                          className="text-blue-600 hover:text-blue-900 mr-4 flex items-center gap-1"
                        >
                          <FiEye /> View
                        </button>
                        <button 
                          onClick={() => handleApproveListing(listing._id)}
                          className="text-green-600 hover:text-green-900 mr-4 flex items-center gap-1"
                        >
                          <FiCheck /> Approve
                        </button>
                        <button 
                          onClick={() => handleRejectListing(listing._id)}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1"
                        >
                          <FiX /> Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.name}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="pt-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['payments', 'listings', 'reviews', 'roommates'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
              >
                {tab === 'payments' ? 'Payment Approvals' : `Pending ${tab}`}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {renderTabContent()}
      </div>

      {/* Viewing details modal */}
      {isModalOpen && selectedListing && (
        <BoardingModal
          boarding={selectedListing}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedListing(null);
          }}
          onReviewAdded={fetchListings}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
