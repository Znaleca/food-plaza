'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { sendVerificationEmail } from '@/app/actions/sendVerificationEmail';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const RegisterPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [matchError, setMatchError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
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
    setFormData(prev => ({ ...prev, [name]: value }));

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

    const emailResponse = await sendVerificationEmail(email, name, code);
    if (emailResponse.error) {
      toast.error(emailResponse.error);
      return;
    }

    localStorage.setItem('registrationData', JSON.stringify({
      name,
      email,
      password: form.get('password'),
      confirmPassword: form.get('confirmPassword'),
      code,
      label: 'customer'
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
    <div className="w-full min-h-screen -mt-20 bg-neutral-900 text-white flex flex-col items-center justify-center px-4 py-16">
      <div className="mt-12 sm:mt-16 text-center mb-12 px-4">
        <h2 className="text-lg sm:text-4xl text-pink-600 font-light tracking-widest uppercase">Register</h2>
        <p className="mt-4 text-2xl sm:text-7xl font-extrabold text-white leading-tight">
          Create your account.
        </p>
      </div>

      <div className="w-full max-w-md bg-neutral-800 p-8 rounded-3xl shadow-lg border border-pink-600">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">Nickname</label>
            <div className="relative">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-10 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-pink-600 placeholder-neutral-500"
                placeholder="Your nickname"
                required
              />
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-10 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-pink-600 placeholder-neutral-500"
                placeholder="you@example.com"
                required
              />
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-10 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-pink-600 placeholder-neutral-500"
                placeholder="••••••••"
                required
              />
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <ul className="mt-2 space-y-1">
              {renderRule('At least 8 characters', passwordRules.length)}
              {renderRule('At least 1 capital letter', passwordRules.capital)}
              {renderRule('At least 1 number', passwordRules.number)}
            </ul>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-10 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-pink-600 placeholder-neutral-500"
                placeholder="Re-enter password"
                required
              />
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {matchError && <p className="text-red-500 text-sm mt-1">{matchError}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-pink-600 hover:bg-pink-700 rounded-lg text-lg font-semibold transition duration-300"
            disabled={!allRulesPassed || !!matchError}
          >
            Register
          </button>

          <div className="flex justify-between text-sm text-neutral-400 mt-4">
            <p>
              Already have an account?{' '}
              <Link href="/login" className="text-pink-500 hover:underline">
                Log in
              </Link>
            </p>
            <Link href="/forgot-pass" className="text-pink-500 hover:underline">
              Forgot Password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
