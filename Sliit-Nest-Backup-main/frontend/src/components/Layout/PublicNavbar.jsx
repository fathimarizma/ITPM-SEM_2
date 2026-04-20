import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiUser, FiChevronDown, FiLogOut, FiUsers, FiBell, FiHeart } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axiosConfig';

const PublicNavbar = ({ activePage }) => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  // Pass redirectTo so students bounce back after login/register from roommates pages
  const authRedirectState = location.pathname.startsWith('/roommates') ? { redirectTo: '/roommates' } : undefined;
  const [showDropdown, setShowDropdown] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'Student') {
      const fetchReqs = async () => {
        try {
          const { data } = await api.get('/connections/my-requests');
          if (data && data.success) {
            setPendingCount(data.count);
          }
        } catch (err) {
          console.error('Failed to fetch request count');
        }
      };
      // Short delay or run immediately
      fetchReqs();
    }
  }, [isAuthenticated, user]);

  const handleLogout = async () => {
    setShowDropdown(false);
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <img src="/logo.png" alt="SLIIT Nest Logo" className="w-10 h-10 object-contain" />
        <div>
          <h1 className="text-xl font-bold text-[#0b2b56] leading-none">SLIIT Nest</h1>
          <p className="text-[10px] text-gray-400">Student Accommodation</p>
        </div>
      </Link>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
        <Link
          to="/"
          className={activePage === 'home' ? 'text-gray-900 font-bold border-b-2 border-[#0b2b56] pb-1' : 'hover:text-[#0b2b56]'}
        >
          Home
        </Link>
        <Link
          to="/search"
          className={activePage === 'boardings' ? 'text-gray-900 font-bold border-b-2 border-[#0b2b56] pb-1' : 'hover:text-[#0b2b56]'}
        >
          Find Boardings
        </Link>
        <Link
          to="/roommates"
          className={activePage === 'roommates' ? 'text-gray-900 font-bold border-b-2 border-[#0b2b56] pb-1' : 'hover:text-[#0b2b56]'}
        >
          Find Roommates
        </Link>
        <Link
          to="/about"
          className={activePage === 'about' ? 'text-gray-900 font-bold border-b-2 border-[#0b2b56] pb-1' : 'hover:text-[#0b2b56]'}
        >
          About
        </Link>
      </div>

      {/* Right Side: Auth Buttons or User Dropdown */}
      <div className="flex items-center gap-3">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-5">
            {/* Notification Bell */}
            {user.role === 'Student' && (
              <Link to="/roommates/matches" className="relative text-gray-500 hover:text-[#0b2b56] transition mt-1">
                <FiBell size={22} />
                {pendingCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </Link>
            )}

            <div className="relative">
              <button
              className="flex items-center gap-2 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors border border-gray-200"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="w-8 h-8 bg-[#0b2b56] rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                {user.firstName ? user.firstName.charAt(0).toUpperCase() : <FiUser size={14} />}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-gray-800 leading-tight">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-400 leading-tight">{user.role}</p>
              </div>
              <FiChevronDown
                className={`text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
                size={16}
              />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-800">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => { setShowDropdown(false); navigate('/profile'); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition"
                >
                  <FiUser size={14} /> My Profile
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => { setShowDropdown(false); navigate('/roommates/matches'); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition"
                >
                  <FiUsers size={14} /> My Matches
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => { setShowDropdown(false); navigate('/saved-boardings'); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition"
                >
                  <FiHeart size={14} /> Saved Boardings
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
                >
                  <FiLogOut size={14} /> Logout
                </button>
              </div>
            )}
          </div>
          </div>
        ) : (
          <>
            <Link
              to="/login"
              state={authRedirectState}
              className="px-5 py-2 text-sm font-medium border border-[#0b2b56] text-[#0b2b56] rounded-lg hover:bg-gray-50 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              state={authRedirectState}
              className="px-5 py-2 text-sm font-medium bg-[#0b2b56] text-white rounded-lg hover:bg-[#081f40] transition shadow-md"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default PublicNavbar;
