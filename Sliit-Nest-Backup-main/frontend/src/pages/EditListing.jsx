import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import PreviewModal from '../components/Modals/PreviewModal';
import { FiUpload } from 'react-icons/fi';

const FACILITIES_LIST = [
  'WiFi', 'Air Conditioning', 'Attached Bathroom',
  'Kitchen', 'Parking', 'Laundry',
  'Security', 'Furniture', 'Hot Water',
  'Power Backup', 'CCTV', 'Garden'
];

const EditListing = () => {
  const { id } = useParams();
  const { register, handleSubmit, watch, formState: { errors }, setValue, reset } = useForm({
    defaultValues: {
      facilities: [],
    }
  });

  const [loading, setLoading] = useState(true);

  // existingPhotos stores paths to images on the server e.g., "/uploads/..."
  const [existingPhotos, setExistingPhotos] = useState([]);
  // photosArr stores objects like: { file: File, url: 'blob:...' } for NEW photos
  const [photosArr, setPhotosArr] = useState([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState(null);
  const navigate = useNavigate();

  const currentFormValues = watch();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const { data } = await api.get(`/listings/${id}`);
        const listing = data.data;
        // set form values
        reset({
          title: listing.title,
          accommodationType: listing.accommodationType,
          capacity: listing.capacity,
          monthlyRent: listing.monthlyRent,
          contactNumber: listing.contactNumber,
          address: listing.address,
          description: listing.description || '',
          facilities: listing.facilities || []
        });

        // existing photos format is `/uploads/...`, we store them directly
        setExistingPhotos(listing.photos || []);
      } catch (error) {
        toast.error('Failed to fetch listing details');
        navigate('/listings');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id, reset, navigate]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      if (existingPhotos.length + photosArr.length + files.length > 10) {
        toast.error('Maximum 10 photos allowed across existing and new uploads.');
        return;
      }

      const newPhotos = files.map(file => ({
        file,
        url: URL.createObjectURL(file) // blob URL for preview
      }));
      setPhotosArr([...photosArr, ...newPhotos]);
    }
  };

  const removeNewPhoto = (index) => {
    const photoToRemove = photosArr[index];
    URL.revokeObjectURL(photoToRemove.url); // Clean up memory
    const newArray = photosArr.filter((_, i) => i !== index);
    setPhotosArr(newArray);
  };

  const removeExistingPhoto = (index) => {
    const newArray = existingPhotos.filter((_, i) => i !== index);
    setExistingPhotos(newArray);
  };

  const onSubmit = async (data) => {
    if (existingPhotos.length === 0 && photosArr.length === 0) {
      toast.error('Please add at least 1 photo.');
      return;
    }

    // Create FormData for multipart form
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('accommodationType', data.accommodationType);
    formData.append('capacity', data.capacity);
    formData.append('monthlyRent', data.monthlyRent);
    formData.append('contactNumber', data.contactNumber);
    formData.append('address', data.address);
    formData.append('description', data.description || '');

    if (data.facilities) {
      data.facilities.forEach(f => formData.append('facilities[]', f));
    }

    // Append existing photos
    if (existingPhotos.length > 0) {
      existingPhotos.forEach(photoPath => {
        formData.append('existingPhotos', photoPath);
      });
    } else {
      // Explicitly show we removed all existing photos
      formData.append('existingPhotos', '');
    }

    // Append new photos
    photosArr.forEach(photo => {
      formData.append('photos', photo.file);
    });

    try {
      await api.patch(`/listings/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Listing Updated Successfully!', { position: 'top-right' });
      navigate('/listings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update listing');
    }
  };

  const handlePreviewBtnClick = (e) => {
    e.preventDefault();
    setIsPreviewOpen(true);
  };

  const getFullURL = (path) => path.startsWith('http') ? path : `http://localhost:5000${path}`;

  const allPreviewPhotos = [
    ...existingPhotos.map(p => getFullURL(p)),
    ...photosArr.map(p => p.url)
  ];

  if (loading) return <div className="flex justify-center p-10">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-6">
        <button type="button" onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 text-sm font-medium mb-3">
          &larr; Back to My Listings
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Boarding</h1>
        <p className="text-gray-500 mt-1">Update the details of your listing</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Basic Information</h2>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Listing Title *</label>
            <input
              type="text"
              placeholder="e.g., Cozy Single Room near University"
              className={`w-full p-3 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 ${errors.title ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-400'}`}
              {...register('title', { required: 'Listing Title is required' })}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Accommodation Type *</label>
              <select
                className={`w-full p-3 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 ${errors.accommodationType ? 'border-red-500' : 'border-gray-200 focus:ring-blue-100'}`}
                {...register('accommodationType', { required: 'Type is required' })}
              >
                <option value="">Select type</option>
                <option value="Single Room">Single Room</option>
                <option value="Shared Room">Shared Room</option>
                <option value="Annex/Portion">Annex/Portion</option>
                <option value="Apartment/Flat">Apartment/Flat</option>
                <option value="Hostel">Hostel</option>
                <option value="Studio">Studio</option>
                <option value="Other">Other</option>
              </select>
              {errors.accommodationType && <p className="text-red-500 text-xs mt-1">{errors.accommodationType.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Capacity (people) *</label>
              <input
                type="number" min="1"
                className={`w-full p-3 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 ${errors.capacity ? 'border-red-500' : 'border-gray-200 focus:ring-blue-100'}`}
                {...register('capacity', { required: 'Capacity is required', min: 1 })}
              />
              {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Monthly Rent (Rs.) *</label>
              <input
                type="number" placeholder="e.g., 15000" min="0"
                className={`w-full p-3 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 ${errors.monthlyRent ? 'border-red-500' : 'border-gray-200 focus:ring-blue-100'}`}
                {...register('monthlyRent', { required: 'Monthly rent is required', min: { value: 100, message: 'Need to show reasonable price' } })}
              />
              {errors.monthlyRent && <p className="text-red-500 text-xs mt-1">{errors.monthlyRent.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">WhatsApp Number *</label>
              <input
                type="text" placeholder="e.g., +94771234567 or 0771234567"
                className={`w-full p-3 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 ${errors.contactNumber ? 'border-red-500' : 'border-gray-200 focus:ring-blue-100'}`}
                {...register('contactNumber', {
                  required: 'WhatsApp number is required',
                  pattern: {
                    value: /^(?:\+94|0)[7]\d{8}$/,
                    message: 'Invalid Sri Lankan phone number (+947x / 07x)'
                  }
                })}
              />
              {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Address *</label>
            <input
              type="text" placeholder="Full address"
              className={`w-full p-3 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 ${errors.address ? 'border-red-500' : 'border-gray-200 focus:ring-blue-100'}`}
              {...register('address', { required: 'Address is required' })}
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
            <textarea
              placeholder="Describe your boarding, nearby facilities, rules, etc." rows="4"
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              {...register('description')}
            ></textarea>
          </div>
        </div>

        {/* Facilities */}
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-6">Facilities & Amenities</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {FACILITIES_LIST.map((facility) => (
              <label key={facility} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  value={facility}
                  {...register('facilities')}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700 text-sm">{facility}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Photos Upload Area */}
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center border-b pb-2 mb-4">
            <h2 className="text-xl font-bold text-gray-800">Photos *</h2>
            <span className="text-sm font-medium text-gray-500">{existingPhotos.length + photosArr.length} / 10 photos added</span>
          </div>

          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg mb-6 flex gap-3 text-sm">
            <FiUpload className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p><strong>Important:</strong> Add at least 1 high-quality photo to showcase your boarding. Images will auto-play when students hover on your listing card.</p>
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="file" multiple accept="image/*"
              id="file-upload" className="hidden"
              onChange={handleFileChange}
            />
            <label
              htmlFor="file-upload"
              className="bg-gray-100 hover:bg-gray-200 cursor-pointer text-gray-700 font-bold py-3 px-6 rounded-lg transition border border-gray-200 text-center flex-1"
            >
              Browse Files to Add More...
            </label>
          </div>

          {(existingPhotos.length > 0 || photosArr.length > 0) && (
            <div className="flex gap-4 mt-6 overflow-x-auto pb-2">
              {existingPhotos.map((photo, index) => (
                <div key={`existing-${index}`} className="relative w-32 h-32 flex-shrink-0 border rounded-lg overflow-hidden group">
                  <img src={getFullURL(photo)} alt={`Existing upload ${index}`} className="w-full h-full object-cover" />
                  <div className="absolute top-1 right-1 bg-black bg-opacity-70 text-white text-[10px] px-2 py-0.5 rounded">Existing</div>
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button type="button" onClick={(e) => { e.preventDefault(); setEnlargedImage(getFullURL(photo)); }} className="text-white text-sm bg-blue-600 px-3 py-1 rounded w-20">View</button>
                    <button type="button" onClick={() => removeExistingPhoto(index)} className="text-white text-sm bg-red-600 px-3 py-1 rounded w-20">Remove</button>
                  </div>
                </div>
              ))}
              {photosArr.map((photo, index) => (
                <div key={`new-${index}`} className="relative w-32 h-32 flex-shrink-0 border rounded-lg overflow-hidden group">
                  <img src={photo.url} alt={`New upload ${index}`} className="w-full h-full object-cover" />
                  <div className="absolute top-1 right-1 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded">New</div>
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button type="button" onClick={(e) => { e.preventDefault(); setEnlargedImage(photo.url); }} className="text-white text-sm bg-blue-600 px-3 py-1 rounded w-20">View</button>
                    <button type="button" onClick={() => removeNewPhoto(index)} className="text-white text-sm bg-red-600 px-3 py-1 rounded w-20">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex flex-col md:flex-row gap-4 pt-4">
          <button
            type="button"
            onClick={handlePreviewBtnClick}
            className="flex-1 border-2 border-gray-200 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-50 transition"
          >
            &#128065; Preview
          </button>
          <button
            type="submit"
            className="flex-[2] bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition"
          >
            Save Changes
          </button>
        </div>
      </form>

      {/* Mounting the Preview Modal */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        data={{
          ...currentFormValues,
          // Extract preview URLs for the modal 
          photos: allPreviewPhotos
        }}
      />

      {/* Image Enlarge Modal */}
      {enlargedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-90 cursor-pointer"
          onClick={() => setEnlargedImage(null)}
        >
          <button
            type="button"
            className="absolute top-6 right-8 text-white hover:text-gray-300 text-4xl font-bold"
            onClick={(e) => { e.stopPropagation(); setEnlargedImage(null); }}
          >
            &times;
          </button>
          <img
            src={enlargedImage}
            alt="Enlarged view"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default EditListing;
