import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axiosConfig';
import { FiCheckCircle } from 'react-icons/fi';

const VerifyEmail = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const email = location.state?.email;
  const redirectTo = location.state?.redirectTo;

  useEffect(() => {
    if (!email) {
      toast.error('No email found. Please login or register.');
      navigate('/login');
    }
  }, [email, navigate]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newCode = [...code];
    newCode[index] = element.value;
    setCode(newCode);

    // Focus next input
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const verify = async (e) => {
    e.preventDefault();
    const verificationCode = code.join('');
    if (verificationCode.length !== 6) {
      return toast.error('Please enter all 6 digits');
    }

    setLoading(true);
    try {
      await api.post('/auth/verifyemail', { email, code: verificationCode });
      toast.success('Email verified! You can now log in.');
      navigate('/login', { state: redirectTo ? { redirectTo } : undefined });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
      setCode(['', '', '', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    try {
      await api.post('/auth/resendcode', { email });
      toast.success('A new code has been sent to your email.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend code');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
          <FiCheckCircle size={32} />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900">Verify your email</h2>
        <p className="mt-2 text-sm text-gray-600">
          We sent a 6-digit code to <span className="font-medium text-gray-900">{email}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          <form onSubmit={verify} className="space-y-6">
            <div className="flex justify-center gap-2 mb-6">
              {code.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onFocus={(e) => e.target.select()}
                  className="w-12 h-14 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors disabled:bg-blue-400"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">Didn't receive the code? </span>
            <button
              onClick={resendCode}
              type="button"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Resend it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
