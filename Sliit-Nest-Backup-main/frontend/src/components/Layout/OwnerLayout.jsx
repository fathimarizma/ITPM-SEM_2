import React, { useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiList, FiLogOut, FiUser } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';

const OwnerLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col justify-between">
        <div>
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <img src="/logo.png" alt="SLIIT Nest Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="font-bold text-lg text-gray-800">SLIIT Nest</h1>
              <p className="text-xs text-gray-500">Owner Dashboard</p>
            </div>
          </div>
          
          <nav className="p-4 space-y-2">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-gray-100 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <FiHome /> Dashboard
            </NavLink>
            <NavLink
              to="/listings"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-gray-100 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <FiList /> My Listings
            </NavLink>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4 px-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold overflow-hidden shadow-inner">
               {user?.firstName ? user.firstName.charAt(0).toUpperCase() : <FiUser />}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 truncate max-w-[120px]">
                {user ? `${user.firstName} ${user.lastName}` : 'Owner'}
              </p>
              <p className="text-xs text-gray-500">{user?.role || 'Owner'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 w-full text-left font-medium text-gray-600 hover:text-red-600 transition-colors"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default OwnerLayout;
