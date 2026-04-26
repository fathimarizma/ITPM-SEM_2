import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import PublicNavbar from '../../components/Layout/PublicNavbar';
import PublicFooter from '../../components/Layout/PublicFooter';

// Validation Schema
const schema = Yup.object().shape({
  bio: Yup.string().required('Bio is required').max(500, 'Max 500 characters'),
  genderPreference: Yup.string().required('Gender preference is required'),
  minBudget: Yup.number().typeError('Must be a number').required('Minimum budget required').positive('Must be positive'),
  maxBudget: Yup.number()
    .typeError('Must be a number')
    .required('Maximum budget required')
    .min(Yup.ref('minBudget'), 'Max budget cannot be less than min budget'),
  studyPreference: Yup.string().required('Study preference is required'),
  location: Yup.string().required('Location is required (e.g. Malabe)'),
  whatsappNumber: Yup.string()
    .matches(/^[0-9]{10}$/, 'Must be exactly 10 digits')
    .required('WhatsApp number is required'),
  ageCategory: Yup.string().required('Age category is required'),
});

const CreateRoommatePost = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        bio: data.bio,
        genderPreference: data.genderPreference,
        budgetRange: {
          min: data.minBudget,
          max: data.maxBudget
        },
        habits: {
          nonSmoker: data.nonSmoker || false,
          studyPreference: data.studyPreference
        },
        location: data.location,
        whatsappNumber: data.whatsappNumber,
        ageCategory: data.ageCategory
      };

      // Ensure user is authenticated properly - auth context handling would provide token in real scenario
      // For this implementation, axios interceptor should handle token. 
      await api.post('/roommates', payload);
      
      toast.success('Roommate profile created successfully!');
      navigate('/roommates');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  // Helper for animated error fields
  const ErrorMsg = ({ error }) => {
    if (!error) return null;
    return (
      <motion.p 
        initial={{ opacity: 0, x: -10 }} 
        animate={{ opacity: 1, x: 0 }} 
        className="text-[#dc2626] text-xs font-semibold mt-1"
      >
        {error.message}
      </motion.p>
    );
  };

  return (
    <div className="min-h-screen font-sans flex flex-col relative overflow-hidden">
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{ 
          backgroundImage: 'url(/green.jpg)', 
          filter: 'blur(5px)',
          transform: 'scale(1.1)' 
        }} 
      />
      <div className="fixed inset-0 z-0 bg-[#f3f4f6]/65" />

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <PublicNavbar activePage="roommates" />
        <div className="flex-1 py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="bg-[#0b2b56] p-6 text-white">
          <h1 className="text-2xl font-bold">Create Roommate Profile</h1>
          <p className="text-white/80 text-sm mt-1">Tell us about yourself and what you're looking for.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-[#1f2937] mb-2">Introduction / Bio</label>
            <textarea 
              {...register('bio')}
              rows={4}
              className={`w-full bg-[#f3f4f6] text-[#1f2937] text-sm py-3 px-4 rounded-lg focus:outline-none focus:ring-2 transition ${errors.bio ? 'focus:ring-[#dc2626] border border-[#dc2626]' : 'focus:ring-[#0b2b56] border-none'}`}
              placeholder="Hi, I'm a computing student looking for..."
            />
            <ErrorMsg error={errors.bio} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* WhatsApp Number */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#1f2937] mb-2">WhatsApp Number</label>
              <input 
                type="text" 
                {...register('whatsappNumber')}
                className={`w-full bg-[#f3f4f6] text-[#1f2937] text-sm py-3 px-4 rounded-lg focus:outline-none focus:ring-2 transition ${errors.whatsappNumber ? 'focus:ring-[#dc2626] border border-[#dc2626]' : 'focus:ring-[#0b2b56] border-none'}`}
                placeholder="e.g. 0771234567"
              />
              <ErrorMsg error={errors.whatsappNumber} />
            </div>
            {/* Gender Preference */}
            <div>
              <label className="block text-sm font-semibold text-[#1f2937] mb-2">Roommate Gender Preference</label>
              <select 
                {...register('genderPreference')}
                className={`w-full bg-[#f3f4f6] text-[#1f2937] text-sm py-3 px-4 rounded-lg focus:outline-none focus:ring-2 transition ${errors.genderPreference ? 'focus:ring-[#dc2626] border border-[#dc2626]' : 'focus:ring-[#0b2b56] border-none'}`}
              >
                <option value="">Select Prefix</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Any">Any</option>
              </select>
              <ErrorMsg error={errors.genderPreference} />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-[#1f2937] mb-2">Preferred Location</label>
              <input 
                type="text" 
                {...register('location')}
                className={`w-full bg-[#f3f4f6] text-[#1f2937] text-sm py-3 px-4 rounded-lg focus:outline-none focus:ring-2 transition ${errors.location ? 'focus:ring-[#dc2626] border border-[#dc2626]' : 'focus:ring-[#0b2b56] border-none'}`}
                placeholder="e.g. Walking distance to SLIIT"
              />
              <ErrorMsg error={errors.location} />
            </div>

            {/* Age Category */}
            <div>
              <label className="block text-sm font-semibold text-[#1f2937] mb-2">Age Group</label>
              <select 
                {...register('ageCategory')}
                className={`w-full bg-[#f3f4f6] text-[#1f2937] text-sm py-3 px-4 rounded-lg focus:outline-none focus:ring-2 transition ${errors.ageCategory ? 'focus:ring-[#dc2626] border border-[#dc2626]' : 'focus:ring-[#0b2b56] border-none'}`}
              >
                <option value="">Select Age Group</option>
                <option value="18 - 20">18 - 20</option>
                <option value="21 - 25">21 - 25</option>
                <option value="26 - 30">26 - 30</option>
                <option value="31 - 35">31 - 35</option>
                <option value="36 - 40">36 - 40</option>
                <option value="41 - 50">41 - 50</option>
                <option value="Above 50">Above 50</option>
              </select>
              <ErrorMsg error={errors.ageCategory} />
            </div>

            {/* Budget Range */}
            <div>
              <label className="block text-sm font-semibold text-[#1f2937] mb-2">Min Budget (LKR)</label>
              <input 
                type="number" 
                {...register('minBudget')}
                className={`w-full bg-[#f3f4f6] text-[#1f2937] text-sm py-3 px-4 rounded-lg focus:outline-none focus:ring-2 transition ${errors.minBudget ? 'focus:ring-[#dc2626] border border-[#dc2626]' : 'focus:ring-[#0b2b56] border-none'}`}
                placeholder="10000"
              />
              <ErrorMsg error={errors.minBudget} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1f2937] mb-2">Max Budget (LKR)</label>
              <input 
                type="number" 
                {...register('maxBudget')}
                className={`w-full bg-[#f3f4f6] text-[#1f2937] text-sm py-3 px-4 rounded-lg focus:outline-none focus:ring-2 transition ${errors.maxBudget ? 'focus:ring-[#dc2626] border border-[#dc2626]' : 'focus:ring-[#0b2b56] border-none'}`}
                placeholder="25000"
              />
              <ErrorMsg error={errors.maxBudget} />
            </div>

            {/* Habits - Study */}
            <div>
              <label className="block text-sm font-semibold text-[#1f2937] mb-2">Study Environment</label>
              <select 
                {...register('studyPreference')}
                className={`w-full bg-[#f3f4f6] text-[#1f2937] text-sm py-3 px-4 rounded-lg focus:outline-none focus:ring-2 transition ${errors.studyPreference ? 'focus:ring-[#dc2626] border border-[#dc2626]' : 'focus:ring-[#0b2b56] border-none'}`}
              >
                <option value="">Select Option</option>
                <option value="Quiet">Quiet/Solo study</option>
                <option value="Group">Group study</option>
                <option value="Flexible">Flexible</option>
              </select>
              <ErrorMsg error={errors.studyPreference} />
            </div>
            
            {/* Habits - Smoking */}
            <div className="flex items-center">
              <label className="flex items-center gap-3 text-sm font-semibold text-[#1f2937] cursor-pointer mt-6">
                <input 
                  type="checkbox" 
                  {...register('nonSmoker')}
                  className="w-5 h-5 text-[#0b2b56] focus:ring-[#0b2b56] rounded border-gray-300 transition"
                />
                Must be a non-smoker
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/roommates')}
              className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 bg-[#0b2b56] text-white text-sm font-bold rounded-lg shadow-md hover:bg-[#081f40] transition focus:outline-none flex justify-center items-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : 'Publish Profile'}
            </motion.button>
          </div>
        </form>
      </motion.div>
        </div>
        <div className="w-full mt-auto">
          <PublicFooter />
        </div>
      </div>
    </div>
  );
};

export default CreateRoommatePost;
