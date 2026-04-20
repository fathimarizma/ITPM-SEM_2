import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axiosConfig';
import { FiUser, FiMail, FiLock, FiShield, FiEye, FiEyeOff, FiPhone, FiMapPin, FiCalendar } from 'react-icons/fi';

const C = {
  primary:       "#2563eb",
  primaryDk:     "#1d4ed8",
  primaryLight:  "#eff6ff",
  primaryBorder: "#bfdbfe",
  secondary:     "#ffedd5",
  secondaryTxt:  "#c2410c",
  secondaryBdr:  "#fed7aa",
  accent:        "#dc2626",
  accentLight:   "#fef2f2",
  text:          "#1e293b",
  muted:         "#64748b",
  border:        "#e2e8f0",
  bg:            "#f8fafc",
  white:         "#ffffff",
  success:       "#16a34a",
  successLight:  "#f0fdf4",
  successBorder: "#bbf7d0",
};

const Badge = ({ children, color = C.primary, bg = C.primaryLight, border = C.primaryBorder }) => (
  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
    style={{ color, background: bg, border: `1px solid ${border}` }}>
    {children}
  </span>
);

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.redirectTo || '/roommates';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const password = watch('password');
  const selectedRole = watch('role');

  const ic = (err) =>
    `w-full rounded-xl px-3.5 py-2.5 text-sm font-medium border-2 outline-none transition-all duration-200 bg-white/50` +
    (err ? " border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
         : " border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50");

  const onSubmit = async (data) => {
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        address: data.address,
        gender: data.gender,
        age: parseInt(data.age, 10),
        email: data.email,
        password: data.password,
        role: data.role,
      };

      await api.post('/auth/register', payload);
      toast.success('Registration successful! Please verify your email.');
      navigate('/verify-email', { state: { email: data.email, redirectTo } });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Registration failed');
      console.error("Registration Error", err);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: C.bg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blob { 0%,100%{transform:translate(0px,0px) scale(1)} 33%{transform:translate(30px,-50px) scale(1.1)} 66%{transform:translate(-20px,20px) scale(0.9)} }
      `}</style>

      {/* ── TOP NAV ── */}
      <nav className="sticky top-0 z-30 border-b" style={{ background: C.white, borderColor: C.border }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs shadow-sm"
              style={{ background: C.primary, color: C.white }}>SN</div>
            <div className="hidden sm:block">
              <p className="font-extrabold text-sm leading-none" style={{ color: C.text }}>SLIIT Nest</p>
              <p className="text-xs" style={{ color: C.muted }}>Hostel Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border"
              style={{ borderColor: C.border }}>
              <span className="text-xs font-bold" style={{ color: C.muted }}>Already have an account?</span>
              <Link
                to="/login"
                state={{ redirectTo }}
                className="text-xs font-bold px-3 py-1.5 rounded-xl transition-all hover:-translate-y-0.5"
                style={{ color: C.primary, background: C.primaryLight }}>
                Log in
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── BACKGROUND DECORATION ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          style={{ background: C.primary, animation: 'blob 7s infinite' }}></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          style={{ background: C.secondaryTxt, animation: 'blob 7s infinite 2s' }}></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        <div className="max-w-xl mx-auto" style={{ animation: "fadeUp 0.5s ease both" }}>
          
          {/* ── HEADER ── */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg overflow-hidden"
              style={{ background: `linear-gradient(135deg,${C.primary},${C.primaryDk})` }}>
              <img src="/logo.png" alt="SLIIT Nest" className="w-full h-full object-contain p-2" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-3" style={{ color: C.text }}>
              Create Your Account
            </h1>
            <p className="text-sm font-semibold" style={{ color: C.muted }}>
              Join SLIIT Nest and find your perfect boarding home
            </p>
          </div>

          {/* ── REGISTRATION FORM ── */}
          <div className="rounded-3xl overflow-hidden border"
            style={{ background: C.white, borderColor: C.border, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            
            <div className="p-6 sm:p-8">
              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                
                {/* Personal Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 pb-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: C.primaryLight }}>
                      <FiUser className="w-4 h-4" style={{ color: C.primary }} />
                    </div>
                    <p className="text-sm font-extrabold" style={{ color: C.text }}>Personal Information</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold tracking-widest uppercase" style={{ color: C.text }}>
                        First Name
                      </label>
                      <input
                        type="text"
                        className={ic(errors.firstName)}
                        placeholder="John"
                        {...register('firstName', { 
                          required: 'First name is required',
                          maxLength: { value: 20, message: 'Max 20 characters' }
                        })}
                      />
                      {errors.firstName && <p className="text-xs font-semibold" style={{ color: C.accent }}>⚠ {errors.firstName.message}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold tracking-widest uppercase" style={{ color: C.text }}>
                        Last Name
                      </label>
                      <input
                        type="text"
                        className={ic(errors.lastName)}
                        placeholder="Doe"
                        {...register('lastName', { 
                          required: 'Last name is required',
                          maxLength: { value: 20, message: 'Max 20 characters' }
                        })}
                      />
                      {errors.lastName && <p className="text-xs font-semibold" style={{ color: C.accent }}>⚠ {errors.lastName.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold tracking-widest uppercase" style={{ color: C.text }}>
                        Phone Number
                      </label>
                      <input
                        type="text"
                        className={ic(errors.phoneNumber)}
                        placeholder="07xxxxxxxx"
                        {...register('phoneNumber', { 
                          required: 'Phone number is required',
                          pattern: { value: /^[0-9]{10}$/, message: 'Must be exactly 10 digits' }
                        })}
                      />
                      {errors.phoneNumber && <p className="text-xs font-semibold" style={{ color: C.accent }}>⚠ {errors.phoneNumber.message}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold tracking-widest uppercase" style={{ color: C.text }}>
                        Gender
                      </label>
                      <select
                        className={`${ic(errors.gender)} appearance-none`}
                        {...register('gender', { required: 'Please specify gender' })}
                      >
                        <option value="">Select gender...</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                      {errors.gender && <p className="text-xs font-semibold" style={{ color: C.accent }}>⚠ {errors.gender.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[1fr_120px] gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold tracking-widest uppercase" style={{ color: C.text }}>
                        Home Address
                      </label>
                      <input
                        type="text"
                        className={ic(errors.address)}
                        placeholder="123 Main St"
                        {...register('address', { 
                          required: 'Address is required',
                          maxLength: { value: 50, message: 'Max 50 characters' }
                        })}
                      />
                      {errors.address && <p className="text-xs font-semibold" style={{ color: C.accent }}>⚠ {errors.address.message}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold tracking-widest uppercase" style={{ color: C.text }}>
                        Age
                      </label>
                      <input
                        type="number"
                        className={ic(errors.age)}
                        placeholder="18"
                        {...register('age', { 
                          required: 'Age is required',
                          valueAsNumber: true,
                          min: { value: 10, message: 'Age must be between 10 and 100' },
                          max: { value: 100, message: 'Age must be between 10 and 100' }
                        })}
                      />
                      {errors.age && <p className="text-xs font-semibold" style={{ color: C.accent }}>⚠ {errors.age.message}</p>}
                    </div>
                  </div>
                </div>

                {/* Account Information Section */}
                <div className="space-y-4 pt-4 border-t" style={{ borderColor: C.border }}>
                  <div className="flex items-center gap-2.5 pb-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: C.primaryLight }}>
                      <FiShield className="w-4 h-4" style={{ color: C.primary }} />
                    </div>
                    <p className="text-sm font-extrabold" style={{ color: C.text }}>Account Information</p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold tracking-widest uppercase" style={{ color: C.text }}>
                      Email Address {selectedRole === 'Student' || !selectedRole ? '(@sliit.lk / @my.sliit.lk)' : ''}
                    </label>
                    <input
                      type="email"
                      className={ic(errors.email)}
                      placeholder={selectedRole === 'Student' || !selectedRole ? 'you@my.sliit.lk' : 'you@example.com'}
                      {...register('email', { 
                        required: 'Email is required',
                        validate: (value) => {
                          if (selectedRole === 'Student' || !selectedRole) {
                            return /^[a-zA-Z0-9._%+-]+@(my\.)?sliit\.lk$/.test(value) || 'Only @sliit.lk or @my.sliit.lk emails are allowed for Students';
                          }
                          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Must be a valid email address';
                        }
                      })}
                    />
                    {errors.email && <p className="text-xs font-semibold" style={{ color: C.accent }}>⚠ {errors.email.message}</p>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold tracking-widest uppercase" style={{ color: C.text }}>
                      Role
                    </label>
                    <select
                      className={`${ic(errors.role)} appearance-none`}
                      {...register('role', { required: 'Please select a role' })}
                    >
                      <option value="">Select a role...</option>
                      <option value="Student">Student</option>
                      <option value="Owner">Boarding Owner</option>
                    </select>
                    {errors.role && <p className="text-xs font-semibold" style={{ color: C.accent }}>⚠ {errors.role.message}</p>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold tracking-widest uppercase" style={{ color: C.text }}>
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`${ic(errors.password)} pr-10`}
                        placeholder="••••••••"
                        {...register('password', { 
                          required: 'Password is required',
                          minLength: { value: 6, message: 'Minimum 6 characters' }
                        })}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs font-semibold" style={{ color: C.accent }}>⚠ {errors.password.message}</p>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold tracking-widest uppercase" style={{ color: C.text }}>
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className={`${ic(errors.confirmPassword)} pr-10`}
                        placeholder="••••••••"
                        {...register('confirmPassword', { 
                          required: 'Please confirm password',
                          validate: value => value === password || 'Passwords do not match'
                        })}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-xs font-semibold" style={{ color: C.accent }}>⚠ {errors.confirmPassword.message}</p>}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                    style={{ 
                      background: `linear-gradient(135deg,${C.primary},${C.primaryDk})`,
                      boxShadow: `0 6px 20px rgba(37,99,235,0.28)` 
                    }}>
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ── FOOTER INFO ── */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-4 text-xs font-semibold" style={{ color: C.muted }}>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full" style={{ background: C.success }}></span>
                <span>Secure Registration</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full" style={{ background: C.primary }}></span>
                <span>OTP Verification</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full" style={{ background: C.secondaryTxt }}></span>
                <span>Student Friendly</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
