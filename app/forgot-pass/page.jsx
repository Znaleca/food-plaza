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
    <div className="min-h-screen flex items-center justify-center text-white px-4">
      <div className="w-full max-w-lg bg-neutral-900 border border-pink-600/30 rounded-3xl shadow-xl p-8 sm:p-12 animate-fade-in">
        <div className="text-center mb-10">
          <h2 className="text-pink-600 text-base sm:text-xl uppercase tracking-widest font-light">
            Forgot Password
          </h2>
          <p className="mt-3 text-2xl sm:text-4xl font-extrabold tracking-tight">
            Reset your password
          </p>
         
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2 text-neutral-300">
              Your Email
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-10 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-pink-600 transition"
                placeholder="you@example.com"
                required
              />
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-fuchsia-600 hover:from-pink-700 hover:to-fuchsia-700 transition text-lg font-semibold shadow-lg"
          >
            Send Reset Code
          </button>
        </form>

        <div className="mt-8 text-center">
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
