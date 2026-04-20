import React, { useContext, useState } from 'react';
import { FiBell, FiUser, FiChevronDown, FiLogOut } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, loading, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const notifications = 3; // Placeholder for unread count

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-end px-6 sticky top-0 z-10">
      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <button className="relative text-gray-500 hover:text-blue-600 transition-colors">
          <FiBell size={20} />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {notifications}
            </span>
          )}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button 
            className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded-lg transition-colors group"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="w-8 h-8 bg-[#0b2b56] rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-inner">
               {user?.firstName ? user.firstName.charAt(0).toUpperCase() : <FiUser size={14} />}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-bold text-gray-800 leading-tight">
                {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Owner' : (loading ? 'Loading...' : 'Guest')}
              </p>
              <p className="text-xs text-gray-400 font-medium leading-tight">
                {user?.role || (loading ? 'Please wait' : 'User')}
              </p>
            </div>
            <FiChevronDown className="text-gray-400 group-hover:text-gray-600 transition-colors" size={14} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-20">
              <button 
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/profile');
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <FiUser size={14} /> My Profile
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <FiLogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
