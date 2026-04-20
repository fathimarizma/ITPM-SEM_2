import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../api/axiosConfig';
import { FiUpload, FiCreditCard, FiFileText, FiCheckCircle } from 'react-icons/fi';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const [paymentSlip, setPaymentSlip] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Get listing ID from navigation state
  const listingId = location.state?.listingId;

  useEffect(() => {
    if (listingId) {
      fetchListingDetails();
    } else {
      // No specific listing selected, fetch all listings that need payment
      fetchListingsNeedingPayment();
    }
  }, [listingId]);

  const fetchListingDetails = async () => {
    try {
      const response = await api.get(`/listings/my-listings`);
      const listingData = response.data.data.find(l => l._id === listingId);
      
      if (!listingData) {
        toast.error('Listing not found');
        navigate('/listings');
        return;
      }
      
      setListing(listingData);
    } catch (error) {
      toast.error('Failed to fetch listing details');
      navigate('/listings');
    } finally {
      setLoading(false);
    }
  };

  const fetchListingsNeedingPayment = async () => {
    try {
      const response = await api.get('/payments/user/trial-status');
      const listingsNeedingPayment = response.data.data.filter(l => l.needsPayment);
      
      if (listingsNeedingPayment.length === 0) {
        // Don't redirect, show a message instead
        setListing(null);
        setLoading(false);
        return;
      }
      
      // Auto-select the first listing that needs payment
      setListing({
        _id: listingsNeedingPayment[0]._id,
        title: listingsNeedingPayment[0].title,
        monthlyRent: 0 // Will be updated when we fetch full listing details
      });
      
      // Fetch full listing details
      const fullListingResponse = await api.get('/listings/my-listings');
      const fullListing = fullListingResponse.data.data.find(l => l._id === listingsNeedingPayment[0]._id);
      if (fullListing) {
        setListing(fullListing);
      }
    } catch (error) {
      toast.error('Failed to fetch listings');
      setListing(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.match(/image\/(jpeg|jpg|png)$/)) {
        toast.error('Please upload a valid image file (JPG, JPEG, or PNG)');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setPaymentSlip(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    if (!paymentSlip) {
      toast.error('Please upload a payment slip');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('listingId', listing._id);
      formData.append('paymentMethod', data.paymentMethod);
      formData.append('transactionId', data.transactionId);
      formData.append('amount', data.amount);
      formData.append('notes', data.notes || '');
      formData.append('paymentSlip', paymentSlip);

      const response = await api.post('/payments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Payment submitted successfully! Your listing will remain active once approved.');
      navigate('/listings');
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeSlip = () => {
    setPaymentSlip(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 text-sm font-medium mb-3">
          &larr; Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Complete Your Payment</h1>
        <p className="text-gray-500 mt-1">Submit your payment details to keep your listing active</p>
      </div>

      {loading ? (
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center">
          <p className="text-gray-500">Loading payment information...</p>
        </div>
      ) : listing ? (
        <>
          {/* Listing Information Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              <FiCreditCard className="inline mr-2" />
              Listing Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Listing Title:</span>
                <p className="font-medium text-gray-900">{listing.title}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Monthly Rent:</span>
                <p className="font-medium text-gray-900">Rs. {listing.monthlyRent ? listing.monthlyRent.toLocaleString() : 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Payment Amount:</span>
                <p className="font-medium text-blue-900">Rs. 1,000.00</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Status:</span>
                <p className="font-medium text-orange-600">Payment Required</p>
              </div>
            </div>
          </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Payment Method */}
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-6">Payment Information</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">Payment Method *</label>
            <select 
              className={`w-full p-3 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 ${errors.paymentMethod ? 'border-red-500' : 'border-gray-200 focus:ring-blue-100'}`}
              {...register('paymentMethod', { required: 'Payment method is required' })}
            >
              <option value="">Select payment method</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="online_banking">Online Banking</option>
              <option value="mobile_payment">Mobile Payment</option>
              <option value="cash_deposit">Cash Deposit</option>
            </select>
            {errors.paymentMethod && <p className="text-red-500 text-xs mt-1">{errors.paymentMethod.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Transaction ID *</label>
              <input 
                type="text" 
                placeholder="Enter transaction/reference ID"
                className={`w-full p-3 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 ${errors.transactionId ? 'border-red-500' : 'border-gray-200 focus:ring-blue-100'}`}
                {...register('transactionId', { required: 'Transaction ID is required' })}
              />
              {errors.transactionId && <p className="text-red-500 text-xs mt-1">{errors.transactionId.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Amount (Rs.) *</label>
              <input 
                type="number" 
                placeholder="1000"
                defaultValue="1000"
                className={`w-full p-3 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 ${errors.amount ? 'border-red-500' : 'border-gray-200 focus:ring-blue-100'}`}
                {...register('amount', { required: 'Amount is required', min: { value: 1, message: 'Amount must be greater than 0' } })}
              />
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">Additional Notes</label>
            <textarea 
              placeholder="Any additional information about your payment"
              rows="3"
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              {...register('notes')}
            ></textarea>
          </div>
        </div>

        {/* Payment Slip Upload */}
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-6">Payment Slip *</h2>
          
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg mb-6 flex gap-3 text-sm">
            <FiFileText className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p><strong>Important:</strong> Please upload a clear image of your payment slip or receipt.</p>
              <p className="mt-1">Accepted formats: JPG, JPEG, PNG (Max size: 5MB)</p>
            </div>
          </div>

          {!paymentSlip ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input 
                type="file" 
                accept="image/*"
                id="payment-slip" 
                className="hidden"
                onChange={handleFileChange}
              />
              <label 
                htmlFor="payment-slip"
                className="cursor-pointer"
              >
                <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Click to upload payment slip</p>
                <p className="text-gray-400 text-sm mt-1">or drag and drop</p>
              </label>
            </div>
          ) : (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FiFileText className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">{paymentSlip.name}</p>
                    <p className="text-sm text-gray-500">{(paymentSlip.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={removeSlip}
                  className="text-red-600 hover:text-red-800 font-medium text-sm"
                >
                  Remove
                </button>
              </div>
              
              {previewUrl && (
                <div className="mt-4">
                  <img 
                    src={previewUrl} 
                    alt="Payment slip preview" 
                    className="max-w-full h-auto rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-4">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 border-2 border-gray-200 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex-[2] bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <FiCheckCircle />
                Submit Payment & Complete Listing
              </>
            )}
          </button>
        </div>
      </form>
        </>
      ) : (
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center">
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <FiCheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Payment Required</h3>
            <p className="text-gray-600 mb-6">
              All your listings are currently paid up or within their free trial period. 
              You'll be notified here when a payment is needed.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate('/listings/add')}
                className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Create New Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;
