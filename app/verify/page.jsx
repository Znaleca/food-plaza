'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import createUser from '@/app/actions/createUser';
import { sendVerificationEmail } from '@/app/actions/sendVerificationEmail';

export default function VerifyPage() {
  const [inputCode, setInputCode] = useState('');
  const [actualCode, setActualCode] = useState('');
  const [formData, setFormData] = useState(null);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('registrationData'));
    if (!data) {
      toast.error('No registration data found.');
      router.push('/register');
      return;
    }
    setActualCode(data.code);
    setFormData(data);
  }, [router]);

  // Countdown effect for cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (inputCode !== actualCode) {
      toast.error('Invalid verification code.');
      return;
    }

    const form = new FormData();
    form.append('name', formData.name);
    form.append('email', formData.email);
    form.append('password', formData.password);
    form.append('confirmPassword', formData.confirmPassword);
    form.append('phone', formData.phone);

    const result = await createUser(null, form);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Account created successfully!');
      localStorage.removeItem('registrationData');
      router.push('/login');
    }
  };

  const handleResend = async () => {
    if (!formData) {
      toast.error('No registration data available.');
      return;
    }

    setIsResending(true);
    try {
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      const response = await sendVerificationEmail(formData.email, formData.name, newCode);

      if (response.error) {
        toast.error(response.error);
      } else {
        // Update code in localStorage
        const updatedData = { ...formData, code: newCode };
        localStorage.setItem('registrationData', JSON.stringify(updatedData));
        setActualCode(newCode);
        setFormData(updatedData);
        toast.success('A new verification code has been sent to your email.');

        // Start 60-second cooldown
        setCooldown(60);
      }
    } catch (error) {
      toast.error('Failed to resend verification code.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-neutral-900 px-4 py-16 text-white">
      <h2 className="text-3xl font-bold text-pink-600 mb-8">Verify Your Email</h2>
      <form onSubmit={handleVerify} className="bg-neutral-800 p-6 rounded-2xl w-full max-w-md space-y-6 border border-pink-600">
        <label className="block text-sm font-medium">Enter the 6-digit code sent to your email:</label>
        <input
          type="text"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
          maxLength={6}
          className="w-full p-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-pink-600"
          placeholder="Enter verification code"
          required
        />

        <button
          type="submit"
          className="w-full py-3 bg-pink-600 hover:bg-pink-700 rounded-lg font-semibold text-lg"
        >
          Verify and Create Account
        </button>

        {/* Resend Button with Cooldown */}
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || cooldown > 0}
          className={`w-full py-2 mt-2 rounded-lg text-sm border transition-colors ${
            isResending || cooldown > 0
              ? 'border-neutral-600 text-neutral-500 cursor-not-allowed bg-neutral-800'
              : 'border-pink-600 text-pink-500 hover:bg-pink-600 hover:text-white'
          }`}
        >
          {isResending
            ? 'Resending...'
            : cooldown > 0
            ? `Resend in ${cooldown}s`
            : 'Resend Verification Email'}
        </button>
      </form>
    </div>
  );
}
