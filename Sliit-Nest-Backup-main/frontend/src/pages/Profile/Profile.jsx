import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import {
  FiUser, FiMail, FiShield, FiArrowLeft, FiPhone,
  FiMapPin, FiCalendar, FiCheckCircle,
  FiAlertCircle, FiEdit3, FiGrid, FiInfo
} from 'react-icons/fi';
import MyRoommatePosts from './MyRoommatePosts';

/* ─── Tabs config ──────────────────────────────────────────── */
const TABS = [
  { id: 'info',    label: 'Personal Info',  icon: <FiUser size={15} /> },
  { id: 'account', label: 'Account Status', icon: <FiShield size={15} /> },
  { id: 'posts',   label: 'My Posts',       icon: <FiGrid size={15} /> },
];

/* ─── Field card ───────────────────────────────────────────── */
const Field = ({ label, value, icon, locked }) => (
  <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80 shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-200">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">{label}</span>
      {locked && (
        <span className="text-[9px] font-semibold text-amber-500 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">locked</span>
      )}
    </div>
    <div className="flex items-center gap-2">
      <span className="text-slate-400 shrink-0">{icon}</span>
      <span className="text-sm font-semibold text-slate-700 truncate">{value || '—'}</span>
    </div>
  </div>
);

/* ─── Status pill ──────────────────────────────────────────── */
const StatusPill = ({ ok, label, sublabel, icon }) => (
  <div className={`flex items-center gap-3 p-4 rounded-2xl border ${ok
    ? 'bg-emerald-50/80 border-emerald-200'
    : 'bg-amber-50/80 border-amber-200'
  }`}>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${ok ? 'bg-emerald-100' : 'bg-amber-100'}`}>
      {icon}
    </div>
    <div>
      <p className={`text-xs font-bold ${ok ? 'text-emerald-700' : 'text-amber-700'}`}>{label}</p>
      <p className={`text-xs font-medium mt-0.5 ${ok ? 'text-emerald-500' : 'text-amber-500'}`}>{sublabel}</p>
    </div>
    <div className="ml-auto shrink-0">
      {ok
        ? <FiCheckCircle size={18} className="text-emerald-500" />
        : <FiAlertCircle size={18} className="text-amber-500" />
      }
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════ */
const Profile = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('info');

  /* ── Loading state ── */
  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-fixed bg-cover bg-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(243,244,246,0.3),rgba(243,244,246,0.4)),url(/sliit.jpg)',
          fontFamily: "'Plus Jakarta Sans',sans-serif",
        }}
      >
        <div className="text-center bg-white/70 backdrop-blur-xl rounded-3xl p-10 shadow-xl border border-white/60">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-blue-50">
            <svg className="w-7 h-7 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="text-sm font-bold text-slate-600">Loading your profile…</p>
        </div>
      </div>
    );
  }

  const initials = [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join('').toUpperCase() || 'U';
  const fullName  = [user.firstName, user.lastName].filter(Boolean).join(' ');

  return (
    <div
      className="min-h-screen bg-fixed bg-cover bg-center"
      style={{
        backgroundImage: 'linear-gradient(rgba(243,244,246,0.3),rgba(243,244,246,0.4)),url(/sliit.jpg)',
        fontFamily: "'Plus Jakarta Sans',sans-serif",
      }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        .fade-up { animation: fadeUp 0.5s ease both; }
        .shimmer-text {
          background: linear-gradient(90deg,#1e3a8a,#2563eb,#0ea5e9,#2563eb,#1e3a8a);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 py-10 fade-up">

        {/* ── TOP NAV BAR ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">SLIIT Nest</p>
            <h1 className="text-2xl font-extrabold text-slate-800">Student Profile</h1>
          </div>
          <Link
            to="/roommates"
            className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl bg-white/70 backdrop-blur-sm border border-white/80 text-[#0b2b56] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <FiArrowLeft size={14} /> Back to Roommates
          </Link>
        </div>

        {/* ── MAIN LAYOUT: Sidebar + Content ── */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ════ LEFT SIDEBAR ════ */}
          <motion.div
            initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full lg:w-80 shrink-0 space-y-4"
          >
            {/* Avatar Card */}
            <div className="relative rounded-3xl overflow-hidden border border-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.08)] bg-white/70 backdrop-blur-xl">
              {/* Banner */}
              <div
                className="h-28 relative"
                style={{ background: 'linear-gradient(135deg,#0b2b56 0%,#1e40af 50%,#0ea5e9 100%)' }}
              >
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 20px 20px,white 1.5px,transparent 0)',
                    backgroundSize: '28px 28px',
                  }}
                />
                <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 320 20" preserveAspectRatio="none">
                  <path d="M0,20 Q160,0 320,20 L320,20 L0,20 Z" fill="rgba(255,255,255,0.7)" />
                </svg>
              </div>

              {/* Avatar */}
              <div className="px-6 pb-6 -mt-10">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white border-4 border-white shadow-lg"
                    style={{ background: 'linear-gradient(135deg,#1e40af,#2563eb)' }}
                  >
                    {initials}
                  </div>
                  {user.isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-sm">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <h2 className="text-lg font-extrabold shimmer-text mb-0.5">{fullName || 'Student'}</h2>
                  <p className="text-xs text-slate-400 font-medium mb-3">{user.email}</p>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      <FiShield size={11} /> {user.role}
                    </span>
                    {user.isVerified && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <FiCheckCircle size={11} /> Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Info Card */}
            <div className="rounded-3xl border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.06)] bg-white/70 backdrop-blur-xl p-5 space-y-3">
              <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">Quick Info</p>
              {[
                { icon: <FiPhone size={14} />,    label: 'Phone',   val: user.phoneNumber },
                { icon: <FiMapPin size={14} />,   label: 'Address', val: user.address },
                { icon: <FiCalendar size={14} />, label: 'Age',     val: user.age ? `${user.age} years` : null },
                { icon: <FiUser size={14} />,     label: 'Gender',  val: user.gender },
              ].map(({ icon, label, val }) => (
                <div key={label} className="flex items-center gap-3 text-sm">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">{icon}</div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-slate-700 truncate">{val || '—'}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Member Card */}
            <div
              className="rounded-3xl p-5 flex items-center gap-3 border border-blue-800/20 shadow-[0_8px_24px_rgba(11,43,86,0.2)]"
              style={{ background: 'linear-gradient(135deg,#0b2b56,#1e40af)' }}
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0">🏅</div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-extrabold text-sm">SLIIT Nest Member</p>
                <p className="text-blue-300 text-xs truncate">{user.role} · Active</p>
              </div>
              <div className="flex gap-px shrink-0">
                {[1,2,3,4,5].map(s => <span key={s} className="text-yellow-300 text-xs">★</span>)}
              </div>
            </div>
          </motion.div>

          {/* ════ RIGHT CONTENT PANEL ════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1 min-w-0"
          >
            {/* Tab Bar */}
            <div className="flex gap-1.5 p-1.5 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/70 shadow-sm mb-6">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-[#0b2b56] text-white shadow-md'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Panels */}
            <AnimatePresence mode="wait">

              {/* ── PERSONAL INFO TAB ── */}
              {activeTab === 'info' && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#0b2b56] to-teal-400"></div>
                      <h3 className="text-base font-extrabold text-slate-700">Personal Information</h3>
                    </div>
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <FiInfo size={12} /> Your profile details
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="First Name" value={user.firstName} icon={<FiUser size={14} />} />
                    <Field label="Last Name"  value={user.lastName}  icon={<FiUser size={14} />} />
                  </div>

                  <Field label="Email Address" value={user.email} icon={<FiMail size={14} />} locked />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Phone Number" value={user.phoneNumber} icon={<FiPhone size={14} />} />
                    <Field label="Address"       value={user.address}    icon={<FiMapPin size={14} />} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Gender" value={user.gender}                           icon={<FiUser size={14} />} />
                    <Field label="Age"    value={user.age ? `${user.age} years` : null} icon={<FiCalendar size={14} />} />
                  </div>

                  <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-700 text-xs font-semibold">
                    <FiEdit3 size={14} className="shrink-0" />
                    To update your information, visit your account settings.
                  </div>
                </motion.div>
              )}

              {/* ── ACCOUNT STATUS TAB ── */}
              {activeTab === 'account' && (
                <motion.div
                  key="account"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 px-1 mb-1">
                    <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#0b2b56] to-teal-400"></div>
                    <h3 className="text-base font-extrabold text-slate-700">Account Status</h3>
                  </div>

                  <div className="space-y-3">
                    <StatusPill
                      ok={true}
                      icon="🎓"
                      label={`Role: ${user.role}`}
                      sublabel="Your assigned platform role"
                    />
                    <StatusPill
                      ok={!!user.isVerified}
                      icon="✉️"
                      label={user.isVerified ? 'Email Verified' : 'Email Not Verified'}
                      sublabel={user.isVerified ? 'Your email address is confirmed' : 'Please check your inbox to verify'}
                    />
                    <StatusPill
                      ok={true}
                      icon="✅"
                      label="Profile Active"
                      sublabel="Your profile is visible to others"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Member Since', value: '2024',       icon: '📅' },
                      { label: 'Platform',     value: 'SLIIT Nest', icon: '🏠' },
                      { label: 'Status',       value: 'Active',     icon: '🟢' },
                    ].map(s => (
                      <div key={s.label} className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80 text-center">
                        <span className="text-xl">{s.icon}</span>
                        <p className="text-xs font-semibold text-slate-500">{s.label}</p>
                        <p className="text-sm font-extrabold text-slate-700">{s.value}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── MY POSTS TAB ── */}
              {activeTab === 'posts' && (
                <motion.div
                  key="posts"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-2 px-1 mb-5">
                    <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#0b2b56] to-teal-400"></div>
                    <h3 className="text-base font-extrabold text-slate-700">My Roommate Posts</h3>
                  </div>
                  {user.role === 'Student'
                    ? <MyRoommatePosts />
                    : (
                      <div className="text-center py-16 rounded-3xl bg-white/60 border border-white/70 backdrop-blur-xl">
                        <span className="text-4xl block mb-3">🏠</span>
                        <p className="text-slate-500 font-semibold text-sm">Only students can manage roommate posts.</p>
                      </div>
                    )
                  }
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Profile;