import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiGrid, FiUsers, FiCreditCard, FiEye, FiRefreshCw, FiCheck, FiX, FiHome, FiSettings, FiLogOut, FiBarChart, FiFileText, FiShield } from 'react-icons/fi';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import BoardingModal from '../../components/Boardings/BoardingModal';

const AdminDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('listings');
  const [payments, setPayments] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/20 flex justify-between items-center bg-white/60">
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
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium shadow-sm"
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
              <table className="w-full divide-y divide-white/20">
                <thead className="bg-white/40">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-2/5">Listing</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-1/5">Payment</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-1/5">Amount</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider w-1/5">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white/30 divide-y divide-white/20">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-white/50 transition-colors">
                      <td className="px-3 py-3">
                        <div className="max-w-xs">
                          <div className="text-sm font-medium text-gray-900 truncate">{payment.listingId?.title || 'N/A'}</div>
                          <div className="text-xs text-gray-500 truncate">{payment.listingId?.address || 'N/A'}</div>
                          <div className="text-xs text-gray-400">by {payment.user?.firstName || payment.user?.email?.split('@')[0] || 'Unknown'} {payment.user?.lastName || ''}</div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-sm text-gray-900">{payment.paymentMethod.replace('_', ' ')}</div>
                        <div className="text-xs text-gray-500 truncate">ID: {payment.transactionId}</div>
                      </td>
                      <td className="px-3 py-3 text-sm">
                        <div className="text-gray-900 font-medium">Rs. {payment.amount.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">
                          <span className={`px-2 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full ${
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            payment.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {payment.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {payment.status === 'pending' && (
                          <div className="flex gap-1 justify-center">
                            <button 
                              onClick={() => handleApprovePayment(payment._id)}
                              className="text-green-600 hover:text-green-900 px-2 py-1 rounded bg-green-50 hover:bg-green-100 transition-colors flex items-center justify-center gap-1 text-xs font-medium"
                            >
                              <FiCheck size={12} /> 
                            </button>
                            <button 
                              onClick={() => handleRejectPayment(payment._id)}
                              className="text-red-600 hover:text-red-900 px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center gap-1 text-xs font-medium"
                            >
                              <FiX size={12} />
                            </button>
                          </div>
                        )}
                        {payment.status !== 'pending' && payment.adminNotes && (
                          <div className="text-xs text-gray-500 italic truncate">{payment.adminNotes}</div>
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
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-6 text-center text-gray-500">
            No reported reviews at this time.
          </div>
        );
      case 'roommates':
        return (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-6 text-center text-gray-500">
            No roommate posts require moderation.
          </div>
        );
      case 'listings':
      default:
        return (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/20 flex justify-between items-center bg-white/60">
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
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium shadow-sm"
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
              <table className="w-full divide-y divide-white/20">
                <thead className="bg-white/40">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-2/5">Listing</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-1/5">Owner</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-1/5">Rent</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider w-1/5">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white/30 divide-y divide-white/20">
                  {listings.map((listing) => (
                    <tr key={listing._id} className="hover:bg-white/50 transition-colors">
                      <td className="px-3 py-3">
                        <div className="max-w-xs">
                          <div className="text-sm font-medium text-gray-900 truncate">{listing.title}</div>
                          <div className="text-xs text-gray-500">{listing.accommodationType} · {listing.capacity} guests</div>
                          <div className="text-xs text-gray-400 truncate">{listing.address}</div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-sm text-gray-900 truncate">
                          {listing.ownerId?.firstName} {listing.ownerId?.lastName}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{listing.ownerId?.email}</div>
                      </td>
                      <td className="px-3 py-3 text-sm">
                        <div className="text-gray-900 font-medium">Rs. {listing.monthlyRent?.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">per month</div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex flex-col gap-1">
                          <button 
                            onClick={() => handleViewListing(listing)}
                            className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1 text-xs font-medium"
                          >
                            <FiEye size={12} /> View
                          </button>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => handleApproveListing(listing._id)}
                              className="text-green-600 hover:text-green-900 px-2 py-1 rounded bg-green-50 hover:bg-green-100 transition-colors flex items-center justify-center gap-1 text-xs font-medium"
                            >
                              <FiCheck size={12} /> 
                            </button>
                            <button 
                              onClick={() => handleRejectListing(listing._id)}
                              className="text-red-600 hover:text-red-900 px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center gap-1 text-xs font-medium"
                            >
                              <FiX size={12} />
                            </button>
                          </div>
                        </div>
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
    <div 
      className="min-h-screen font-sans bg-fixed bg-cover bg-center flex"
      style={{ 
        backgroundImage: 'linear-gradient(rgba(243, 244, 246, 0.3), rgba(243, 244, 246, 0.4)), url(/sliit.jpg)',
        fontFamily: "'Plus Jakarta Sans',sans-serif" 
      }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blob { 0%,100%{transform:translate(0px,0px) scale(1)} 33%{transform:translate(30px,-50px) scale(1.1)} 66%{transform:translate(-20px,20px) scale(0.9)} }
      `}</style>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white/90 backdrop-blur-xl border-r border-white/30 transition-all duration-300 ease-in-out shadow-xl`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FiShield className="w-5 h-5 text-white" />
                </div>
                {sidebarOpen && (
                  <div>
                    <h2 className="font-bold text-[#0b2b56] text-lg">SLIIT Nest</h2>
                    <p className="text-xs text-gray-500">Admin Panel</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-white/50 transition-colors"
              >
                <FiGrid className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-1">
            <Link
              to="/"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                location.pathname === '/' 
                  ? 'bg-[#0b2b56] text-white shadow-md' 
                  : 'text-gray-700 hover:bg-white/60'
              }`}
            >
              <FiHome className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">Home</span>}
            </Link>

            <button
              onClick={() => setActiveTab('payments')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                activeTab === 'payments' 
                  ? 'bg-[#0b2b56] text-white shadow-md' 
                  : 'text-gray-700 hover:bg-white/60'
              }`}
            >
              <FiCreditCard className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">Payments</span>}
            </button>

            <button
              onClick={() => setActiveTab('listings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                activeTab === 'listings' 
                  ? 'bg-[#0b2b56] text-white shadow-md' 
                  : 'text-gray-700 hover:bg-white/60'
              }`}
            >
              <FiGrid className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">Listings</span>}
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                activeTab === 'reviews' 
                  ? 'bg-[#0b2b56] text-white shadow-md' 
                  : 'text-gray-700 hover:bg-white/60'
              }`}
            >
              <FiFileText className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">Reviews</span>}
            </button>

            <button
              onClick={() => setActiveTab('roommates')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                activeTab === 'roommates' 
                  ? 'bg-[#0b2b56] text-white shadow-md' 
                  : 'text-gray-700 hover:bg-white/60'
              }`}
            >
              <FiUsers className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">Roommates</span>}
            </button>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-white/20 space-y-1">
            <Link
              to="/dashboard"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-gray-700 hover:bg-white/60`}
            >
              <FiSettings className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">User Dashboard</span>}
            </Link>
            <button
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-red-600 hover:bg-red-50`}
            >
              <FiLogOut className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <header className="bg-white/90 backdrop-blur-xl border-b border-white/30 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[#0b2b56]">
                  {activeTab === 'payments' ? 'Payment Management' : 
                   activeTab === 'listings' ? 'Listing Management' :
                   activeTab === 'reviews' ? 'Review Management' :
                   activeTab === 'roommates' ? 'Roommate Management' :
                   'Admin Dashboard'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">Manage and monitor SLIIT Nest platform</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-500">
                  Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
                </div>
                <button className="p-2 rounded-lg hover:bg-white/50 transition-colors">
                  <FiRefreshCw className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Stats row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/50 flex items-center gap-4" style={{ animation: "fadeUp 0.5s ease both", animationDelay: `${idx * 0.1}s` }}>
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

          {/* Tab Content */}
          <div>
            {renderTabContent()}
          </div>
        </main>
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

}

export default AdminDashboard;
