'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import React, { useEffect, useState, useRef } from 'react';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser, FaPhone } from 'react-icons/fa';
import { FaChevronLeft } from 'react-icons/fa6';
import createAccount from '@/app/actions/createAccount';
import checkUserExists from '@/app/actions/checkUserExists';

const CreateFoodStallPage = () => {
  const [state, formAction] = React.useActionState(createAccount, {});
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [passwordError, setPasswordError] = useState('');
  const [matchError, setMatchError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailTakenError, setEmailTakenError] = useState('');
  const [phoneTakenError, setPhoneTakenError] = useState('');

  const debounceTimeoutRef = useRef(null);

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) {
      toast.success("Food stall account created successfully!");
      router.push("/admin/add");
    }
  }, [state, router]);

  // Debounced check for existing users
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      let isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      let isPhoneValid = /^\d{10}$/.test(phone);

      if (isEmailValid || isPhoneValid) {
        const result = await checkUserExists(email, `+63${phone}`);
        if (result.error) {
          toast.error(result.error);
        } else {
          setEmailTakenError(result.isEmailTaken ? 'Email is already taken.' : '');
          setPhoneTakenError(result.isPhoneTaken ? 'Phone number is already taken.' : '');
        }
      } else {
        setEmailTakenError('');
        setPhoneTakenError('');
      }
    }, 500);

    return () => clearTimeout(debounceTimeoutRef.current);
  }, [email, phone]);

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(value.length < 8 ? "Password must be at least 8 characters long." : "");
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setMatchError(value !== password ? "Passwords do not match." : "");
  };

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);
    setPhoneError(!/^\d{10}$/.test(value) ? "Phone number must be 10 digits." : "");
  };

  const isFormInvalid = !!passwordError || !!matchError || !!phoneError || !!emailTakenError || !!phoneTakenError;

  return (
    <div className="min-h-screen bg-white text-neutral-950 selection:bg-red-600 selection:text-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <Link
          href="/admin"
          className="inline-flex items-center border-2 border-neutral-950 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-neutral-950 shadow-[4px_4px_0px_#000] transition-transform hover:-translate-y-1 hover:bg-neutral-950 hover:text-white"
        >
          <FaChevronLeft className="mr-2" />
          Back
        </Link>

        <section className="relative mt-6 mb-8 overflow-hidden border-4 border-neutral-950 bg-white px-6 py-8 shadow-[8px_8px_0px_#000] sm:px-8 sm:py-10">
          <div className="absolute top-0 left-0 h-3 w-24 bg-red-600" />
          <div className="absolute bottom-0 right-0 h-3 w-24 bg-red-600" />
          <p className="text-xs font-black tracking-[0.45em] uppercase text-red-600 mb-3">
            Admin Module
          </p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase text-neutral-950 leading-none">
            Create Lessee Account
          </h1>
          <p className="mt-4 max-w-2xl text-sm sm:text-base text-neutral-600 font-medium leading-relaxed">
            Add a new lessee using the same bold form treatment as the rest of the admin area.
          </p>
        </section>

        <div className="border-4 border-neutral-950 bg-white p-6 shadow-[8px_8px_0px_#000] sm:p-8">
          <form action={formAction} className="space-y-8">
          {/* Nickname */}
          <div className="relative">
            <label htmlFor="name" className="mb-3 block text-xs font-black tracking-[0.35em] uppercase text-neutral-500">Lessee Nickname</label>
            <div className="relative">
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter Nickname"
                required
                className="w-full border-2 border-neutral-950 bg-white px-10 py-3 font-bold text-neutral-950 outline-none transition-colors focus:border-red-600 placeholder:text-neutral-400"
              />
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
            </div>
          </div>

          {/* Email */}
          <div className="relative">
            <label htmlFor="email" className="mb-3 block text-xs font-black tracking-[0.35em] uppercase text-neutral-500">Email</label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="you@example.com"
                required
                className={`w-full border-2 bg-white px-10 py-3 font-bold text-neutral-950 outline-none transition-colors ${emailTakenError ? 'border-red-600' : 'border-neutral-950 focus:border-red-600'} placeholder:text-neutral-400`}
              />
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
            </div>
            {emailTakenError && <p className="text-red-500 text-sm mt-1">{emailTakenError}</p>}
          </div>

          {/* Phone Number */}
          <div className="relative">
            <label htmlFor="phone" className="mb-3 block text-xs font-black tracking-[0.35em] uppercase text-neutral-500">Phone Number</label>
            <div className="relative flex items-stretch">
              <span className="flex items-center gap-2 border-2 border-neutral-950 bg-neutral-950 px-4 py-3 text-xs font-black uppercase tracking-widest text-white">
                <FaPhone />
                +63
              </span>
              <input
                type="text"
                id="phone"
                name="phone"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 10) setPhone(value);
                  setPhoneError(!/^\d{10}$/.test(value) ? "Phone number must be 10 digits." : "");
                }}
                placeholder="9123456789"
                required
                maxLength={10}
                className={`w-full border-2 border-l-0 bg-white px-4 py-3 font-bold text-neutral-950 outline-none transition-colors ${
                  phoneError || phoneTakenError ? 'border-red-600' : 'border-neutral-950 focus:border-red-600'
                } placeholder:text-neutral-400`}
              />
            </div>
            {phoneError && <p className="mt-1 text-sm text-red-500">{phoneError}</p>}
            {phoneTakenError && <p className="mt-1 text-sm text-red-500">{phoneTakenError}</p>}
          </div>


          {/* Password */}
          <div className="relative">
            <label htmlFor="password" className="mb-3 block text-xs font-black tracking-[0.35em] uppercase text-neutral-500">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                required
                className={`w-full border-2 bg-white px-10 py-3 font-bold text-neutral-950 outline-none transition-colors ${passwordError ? 'border-red-600' : 'border-neutral-950 focus:border-red-600'} placeholder:text-neutral-400`}
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
            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label htmlFor="confirmPassword" className="mb-3 block text-xs font-black tracking-[0.35em] uppercase text-neutral-500">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="Re-enter password"
                required
                className={`w-full border-2 bg-white px-10 py-3 font-bold text-neutral-950 outline-none transition-colors ${matchError ? 'border-red-600' : 'border-neutral-950 focus:border-red-600'} placeholder:text-neutral-400`}
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

          {/* Hidden Food Stall Role */}
          <input type="hidden" name="label" value="foodstall" />

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full border-2 border-neutral-950 bg-red-600 py-3 text-xs font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_#000] transition-transform hover:-translate-y-1 hover:bg-neutral-950 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
            disabled={isFormInvalid}
          >
            Create Lessee Account
          </button>
        </form>
        </div>
      </div>
    </div>
  );
};

export default CreateFoodStallPage;
