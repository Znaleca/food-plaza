'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { sendVerificationEmail } from '@/app/actions/sendVerificationEmail';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser, FaPhone, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const RegisterPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [matchError, setMatchError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const passwordRules = {
    length: formData.password.length >= 8,
    capital: /[A-Z]/.test(formData.password),
    number: /\d/.test(formData.password),
  };

  const allRulesPassed = Object.values(passwordRules).every(Boolean);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      // ✅ Only digits, max 10 numbers after +63
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, phone: cleaned }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'confirmPassword') {
      setMatchError(value !== formData.password ? 'Passwords do not match.' : '');
    }

    if (name === 'password') {
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        setMatchError('Passwords do not match.');
      } else {
        setMatchError('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const form = new FormData(e.target);
    const name = form.get('name');
    const email = form.get('email');

    // ✅ Always store with +63 in localStorage
    const fullPhone = `+63${formData.phone}`;

    const emailResponse = await sendVerificationEmail(email, name, code);
    if (emailResponse.error) {
      toast.error(emailResponse.error);
      return;
    }

    // ✅ Store with +63 so Verify page sends correct format to Appwrite
    localStorage.setItem('registrationData', JSON.stringify({
      name,
      email,
      phone: fullPhone,  // Save phone with +63
      password: form.get('password'),
      confirmPassword: form.get('confirmPassword'),
      code,
      label: 'customer',
    }));

    toast.success('Verification code sent to your email.');
    router.push('/verify');
  };

  const renderRule = (label, passed) => (
    <li className={`flex items-center gap-2 text-sm ${passed ? 'text-green-400' : 'text-red-500'}`}>
      {passed ? <FaCheckCircle /> : <FaTimesCircle />} {label}
    </li>
  );

  return (
    <div className="min-h-screen flex flex-col -mt-28 lg:flex-row text-white">
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2">
        <h1 className="text-4xl sm:text-4xl font-black leading-tight tracking-[0.2em] bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400 text-transparent bg-clip-text">
          CREATE YOUR ACCOUNT
        </h1>
        <p className="text-sm sm:text-lg font-medium text-gray-300 tracking-widest mt-2">Join The Corner Food Plaza now!</p>
        <p className="text-neutral-300 mt-4 text-xs max-w-md text-center">Register to explore delicious food, discover new stalls, and enjoy seamless orders at The Corner Food Plaza.</p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg bg-neutral-900 p-10 rounded-3xl border border-pink-600 shadow-2xl">
          <div className="text-center mb-10 lg:hidden">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400 text-transparent bg-clip-text">
              Create your account
            </h2>
            <p className="text-neutral-400 mt-2 text-sm">Join The Corner Food Plaza now!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nickname */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">Nickname</label>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your nickname"
                  required
                  className="w-full px-10 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:ring-2 focus:ring-pink-600"
                />
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  required
                  className="w-full px-10 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:ring-2 focus:ring-pink-600"
                />
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">Phone Number</label>
              <div className="relative flex items-center">
                <span className="px-3 py-3 bg-neutral-800 border border-neutral-700 rounded-l-lg text-neutral-400 flex items-center gap-2">
                  <FaPhone />
                  +63
                </span>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="9123456789"
                  required
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-r-lg text-white placeholder-neutral-500 focus:ring-2 focus:ring-pink-600"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                  className="w-full px-10 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:ring-2 focus:ring-pink-600"
                />
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* Password Strength Rules */}
              <ul className="mt-2 space-y-1">
                {renderRule('At least 8 characters', passwordRules.length)}
                {renderRule('At least 1 capital letter', passwordRules.capital)}
                {renderRule('At least 1 number', passwordRules.number)}
              </ul>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Re-enter password"
                  required
                  className="w-full px-10 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:ring-2 focus:ring-pink-600"
                />
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {matchError && <p className="text-red-500 text-sm mt-1">{matchError}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!allRulesPassed || !!matchError || formData.phone.length !== 10}
              className="w-full py-3 rounded-lg text-lg font-bold bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400 hover:brightness-110 text-white transition duration-300"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
