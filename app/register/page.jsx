'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { sendVerificationEmail } from '@/app/actions/sendVerificationEmail';
import checkUserExists from '@/app/actions/checkUserExists';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser, FaCheckSquare, FaRegSquare } from 'react-icons/fa';

const RegisterPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [matchError, setMatchError] = useState('');
  const [emailTakenError, setEmailTakenError] = useState('');
  const [phoneTakenError, setPhoneTakenError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const debounceTimeoutRef = useRef(null);

  const passwordRules = {
    length: formData.password.length >= 8,
    capital: /[A-Z]/.test(formData.password),
    number: /\d/.test(formData.password),
  };

  const allRulesPassed = Object.values(passwordRules).every(Boolean);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (formData.email || formData.phone) {
      debounceTimeoutRef.current = setTimeout(async () => {
        const emailToValidate = formData.email;
        const phoneToValidate = `+63${formData.phone}`;
        const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToValidate);
        const isPhoneValid = /^\+63\d{10}$/.test(phoneToValidate);

        if (isEmailValid || isPhoneValid) {
          const { isEmailTaken, isPhoneTaken, error } = await checkUserExists(emailToValidate, phoneToValidate);
          if (error) {
            toast.error(error);
          } else {
            setEmailTakenError(isEmailTaken ? 'EMAIL ALREADY TAKEN.' : '');
            setPhoneTakenError(isPhoneTaken ? 'PHONE ALREADY TAKEN.' : '');
          }
        }
      }, 500);
    } else {
      setEmailTakenError('');
      setPhoneTakenError('');
    }

    return () => { if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current); };
  }, [formData.email, formData.phone]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, phone: cleaned }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'confirmPassword') setMatchError(value !== formData.password ? 'PASSWORDS DO NOT MATCH.' : '');
    if (name === 'password') setMatchError(formData.confirmPassword && value !== formData.confirmPassword ? 'PASSWORDS DO NOT MATCH.' : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (emailTakenError || phoneTakenError) {
      toast.error("PLEASE FIX ERRORS.");
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const emailResponse = await sendVerificationEmail(formData.email, formData.name, code);
    if (emailResponse.error) {
      toast.error(emailResponse.error);
      return;
    }
    localStorage.setItem('registrationData', JSON.stringify({
      ...formData,
      phone: `+63${formData.phone}`,
      code,
      label: 'customer',
    }));
    toast.success('VERIFICATION CODE SENT.');
    router.push('/verify');
  };

  const renderRule = (label, passed) => (
    <li className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${passed ? 'text-black' : 'text-red-600'}`}>
      {passed ? <FaCheckSquare className="w-3 h-3" /> : <FaRegSquare className="w-3 h-3" />} {label}
    </li>
  );
  
  const isFormInvalid = !allRulesPassed || !!matchError || formData.phone.length !== 10 || !!emailTakenError || !!phoneTakenError;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white text-black">
      {/* Left Panel - Hero Branding */}
      <div className="hidden lg:flex flex-col justify-center items-start w-1/2 px-20 border-r-4 border-black">
        <span className="text-xs font-bold tracking-[0.4em] text-red-600 uppercase mb-4">
          JOIN THE SQUAD
        </span>
        <h1 className="text-7xl font-black leading-[0.85] text-black uppercase tracking-tighter">
          CREATE <br /> YOUR <br /> <span className="text-red-600">ACCOUNT</span>
        </h1>
        <p className="mt-8 text-sm font-bold uppercase tracking-widest text-black max-w-sm leading-relaxed">
          Explore delicious food, discover new stalls, and enjoy seamless orders at BLITZ.
        </p>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-lg bg-white p-8 sm:p-12 border-4 border-black relative">
          {/* Decorative Corner Block */}
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-red-600 border-4 border-black hidden sm:block"></div>
          
          <div className="text-center mb-10 lg:hidden">
            <h2 className="text-4xl font-black uppercase tracking-tighter text-black">REGISTER</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nickname */}
            <div>
              <label className="block text-xs font-black tracking-widest uppercase mb-2 text-black">Nickname</label>
              <div className="relative">
                <input
                  type="text" name="name" value={formData.name} onChange={handleInputChange}
                  placeholder="NICKNAME" required
                  className="w-full px-10 py-3 bg-white border-2 border-black text-black font-bold focus:outline-none focus:border-red-600 placeholder-black/30 rounded-none uppercase"
                />
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-black tracking-widest uppercase mb-2 text-black">Email</label>
              <div className="relative">
                <input
                  type="email" name="email" value={formData.email} onChange={handleInputChange}
                  placeholder="YOU@EXAMPLE.COM" required
                  className={`w-full px-10 py-3 bg-white border-2 text-black font-bold focus:outline-none placeholder-black/30 rounded-none uppercase ${emailTakenError ? 'border-red-600' : 'border-black focus:border-red-600'}`}
                />
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" />
              </div>
              {emailTakenError && <p className="text-red-600 text-[10px] font-black mt-1 tracking-tighter">{emailTakenError}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-black tracking-widest uppercase mb-2 text-black">Phone</label>
              <div className="relative flex">
                <span className="px-3 py-3 bg-black border-2 border-black text-white font-black text-sm flex items-center gap-2 rounded-none">
                  +63
                </span>
                <input
                  type="text" name="phone" value={formData.phone} onChange={handleInputChange}
                  placeholder="9123456789" required
                  className={`w-full px-4 py-3 bg-white border-2 text-black font-bold focus:outline-none placeholder-black/30 rounded-none ${phoneTakenError || formData.phone.length !== 10 ? 'border-red-600 border-l-0' : 'border-black border-l-0 focus:border-red-600'}`}
                />
              </div>
              {phoneTakenError && <p className="text-red-600 text-[10px] font-black mt-1 tracking-tighter">{phoneTakenError}</p>}
            </div>

            {/* Password & Confirm (Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black tracking-widest uppercase mb-2 text-black">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange}
                    placeholder="••••••••" required
                    className="w-full px-10 py-3 bg-white border-2 border-black text-black font-bold focus:outline-none focus:border-red-600 placeholder-black/30 rounded-none"
                  />
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black hover:text-red-600 transition-colors">
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black tracking-widest uppercase mb-2 text-black">Confirm</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange}
                    placeholder="••••••••" required
                    className={`w-full px-10 py-3 bg-white border-2 text-black font-bold focus:outline-none placeholder-black/30 rounded-none ${matchError ? 'border-red-600' : 'border-black focus:border-red-600'}`}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black hover:text-red-600 transition-colors">
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>

            {/* Rules */}
            <ul className="flex flex-wrap gap-x-4 gap-y-2 border-t-2 border-black pt-4">
              {renderRule('8+ CHARS', passwordRules.length)}
              {renderRule('CAPITAL', passwordRules.capital)}
              {renderRule('NUMBER', passwordRules.number)}
              {renderRule('MATCH', !matchError && formData.confirmPassword)}
            </ul>

            <button
              type="submit" disabled={isFormInvalid}
              className="w-full py-4 bg-black text-white text-2xl font-black uppercase tracking-tighter hover:bg-red-600 border-2 border-black transition-all disabled:bg-black/10 disabled:text-black/40 disabled:border-black/20"
            >
              REGISTER
            </button>
          </form>

          <p className="text-center mt-8 text-xs font-bold uppercase tracking-widest text-black/60">
            HAVE AN ACCOUNT?{' '}
            <Link href="/login" className="text-red-600 hover:bg-black hover:text-white px-2 py-1 transition-colors">
              LOG IN
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;