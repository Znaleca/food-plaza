'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import createUser from '@/app/actions/createUser';

export default function VerifyPage() {
  const [inputCode, setInputCode] = useState('');
  const [actualCode, setActualCode] = useState('');
  const [formData, setFormData] = useState(null);
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
    form.append('phone', formData.phone); // already contains +63

    const result = await createUser(null, form);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Account created successfully!');
      localStorage.removeItem('registrationData');
      router.push('/login');
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
      </form>
    </div>
  );
}
