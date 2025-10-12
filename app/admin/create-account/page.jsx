'use client';

import { useRouter } from 'next/navigation';
import { useFormState } from 'react-dom';
import { toast } from 'react-toastify';
import { useEffect, useState, useRef } from 'react';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser, FaPhone } from 'react-icons/fa';
import createAccount from '@/app/actions/createAccount';
import checkUserExists from '@/app/actions/checkUserExists';

const CreateFoodStallPage = () => {
  const [state, formAction] = useFormState(createAccount, {});
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
    <div className="w-full min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center px-4 py-16">
      {/* Page Heading */}
      <div className="text-center mb-12 px-4">
        <h2 className="text-2xl sm:text-6xl font-extrabold text-white leading-tight">
          Create Lessee Account
        </h2>
        <p className="mt-4 text-lg text-neutral-400">
        </p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-xl bg-neutral-800 p-10 rounded-3xl shadow-lg border border-pink-600">
        <form action={formAction} className="space-y-8">
          {/* Nickname */}
          <div className="relative">
            <label htmlFor="name" className="block text-sm font-medium mb-2">Lessee Nickname</label>
            <div className="relative">
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your stall name"
                required
                className="w-full px-10 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-600 placeholder-neutral-500"
              />
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
            </div>
          </div>

          {/* Email */}
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="you@example.com"
                required
                className={`w-full px-10 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 ${emailTakenError ? 'ring-red-500' : 'focus:ring-pink-600'} placeholder-neutral-500`}
              />
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
            </div>
            {emailTakenError && <p className="text-red-500 text-sm mt-1">{emailTakenError}</p>}
          </div>

          {/* Phone Number */}
<div className="relative">
  <label htmlFor="phone" className="block text-sm font-medium mb-2">Phone Number</label>
  <div className="relative flex items-center">
    <span className="px-3 py-3 bg-neutral-900 border border-neutral-700 rounded-l-lg text-neutral-400 flex items-center gap-2">
      <FaPhone />
      +63
    </span>
    <input
      type="text"
      id="phone"
      name="phone"
      value={phone}
      onChange={(e) => {
        const value = e.target.value.replace(/\D/g, ''); // only allow digits
        if (value.length <= 10) setPhone(value); // limit to 10 digits
        setPhoneError(!/^\d{10}$/.test(value) ? "Phone number must be 10 digits." : "");
      }}
      placeholder="9123456789"
      required
      maxLength={10}
      className={`w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-r-lg text-white placeholder-neutral-500 focus:ring-2 ${
        phoneError || phoneTakenError ? 'ring-red-500' : 'focus:ring-pink-600'
      }`}
    />
  </div>
  {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
  {phoneTakenError && <p className="text-red-500 text-sm mt-1">{phoneTakenError}</p>}
</div>


          {/* Password */}
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                required
                className={`w-full px-10 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 ${passwordError ? 'ring-red-500' : 'focus:ring-pink-600'} placeholder-neutral-500`}
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
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="Re-enter password"
                required
                className={`w-full px-10 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 ${matchError ? 'ring-red-500' : 'focus:ring-pink-600'} placeholder-neutral-500`}
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
            className="w-full py-3 bg-pink-600 hover:bg-pink-700 rounded-lg text-lg font-semibold transition duration-300"
            disabled={isFormInvalid}
          >
            Create Food Stall
          </button>
          
        </form>
      </div>
    </div>
  );
};

export default CreateFoodStallPage;
