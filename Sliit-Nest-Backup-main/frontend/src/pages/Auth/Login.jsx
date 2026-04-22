import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiArrowRight, FiShield } from 'react-icons/fi';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const onSubmit = async (data) => {
    try {
      const resData = await login(data.email, data.password);
      
      toast.success('Logged in successfully!');
      
      // Determine redirection based on role if no `from` location exists
      if (location.state?.from) {
         navigate(from, { replace: true });
      } else {
         const role = resData.data.role;
         if (role === 'Owner') navigate('/dashboard', { replace: true });
         else if (role === 'Admin') navigate('/admin', { replace: true });
         // Students coming via /roommates flow land back there; default to /roommates
         else if (role === 'Student') navigate(location.state?.redirectTo || '/roommates', { replace: true });
         else navigate('/', { replace: true });
      }

    } catch (err) {
      if (err.response?.data?.requiresVerification) {
         toast.error(err.response.data.message);
         navigate('/verify-email', { state: { email: data.email } });
      } else {
         toast.error(err.response?.data?.message || 'Login failed');
      }
    }
  };

  return (
    <div 
      className="min-h-screen font-sans flex flex-col bg-fixed bg-cover bg-center"
      style={{ 
        backgroundImage: 'linear-gradient(rgba(243, 244, 246, 0.3), rgba(243, 244, 246, 0.4)), url(/sliit.jpg)',
        fontFamily: "'Plus Jakarta Sans',sans-serif" 
      }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blob { 0%,100%{transform:translate(0px,0px) scale(1)} 33%{transform:translate(30px,-50px) scale(1.1)} 66%{transform:translate(-20px,20px) scale(0.9)} }
      `}</style>

      {/* Navigation */}
      <nav className="sticky top-0 z-30 border-b backdrop-blur-xl bg-white/90" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 text-[#0b2b56] font-bold text-xl hover:text-blue-600 transition-colors">
              <FiShield className="w-6 h-6" />
              SLIIT Nest
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/register" className="text-sm font-medium text-[#0b2b56] hover:text-blue-600 transition-colors">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 relative z-10">

      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Welcome Back
          </h1>
          <p className="text-gray-600 text-lg">Sign in to continue to SLIIT Nest</p>
        </div>

        {/* Login form card */}
        <div className="max-w-xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8" style={{ animation: "fadeUp 0.5s ease both" }}>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            {/* Email field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FiMail className="w-4 h-4 text-blue-500" />
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  className={`w-full px-4 py-3 bg-white/50 border ${errors.email ? 'border-red-400/50' : 'border-gray-200'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm`}
                  placeholder="Enter your email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Must be a valid email address'
                    }
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FiLock className="w-4 h-4 text-blue-500" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`w-full px-4 py-3 pr-12 bg-white/50 border ${errors.password ? 'border-red-400/50' : 'border-gray-200'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm`}
                  placeholder="Enter your password"
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember me and forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-blue-600 bg-white/50 border-gray-300 rounded focus:ring-blue-500/50 focus:ring-2"
                />
                <span className="text-sm text-gray-700">Remember me</span>
              </label>
              <Link 
                to="#" 
                className="text-sm text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 flex items-center justify-center gap-2"
            >
              Sign In
              <FiArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/80 text-gray-500">New to SLIIT Nest?</span>
            </div>
          </div>

          {/* Sign up link */}
          <Link
            to="/register"
            state={location.state?.redirectTo ? { redirectTo: location.state.redirectTo } : undefined}
            className="w-full py-3 px-4 bg-white/50 hover:bg-white/70 border border-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm"
          >
            <FiUser className="w-4 h-4" />
            Create Account
          </Link>
        </div>

        {/* Footer text */}
        <p className="text-center text-gray-500 text-sm mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
