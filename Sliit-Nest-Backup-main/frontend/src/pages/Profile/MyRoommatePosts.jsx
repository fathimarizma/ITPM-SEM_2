import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiMapPin, FiDollarSign, FiEdit2, FiTrash2, FiPlus,
  FiUser, FiCalendar, FiAlertTriangle, FiX, FiCheck
} from 'react-icons/fi';
import api from '../../api/axiosConfig';

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteModal = ({ onConfirm, onCancel }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
  >
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.85, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full"
    >
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
          <FiAlertTriangle size={28} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Delete Post?</h3>
        <p className="text-sm text-gray-500">
          This action is permanent. Your roommate post will be removed and cannot be recovered.
        </p>
        <div className="flex gap-3 w-full mt-2">
          <button
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
          >
            <FiX size={15} /> Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-bold text-white transition shadow-md"
          >
            <FiCheck size={15} /> Yes, Delete
          </button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const MyRoommatePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null); // ID of post pending delete confirm
  const navigate = useNavigate();

  const fetchMyPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/roommates/mine');
      setPosts(data);
    } catch {
      toast.error('Failed to load your posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyPosts();
  }, [fetchMyPosts]);

  const handleDelete = async () => {
    try {
      await api.delete(`/roommates/${deletingId}`);
      toast.success('Post deleted successfully');
      setPosts(prev => prev.filter(p => p._id !== deletingId));
    } catch {
      toast.error('Failed to delete post');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white shadow rounded-2xl p-8 border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <h3 className="text-lg font-bold text-gray-900">My Roommate Posts</h3>
        <Link
          to="/roommates/add"
          className="inline-flex items-center gap-2 text-sm font-semibold bg-[#0b2b56] text-white px-4 py-2 rounded-lg hover:bg-[#081f40] transition shadow"
        >
          <FiPlus size={15} /> New Post
        </Link>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-4">
          {[1, 2].map(n => (
            <div key={n} className="animate-pulse bg-gray-100 rounded-2xl p-5 h-32" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && posts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-[#0b2b56]">
            <FiUser size={28} />
          </div>
          <p className="text-gray-500 text-sm">You haven't posted a roommate profile yet.</p>
          <Link
            to="/roommates/add"
            className="inline-flex items-center gap-2 text-sm font-bold bg-[#0b2b56] text-white px-6 py-2.5 rounded-xl hover:bg-[#081f40] transition shadow-md"
          >
            <FiPlus size={15} /> Post Your Profile
          </Link>
        </motion.div>
      )}

      {/* Post Cards */}
      {!loading && posts.length > 0 && (
        <div className="space-y-4">
          <AnimatePresence>
            {posts.map((post, i) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.07, type: 'spring', stiffness: 120 }}
                className="relative bg-gradient-to-br from-blue-50/60 to-indigo-50/60 border border-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all overflow-hidden group"
              >
                {/* Left accent bar */}
                <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-teal-400 via-blue-500 to-[#0b2b56] rounded-l-2xl opacity-70 group-hover:opacity-100 transition" />

                <div className="pl-3">
                  {/* Bio */}
                  <p className="text-sm text-gray-700 line-clamp-2 mb-3 font-medium">
                    "{post.bio}"
                  </p>

                  {/* Details row */}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1 bg-white/70 px-2.5 py-1 rounded-full border border-gray-100 shadow-sm">
                      <FiMapPin size={11} className="text-teal-500" /> {post.location}
                    </span>
                    <span className="flex items-center gap-1 bg-white/70 px-2.5 py-1 rounded-full border border-gray-100 shadow-sm">
                      <FiDollarSign size={11} className="text-blue-500" /> LKR {post.budgetRange?.min} – {post.budgetRange?.max}
                    </span>
                    <span className="flex items-center gap-1 bg-white/70 px-2.5 py-1 rounded-full border border-gray-100 shadow-sm">
                      <FiUser size={11} className="text-purple-500" /> {post.genderPreference}
                    </span>
                    <span className="flex items-center gap-1 bg-white/70 px-2.5 py-1 rounded-full border border-gray-100 shadow-sm">
                      <FiCalendar size={11} className="text-orange-400" /> {post.ageCategory || 'Any age'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate(`/roommates/edit/${post._id}`)}
                      className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-[#0b2b56] text-white rounded-lg hover:bg-[#081f40] transition shadow"
                    >
                      <FiEdit2 size={12} /> Edit
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setDeletingId(post._id)}
                      className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-red-50 text-red-500 border border-red-100 rounded-lg hover:bg-red-100 transition"
                    >
                      <FiTrash2 size={12} /> Delete
                    </motion.button>
                    <Link
                      to={`/roommates/${post._id}`}
                      className="ml-auto flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition"
                    >
                      View Public Post →
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deletingId && (
          <DeleteModal
            onConfirm={handleDelete}
            onCancel={() => setDeletingId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyRoommatePosts;
