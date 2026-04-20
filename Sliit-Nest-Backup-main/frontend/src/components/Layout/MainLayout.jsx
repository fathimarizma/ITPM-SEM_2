import React, { useContext, useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { FiHome, FiList, FiSearch, FiShield, FiDownload, FiGlobe, FiCreditCard } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import Header from './Header';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';

const MainLayout = () => {
  const { user } = useContext(AuthContext);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const { data } = await api.get('/listings/my-listings');
      const listings = data.data || [];
      
      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.setTextColor(11, 43, 86);
      doc.text("SLIIT Nest - Boarding Owner Report", 14, 22);
      
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`Owner Name: ${user.firstName} ${user.lastName}`, 14, 32);
      doc.text(`Email: ${user.email}`, 14, 38);
      doc.text(`Total Active Listings: ${listings.length}`, 14, 44);
      doc.text(`Report Generated On: ${new Date().toLocaleDateString()}`, 14, 50);

      if (listings.length > 0) {
        const tableColumn = ["Title", "Type", "Capacity", "Rent (Rs)", "Status"];
        const tableRows = [];

        listings.forEach(listing => {
          const listingData = [
            listing.title,
            listing.accommodationType,
            `${listing.capacity} People`,
            listing.monthlyRent,
            listing.status || listing.availabilityStatus
          ];
          tableRows.push(listingData);
        });

        autoTable(doc, {
          startY: 60,
          head: [tableColumn],
          body: tableRows,
          theme: 'striped',
          headStyles: { fillColor: [11, 43, 86] }
        });
      }

      doc.save(`SLIIT_Nest_Owner_Report_${user.firstName}_${user.lastName}.pdf`);
      toast.success("Report Generated Successfully");
    } catch (error) {
       console.error("Error generating report:", error);
       toast.error("Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  const renderNavLinks = () => {
    const linkStyle = ({ isActive }) =>
      `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
        isActive ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-blue-100/50'
      }`;

    switch (user?.role) {
      case 'Owner':
        return (
          <>
            <NavLink to="/" className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-gray-600 hover:bg-blue-100/50">
              <FiGlobe /> Home
            </NavLink>
            <NavLink to="/dashboard" className={linkStyle}>
              <FiHome /> Dashboard
            </NavLink>
            <NavLink to="/listings" className={linkStyle}>
              <FiList /> My Listings
            </NavLink>
            <NavLink to="/listings/payment" className={linkStyle}>
              <FiCreditCard /> Make Payment
            </NavLink>
          </>
        );
      case 'Admin':
        return (
          <>
            <NavLink to="/" className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-gray-600 hover:bg-blue-100/50">
              <FiGlobe /> Home
            </NavLink>
            <NavLink to="/admin" className={linkStyle}>
              <FiShield /> Admin Dashboard
            </NavLink>
          </>
        );
      case 'Student':
      default:
        return (
          <>
            <NavLink to="/" className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-gray-600 hover:bg-blue-100/50">
              <FiGlobe /> Home
            </NavLink>
            <NavLink to="/search" className={linkStyle}>
              <FiSearch /> Search Boardings
            </NavLink>
          </>
        );
    }
  };

  return (
    <div className="flex bg-gray-50 h-screen font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-50 border-r border-blue-100 flex flex-col fixed inset-y-0 z-20">
        <div className="p-6 border-b border-blue-100 flex items-center gap-3">
          <img src="/logo.png" alt="SLIIT Nest" className="w-8 h-8 object-contain" fallback="M" onError={(e) => e.target.style.display='none'} />
          <h1 className="font-bold text-xl text-blue-600">SLIIT<span className="text-gray-800">Nest</span></h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {renderNavLinks()}
        </nav>

        {/* Generate Report Button at the bottom */}
        {user?.role === 'Owner' && (
          <div className="p-4 border-t border-blue-100 mt-auto">
            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-blue-200 rounded-lg text-blue-600 font-medium hover:bg-blue-100 hover:text-blue-700 transition shadow-sm"
            >
              <FiDownload /> {isGenerating ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64 min-w-0">
        <Header />
        
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
