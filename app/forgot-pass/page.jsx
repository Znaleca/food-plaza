'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendResetCodeEmail } from '@/app/actions/sendResetCodeEmail';
import { toast } from 'react-toastify';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const name = email.split('@')[0];
    const result = await sendResetCodeEmail(email, name, code);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    localStorage.setItem('resetEmail', email);
    localStorage.setItem('resetCode', code);

    toast.success('Reset code sent to your email!');
    router.push('/reset-pass');
  };

  return (
    <div className="w-full min-h-screen -mt-20 bg-neutral-900 text-white flex flex-col items-center justify-center px-4 py-16">
      <div className="mt-12 sm:mt-16 text-center mb-12 px-4">
        <h2 className="text-lg sm:text-4xl text-pink-600 font-light tracking-widest uppercase">Forgot Password</h2>
        <p className="mt-4 text-2xl sm:text-6xl font-extrabold text-white leading-tight">
          Reset your password.
        </p>
      </div>

      <div className="w-full max-w-md bg-neutral-800 p-8 rounded-3xl shadow-lg border border-pink-600">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">Your Email</label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-10 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-pink-600 placeholder-neutral-500"
                placeholder="you@example.com"
                required
              />
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-pink-600 hover:bg-pink-700 rounded-lg text-lg font-semibold transition duration-300"
          >
            Send Reset Code
          </button>
        </form>

        {/* Back to Login Link with Icon */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-pink-500 hover:text-pink-400 transition"
          >
            <FaArrowLeft />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
