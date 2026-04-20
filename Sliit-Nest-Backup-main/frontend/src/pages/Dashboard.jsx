import React, { useEffect, useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiClock, FiCheckCircle, FiEye, FiHome, FiAlertTriangle,
  FiCreditCard, FiSkipForward, FiPlus, FiList, FiTrendingUp,
  FiZap, FiChevronRight, FiDollarSign, FiActivity,
  FiPackage, FiBarChart2, FiSettings, FiBell, FiSearch,
  FiGrid, FiStar, FiArrowUpRight, FiX
} from 'react-icons/fi';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';

/* ─── Animated counter ───────────────────────────────────────── */
const Counter = ({ value }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.max(1, Math.ceil(value / 30));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}</span>;
};

/* ─── Stat Card ──────────────────────────────────────────────── */
const StatCard = ({ label, value, icon, bg, iconBg, iconColor, valueColor, border, delay = 0, badge }) => (
  <motion.div
    initial={{ opacity: 0, y: 28, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, delay, type: 'spring', stiffness: 120 }}
    whileHover={{ y: -5, boxShadow: '0 16px 40px rgba(37,99,235,0.13)', transition: { duration: 0.2 } }}
    className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-3 cursor-default group"
    style={{ background: bg, border: `1.5px solid ${border}` }}
  >
    {/* Subtle top shimmer */}
    <div className="absolute top-0 left-0 right-0 h-px"
      style={{ background: `linear-gradient(90deg, transparent, ${iconColor}50, transparent)` }} />
    {/* Decorative circle */}
    <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full opacity-10"
      style={{ background: iconColor, filter: 'blur(18px)' }} />

    <div className="flex items-start justify-between relative z-10">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold tracking-widest uppercase text-gray-500">{label}</p>
        {badge && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: `${iconColor}18`, color: iconColor }}>
            <FiArrowUpRight size={8} /> {badge}
          </span>
        )}
      </div>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: iconBg, color: iconColor, border: `1.5px solid ${iconColor}30` }}>
        {icon}
      </div>
    </div>
    <p className="text-4xl relative z-10 tracking-tight font-bold" style={{ color: valueColor }}>
      <Counter value={value} />
    </p>
  </motion.div>
);

/* ─── Status Badge ───────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const map = {
    Approved: { bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0' },
    Pending:  { bg: '#fef9c3', color: '#ca8a04', border: '#fde68a' },
    Rejected: { bg: '#fee2e2', color: '#dc2626', border: '#fecaca' },
  };
  const s = map[status] || { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' };
  return (
    <span className="px-3 py-1 text-xs font-bold rounded-full border"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}>
      {status}
    </span>
  );
};

/* ─── Quick Action Button ───────────────────────────────────── */
const ActionBtn = ({ to, icon, label, desc, color, bg, delay }) => (
  <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay, duration: 0.35 }}>
    <Link to={to}
      className="flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 group"
      style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color + '55'; e.currentTarget.style.background = bg; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
        style={{ background: color + '15', color }}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-gray-800">{label}</p>
        <p className="text-xs font-medium text-gray-500">{desc}</p>
      </div>
      <FiChevronRight size={13} className="ml-auto shrink-0 transition-colors text-gray-400" />
    </Link>
  </motion.div>
);

/* ══════════════════════════════════════════════════════════════ */
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, views: 0 });
  const [recentListings, setRecentListings] = useState([]);
  const [trialStatuses, setTrialStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const ownerName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Owner';
  const initials  = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('').toUpperCase() || 'O';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/listings/my-listings');
        const listings = data.data;
        setStats({
          total:    listings.length,
          approved: listings.filter(l => l.status === 'Approved').length,
          pending:  listings.filter(l => l.status === 'Pending').length,
          views:    listings.reduce((acc, curr) => acc + (curr.viewCount || 0), 0),
        });
        setRecentListings(listings);
        const trialRes = await api.get('/payments/user/trial-status');
        setTrialStatuses(trialRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePaymentClick = (id) => navigate('/listings/payment', { state: { listingId: id } });

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const filtered = recentListings.filter(listing => 
      listing.title?.toLowerCase().includes(query.toLowerCase()) ||
      listing.accommodationType?.toLowerCase().includes(query.toLowerCase()) ||
      listing.description?.toLowerCase().includes(query.toLowerCase()) ||
      listing.location?.toLowerCase().includes(query.toLowerCase()) ||
      listing.monthlyRent?.toString().includes(query)
    );
    
    setSearchResults(filtered);
  };

  const endTrial = async (id) => {
    try {
      await api.post(`/listings/${id}/end-trial`);
      toast.success('Free trial ended. Payment required.');
      const r = await api.get('/payments/user/trial-status');
      setTrialStatuses(r.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to end trial');
    }
  };

  const expiringListings = trialStatuses.filter(s => s.needsPayment || s.daysUntilExpiry <= 3);
  const approvalRate = stats.total ? Math.round((stats.approved / stats.total) * 100) : 0;
  const avgViews     = stats.total ? Math.round(stats.views / stats.total) : 0;

  return (
    <div className="min-h-screen bg-gray-50">

      <style>{`
        /* Subtle dot pattern */
        .dot-bg {
          background-image: radial-gradient(circle, #c7d7fb 1px, transparent 1px);
          background-size: 28px 28px;
        }

        /* Glass card */
        .card {
          background: #ffffff;
          border: 1.5px solid #e8eeff;
          border-radius: 20px;
          box-shadow: 0 2px 16px rgba(37,99,235,0.06);
        }

        /* Hover shimmer */
        .row-hover:hover { background: #f0f6ff; }

        @keyframes float-slow { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes pulse-badge { 0%,100%{opacity:1} 50%{opacity:0.5} }

        .nav-blur {
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1.5px solid #e8eeff;
        }

        .gradient-header {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 40%, #1e40af 100%);
        }

        .orange-pill {
          background: #fff7ed;
          color: #ea580c;
          border: 1.5px solid #fed7aa;
        }
      `}</style>

      {/* ══ BACKGROUND ══ */}
      <div className="fixed inset-0 pointer-events-none dot-bg" style={{ zIndex: 0, opacity: 0.5 }} />
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0,
        background: 'radial-gradient(ellipse 80% 50% at 20% -10%, rgba(37,99,235,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 100%, rgba(251,146,60,0.05) 0%, transparent 60%)' }} />

      {/* ══ TOP NAVBAR ══ */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative flex items-center justify-between px-6 py-3.5"
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
            style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', boxShadow: '0 4px 14px rgba(37,99,235,0.35)' }}>S</div>
          <div>
            <p className="text-sm leading-none font-bold text-gray-800">SLIIT Nest</p>
            <p className="text-[10px] font-bold tracking-widest text-gray-500">OWNER PORTAL</p>
          </div>
        </div>

        {/* Search pill */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all hover:border-blue-300 bg-gray-100 border border-gray-300"
        >
          <FiSearch size={13} />
          <input
            type="text"
            placeholder="Search listings…"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsSearching(true)}
            onBlur={() => setTimeout(() => setIsSearching(false), 200)}
            className="bg-transparent outline-none text-xs font-medium placeholder-gray-500 flex-1 min-w-[150px] text-gray-800"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX size={13} />
            </button>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2.5">
          <button className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-blue-50"
            style={{ background: '#f1f5f9', border: '1.5px solid #e2e8f0', color: '#64748b' }}>
            <FiBell size={15} />
            {expiringListings.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500">
                <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
              </span>
            )}
          </button>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl"
            style={{ background: '#f1f5f9', border: '1.5px solid #e2e8f0' }}>
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs text-white font-bold"
              style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)' }}>{initials}</div>
            <span className="text-xs font-semibold hidden sm:block text-gray-600">{ownerName.split(' ')[0]}</span>
          </div>
        </div>
      </motion.nav>

      {/* ══ MAIN CONTENT ══ */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── SEARCH RESULTS ── */}
        <AnimatePresence>
          {isSearching && searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="card overflow-hidden"
              style={{ maxHeight: '400px', overflowY: 'auto' }}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#e8eeff' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(to bottom,#2563eb,#1d4ed8)' }} />
                  <h2 className="text-sm font-bold text-gray-800">Search Results</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: '#eff6ff', color: '#2563eb', border: '1.5px solid #bfdbfe' }}>
                    {searchResults.length}
                  </span>
                </div>
                <button
                  onClick={() => handleSearch('')}
                  className="text-xs font-bold transition-colors hover:text-blue-700" 
                  style={{ color: '#2563eb' }}
                >
                  Clear <FiX size={13} className="inline ml-1" />
                </button>
              </div>

              <div>
                {searchResults.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 bg-blue-100 border border-blue-300">
                      <FiSearch size={20} className="text-blue-500" />
                    </div>
                    <p className="font-bold text-sm text-gray-600">No matches found</p>
                    <p className="text-xs mt-1 text-gray-500">Try searching with different keywords</p>
                  </div>
                ) : (
                  searchResults.map((listing, i) => {
                    const trialStatus = trialStatuses.find(ts => ts._id === listing._id);
                    const isOnTrial   = trialStatus?.paymentStatus === 'trial' && !trialStatus?.needsPayment;
                    return (
                      <motion.div key={listing._id}
                        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.2 }}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 px-6 py-3 border-b row-hover transition-colors duration-150 cursor-default"
                        style={{ borderColor: '#f1f5f9' }}
                      >
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-blue-100 border border-blue-300 text-blue-500">
                            <FiHome size={15} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate text-gray-800">{listing.title}</p>
                            <p className="text-xs mt-0.5 flex items-center gap-2.5 flex-wrap text-gray-500">
                              <span className="flex items-center gap-1"><FiPackage size={10} /> {listing.accommodationType}</span>
                              <span className="flex items-center gap-1"><FiDollarSign size={10} /> Rs. {listing.monthlyRent?.toLocaleString()}/mo</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                          <StatusBadge status={listing.status} />
                          {isOnTrial && (
                            <button onClick={() => endTrial(listing._id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all hover:scale-105 bg-orange-100 border-orange-300 text-orange-500">
                              <FiSkipForward size={10} /> End Trial
                            </button>
                          )}
                          <Link to="/listings"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border transition-all hover:scale-105 bg-blue-100 border-blue-300 text-blue-500">
                            View <FiChevronRight size={11} />
                          </Link>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── HERO GREETING BANNER ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}
          className="relative overflow-hidden rounded-3xl p-7 sm:p-8 gradient-header"
          style={{ boxShadow: '0 12px 40px rgba(37,99,235,0.28)' }}
        >
          {/* Decorative shapes */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10"
            style={{ background: 'white', filter: 'blur(2px)' }} />
          <div className="absolute bottom-0 right-32 w-40 h-40 rounded-full opacity-[0.07]"
            style={{ background: 'white' }} />
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }} />
          {/* Dot pattern overlay */}
          <div className="absolute inset-0 opacity-[0.08]"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 bg-gray-100 text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Dashboard Overview
              </div>
              <h1 className="text-3xl sm:text-4xl text-white font-bold">
                Good day, {ownerName} 👋
              </h1>
              <p className="text-sm mt-1.5 font-medium text-gray-300">
                Here's what's happening with your boardings today.
              </p>
            </div>
            <div className="flex gap-2.5 shrink-0">
              <Link to="/listings/add"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 bg-white text-blue-500 shadow-md">
                <FiPlus size={15} /> New Boarding
              </Link>
              <Link to="/listings"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 bg-gray-100 text-gray-600 border border-gray-300">
                <FiList size={15} /> All Listings
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Listings" value={stats.total}    delay={0.08}
            icon={<FiHome size={17} />}
            bg="bg-white" border="border-gray-300"
            iconBg="bg-blue-100" iconColor="text-blue-500" valueColor="text-gray-800"
            badge="All time" />
          <StatCard label="Approved"       value={stats.approved} delay={0.14}
            icon={<FiCheckCircle size={17} />}
            bg="bg-white" border="border-green-300"
            iconBg="bg-green-100" iconColor="text-green-500" valueColor="text-green-700"
            badge="Live now" />
          <StatCard label="Pending Review" value={stats.pending}  delay={0.20}
            icon={<FiClock size={17} />}
            bg="bg-white" border="border-orange-300"
            iconBg="bg-orange-100" iconColor="text-orange-500" valueColor="text-orange-700"
            badge="In queue" />
          <StatCard label="Total Views"    value={stats.views}    delay={0.26}
            icon={<FiEye size={17} />}
            bg="bg-white" border="border-blue-300"
            iconBg="bg-blue-100" iconColor="text-blue-500" valueColor="text-blue-700"
            badge="Impressions" />
        </div>

        {/* ── PAYMENT ALERTS ── */}
        <AnimatePresence>
          {expiringListings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
              className="rounded-2xl overflow-hidden border bg-red-100 border-red-300 shadow-md"
            >
              <div className="flex items-center gap-3 px-6 py-4 border-b border-red-300 bg-red-200">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-red-200">
                  <FiAlertTriangle size={15} className="text-red-500" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-red-800">Payment Required</h2>
                  <p className="text-xs font-medium text-red-600">{expiringListings.length} listing{expiringListings.length > 1 ? 's' : ''} need attention</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-200 text-red-500 border-red-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" style={{ animationDuration: '1.5s' }} />
                  Urgent
                </div>
              </div>
              <div className="p-4 space-y-2.5">
                {expiringListings.map(listing => (
                  <div key={listing._id} className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl px-4 py-3.5 border bg-white border-red-300">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate text-gray-800">{listing.title}</p>
                      {listing.needsPayment
                        ? <p className="text-xs mt-0.5 font-medium text-red-600">Trial expired — activate payment to continue listing</p>
                        : <p className="text-xs mt-0.5 font-medium text-orange-600">Expires in <strong>{listing.daysUntilExpiry}</strong> day{listing.daysUntilExpiry !== 1 ? 's' : ''}</p>
                      }
                    </div>
                    <button onClick={() => handlePaymentClick(listing._id)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shrink-0 transition-all hover:-translate-y-0.5 bg-red-500 text-white shadow-md">
                      <FiCreditCard size={12} /> Pay Now
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── TWO-COLUMN MAIN ── */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* LEFT — Recent Listings */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.32 }}
            className="flex-1 min-w-0 card overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#e8eeff' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(to bottom,#2563eb,#1d4ed8)' }} />
                <h2 className="text-sm font-bold text-gray-800">Recent Listings</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: '#eff6ff', color: '#2563eb', border: '1.5px solid #bfdbfe' }}>
                  {recentListings.length}
                </span>
              </div>
              <Link to="/listings" className="flex items-center gap-1 text-xs font-bold transition-colors hover:text-blue-700" style={{ color: '#2563eb' }}>
                View all <FiChevronRight size={13} />
              </Link>
            </div>

            <div>
              {loading ? (
                [1,2,3,4].map(n => (
                  <div key={n} className="px-6 py-4 flex items-center gap-4 animate-pulse border-b" style={{ borderColor: '#f1f5f9' }}>
                    <div className="w-10 h-10 rounded-xl shrink-0" style={{ background: '#f1f5f9' }} />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 rounded w-2/5" style={{ background: '#e2e8f0' }} />
                      <div className="h-2.5 rounded w-1/3" style={{ background: '#f1f5f9' }} />
                    </div>
                    <div className="h-6 w-20 rounded-full" style={{ background: '#f1f5f9' }} />
                  </div>
                ))
              ) : recentListings.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe' }}>
                    <FiHome size={28} style={{ color: '#93c5fd' }} />
                  </div>
                  <p className="font-bold text-sm text-gray-600">No listings yet</p>
                  <p className="text-xs mt-1 mb-5 text-gray-500">Add your first boarding to get started</p>
                  <Link to="/listings/add"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', boxShadow: '0 4px 16px rgba(37,99,235,0.3)' }}>
                    <FiPlus size={14} /> Add Boarding
                  </Link>
                </div>
              ) : (
                recentListings.map((listing, i) => {
                  const trialStatus = trialStatuses.find(ts => ts._id === listing._id);
                  const isOnTrial   = trialStatus?.paymentStatus === 'trial' && !trialStatus?.needsPayment;
                  return (
                    <motion.div key={listing._id}
                      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.38 + i * 0.07, duration: 0.3 }}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 px-6 py-4 border-b row-hover transition-colors duration-150 cursor-default"
                      style={{ borderColor: '#f1f5f9' }}
                    >
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', color: '#2563eb' }}>
                          <FiHome size={15} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate text-gray-800">{listing.title}</p>
                          <p className="text-xs mt-0.5 flex items-center gap-2.5 flex-wrap text-gray-500">
                            <span className="flex items-center gap-1"><FiPackage size={10} /> {listing.accommodationType}</span>
                            <span className="flex items-center gap-1"><FiDollarSign size={10} /> Rs. {listing.monthlyRent?.toLocaleString()}/mo</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap shrink-0">
                        <StatusBadge status={listing.status} />
                        {isOnTrial && (
                          <button onClick={() => endTrial(listing._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all hover:scale-105"
                            style={{ background: '#fff7ed', color: '#ea580c', borderColor: '#fed7aa' }}>
                            <FiSkipForward size={10} /> End Trial
                          </button>
                        )}
                        <Link to="/listings"
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border transition-all hover:scale-105"
                          style={{ background: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' }}>
                          View <FiChevronRight size={11} />
                        </Link>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* RIGHT SIDEBAR */}
          <motion.div
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.38 }}
            className="w-full lg:w-72 shrink-0 space-y-4"
          >
            {/* Quick Actions */}
            <div className="card overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b" style={{ borderColor: '#e8eeff' }}>
                <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(to bottom,#2563eb,#1d4ed8)' }} />
                <h2 className="text-sm font-bold text-gray-800">Quick Actions</h2>
              </div>
              <div className="p-3 space-y-1.5">
                <ActionBtn to="/listings/add" delay={0.42} icon={<FiPlus size={15} />}     label="Add New Boarding"  desc="List a new property"       color="#2563eb" bg="#eff6ff" />
                <ActionBtn to="/listings"     delay={0.46} icon={<FiList size={15} />}      label="Manage Listings"   desc="Edit or remove listings"   color="#16a34a" bg="#f0fdf4" />
                <ActionBtn to="/listings"     delay={0.50} icon={<FiBarChart2 size={15} />} label="View Analytics"    desc="Track views & performance" color="#4f46e5" bg="#eef2ff" />
                <ActionBtn to="/listings/add" delay={0.54} icon={<FiZap size={15} />}       label="Boost a Listing"   desc="Increase visibility fast"  color="#ea580c" bg="#fff7ed" />
                <ActionBtn to="/settings"     delay={0.58} icon={<FiSettings size={15} />}  label="Account Settings"  desc="Manage your profile"       color="#7c3aed" bg="#f5f3ff" />
              </div>
            </div>

            {/* Performance Panel */}
            <div className="rounded-2xl p-5 overflow-hidden relative border"
              style={{ background: 'linear-gradient(145deg,#1e3a8a 0%,#2563eb 50%,#1d4ed8 100%)', borderColor: 'rgba(37,99,235,0.3)', boxShadow: '0 8px 40px rgba(37,99,235,0.22)' }}>
              <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full opacity-15"
                style={{ background: 'white', filter: 'blur(40px)' }} />
              <div className="absolute inset-0 opacity-[0.06]"
                style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
              <div className="absolute bottom-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }} />

              <div className="flex items-center gap-2.5 mb-5 relative z-10">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)' }}>
                  <FiActivity size={14} className="text-white" />
                </div>
                <p className="text-sm text-white font-bold">Performance</p>
              </div>

              <div className="space-y-4 relative z-10">
                {[
                  { label: 'Approval Rate',       display: `${approvalRate}%`, pct: approvalRate,           color: '#4ade80', track: 'rgba(255,255,255,0.12)' },
                  { label: 'Avg Views / Listing', display: `${avgViews}`,      pct: Math.min(avgViews * 5, 100), color: '#fbbf24', track: 'rgba(255,255,255,0.12)' },
                ].map(({ label, display, pct, color, track }) => (
                  <div key={label}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold" style={{ color: 'rgba(219,234,254,0.7)' }}>{label}</span>
                      <span className="text-xs text-white">{display}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: track }}>
                      <motion.div className="h-full rounded-full"
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 1.1, delay: 0.75, ease: 'easeOut' }}
                        style={{ background: color, boxShadow: `0 0 8px ${color}80` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t grid grid-cols-2 gap-3 relative z-10" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
                {[
                  { label: 'Total Views', value: stats.views,    icon: '👁️', color: '#93c5fd' },
                  { label: 'Active Now',  value: stats.approved, icon: '✅', color: '#4ade80' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-3 text-center"
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                    <span className="text-xl block mb-1">{s.icon}</span>
                    <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[10px] font-semibold mt-0.5" style={{ color: 'rgba(219,234,254,0.55)' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Owner identity card */}
            <div className="rounded-2xl p-4 flex items-center gap-3 relative overflow-hidden border"
              style={{ background: '#fff7ed', borderColor: '#fed7aa', boxShadow: '0 4px 16px rgba(234,88,12,0.08)' }}>
              {/* Pattern */}
              <div className="absolute inset-0 opacity-[0.05]" style={{
                backgroundImage: 'repeating-linear-gradient(45deg,#ea580c 0,#ea580c 1px,transparent 0,transparent 50%)',
                backgroundSize: '8px 8px'
              }} />
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm text-white shrink-0 font-bold"
                style={{ background: 'linear-gradient(135deg,#ea580c,#dc2626)', boxShadow: '0 4px 14px rgba(234,88,12,0.35)' }}>
                {initials}
              </div>
              <div className="flex-1 min-w-0 relative z-10">
                <p className="text-sm truncate font-bold text-gray-800">{ownerName}</p>
                <p className="text-xs font-medium text-orange-500">Boarding Owner · Active</p>
              </div>
              <div className="flex gap-px shrink-0 relative z-10">
                {[1,2,3,4,5].map(s => <span key={s} style={{ color: '#f59e0b', fontSize: '11px' }}>★</span>)}
              </div>
            </div>

            {/* Tips card */}
            <div className="rounded-2xl p-4 border"
              style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#dcfce7' }}>
                  <FiStar size={13} style={{ color: '#16a34a' }} />
                </div>
                <p className="text-xs font-bold text-green-700">Pro Tip</p>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#166534' }}>
                Listings with photos get <strong>3× more views</strong>. Upload high-quality images to attract more tenants.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;