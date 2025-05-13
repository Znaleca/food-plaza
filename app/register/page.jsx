'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import createUser from '@/app/actions/createUser';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';

const RegisterPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [matchError, setMatchError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Handle changes in form inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle password validation
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(value.length < 8 ? 'Password must be at least 8 characters long.' : '');
  };

  // Handle confirm password validation
  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setMatchError(value !== password ? 'Passwords do not match.' : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Call the backend user creation function
    const response = await createUser(null, new FormData(e.target));

    if (response.error) {
      toast.error(response.error);
    } else if (response.success) {
      toast.success('Account created! Check your email.');
      router.push('/login');
    }
  };

  useEffect(() => {
    if (formData.password && formData.confirmPassword) {
      setMatchError(formData.password !== formData.confirmPassword ? 'Passwords do not match.' : '');
    }
  }, [formData.password, formData.confirmPassword]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-yellow-400/50 to-pink-600/50 flex items-center justify-center p-6">
      <div
        className="relative z-10 bg-cover bg-center bg-no-repeat rounded-3xl shadow-lg w-full max-w-2xl"
        style={{ backgroundImage: 'url("/images/card.jpg")' }}
      >
        <div className="bg-white bg-opacity-80 rounded-3xl p-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-6">
              Join <span className="text-pink-600">THE CORNER</span>!
            </h2>

            {/* Name Input */}
            <div className="relative">
              <label htmlFor="name" className="block text-gray-700 font-semibold mb-3 text-lg">
                Nickname
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="border rounded-lg w-full py-4 px-12 text-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                  placeholder="Your nickname"
                  required
                />
                <div className="absolute inset-y-0 left-4 flex items-center">
                  <FaUser className="text-gray-500" />
                </div>
              </div>
            </div>

            {/* Email Input */}
            <div className="relative">
              <label htmlFor="email" className="block text-gray-700 font-semibold mb-3 text-lg">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="border rounded-lg w-full py-4 px-12 text-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                  placeholder="Enter your email"
                  required
                />
                <div className="absolute inset-y-0 left-4 flex items-center">
                  <FaEnvelope className="text-gray-500" />
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div className="relative">
              <label htmlFor="password" className="block text-gray-700 font-semibold mb-3 text-lg">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={password}
                  onChange={handlePasswordChange}
                  className="border rounded-lg w-full py-4 px-12 text-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                  placeholder="Enter your password"
                  required
                />
                <div className="absolute inset-y-0 left-4 flex items-center">
                  <FaLock className="text-gray-500" />
                </div>
                <button
                  type="button"
                  className="absolute inset-y-0 right-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash className="text-gray-600" /> : <FaEye className="text-gray-600" />}
                </button>
              </div>
              {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
            </div>

            {/* Confirm Password Input */}
            <div className="relative">
              <label htmlFor="confirmPassword" className="block text-gray-700 font-semibold mb-3 text-lg">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className="border rounded-lg w-full py-4 px-12 text-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                  placeholder="Re-enter your password"
                  required
                />
                <div className="absolute inset-y-0 left-4 flex items-center">
                  <FaLock className="text-gray-500" />
                </div>
                <button
                  type="button"
                  className="absolute inset-y-0 right-4 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash className="text-gray-600" /> : <FaEye className="text-gray-600" />}
                </button>
              </div>
              {matchError && <p className="text-red-500 text-sm mt-1">{matchError}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-pink-600 text-white rounded-lg text-xl font-medium hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-300"
              disabled={!!passwordError || !!matchError || !formData.name || !formData.email || !password || !confirmPassword}
            >
              Register
            </button>

            <p className="text-center mt-4 text-sm text-gray-700">
              Already have an account?{' '}
              <Link href="/login" className="text-pink-600 hover:underline">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
