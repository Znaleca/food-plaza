'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import updateUserPassword from '@/app/actions/updateUserPassword';
import getUserByEmail from '@/app/actions/getUserByEmail';
import { sendResetCodeEmail } from '@/app/actions/sendResetCodeEmail';

const validateRules = {
  minLength: /.{8,}/,
  capital: /[A-Z]/,
  number: /[0-9]/,
};

const passwordValidationFeedback = (password) => {
  const rules = [
    { label: 'At least 8 characters', valid: validateRules.minLength.test(password) },
    { label: 'At least 1 capital letter', valid: validateRules.capital.test(password) },
    { label: 'At least 1 number', valid: validateRules.number.test(password) },
  ];

  return (
    <ul className="text-sm ml-5 space-y-1">
      {rules.map((rule, i) => (
        <li key={i} className={`list-disc ${rule.valid ? 'text-green-400' : 'text-neutral-400'}`}>
          {rule.label}
        </li>
      ))}
    </ul>
  );
};

const ChangePasswordPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    codeInput: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [resetCode, setResetCode] = useState('');
  const [status, setStatus] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    const code = localStorage.getItem('resetCode');
    const email = localStorage.getItem('resetEmail');

    if (!code || !email) {
      toast.error('Missing reset code or email.');
      router.push('/forgot-password');
      return;
    }

    setResetCode(code);
    setFormData((prev) => ({ ...prev, email }));

    getUserByEmail(email).then((res) => {
      if (res?.error) {
        toast.error(res.error);
      } else {
        setFormData((prev) => ({ ...prev, name: res.name }));
      }
    });
  }, [router]);

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setStatus('');
  };

  const hasPasswordErrors = () => {
    const { newPassword } = formData;
    return (
      !validateRules.minLength.test(newPassword) ||
      !validateRules.capital.test(newPassword) ||
      !validateRules.number.test(newPassword)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.codeInput !== resetCode) {
      setStatus('Invalid reset code.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setStatus('Passwords do not match.');
      return;
    }

    if (hasPasswordErrors()) {
      setStatus('Password must meet the requirements below.');
      return;
    }

    setStatus('Updating password...');

    try {
      const form = new FormData();
      form.append('email', formData.email);
      form.append('password', formData.newPassword);

      const result = await updateUserPassword(null, form);

      if (result?.error) {
        setStatus(`Error: ${result.error}`);
        return;
      }

      toast.success('Password successfully changed!');
      localStorage.removeItem('resetCode');
      localStorage.removeItem('resetEmail');
      router.push('/login');
    } catch (error) {
      console.error(error);
      setStatus(`Error: ${error.message || 'Failed to update password.'}`);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const name = formData.name || formData.email.split('@')[0];

    try {
      const result = await sendResetCodeEmail(formData.email, name, newCode);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      localStorage.setItem('resetCode', newCode);
      setResetCode(newCode);
      setResendCooldown(30); // 30 seconds cooldown
      toast.success('New reset code sent to your email!');
    } catch (error) {
      toast.error('Failed to resend code. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-neutral-900 text-white py-20 px-4 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-neutral-800 border border-pink-600 rounded-3xl p-8 sm:p-12 shadow-lg">
        <div className="text-center mb-10">
          <h2 className="text-pink-600 uppercase text-sm sm:text-lg tracking-widest font-medium">
            Reset Password
          </h2>
          <p className="text-2xl sm:text-4xl font-extrabold mt-3">Change Your Password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block mb-2 text-sm">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              readOnly
              className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-4 py-3 text-white cursor-not-allowed"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block mb-2 text-sm">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              readOnly
              className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-4 py-3 text-white cursor-not-allowed"
            />
          </div>

          {/* Reset Code + Resend Button */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm">Reset Code</label>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0}
                className={`text-sm ${
                  resendCooldown > 0
                    ? 'text-neutral-500 cursor-not-allowed'
                    : 'text-pink-500 hover:text-pink-400 transition'
                }`}
              >
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : 'Resend Code'}
              </button>
            </div>
            <input
              type="text"
              name="codeInput"
              value={formData.codeInput}
              onChange={handleChange}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500"
              placeholder="Enter the 6-digit code"
              required
            />
          </div>

          {/* Password Fields */}
          <div>
            <label className="block mb-2 text-sm">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500"
              placeholder="New password"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500"
              placeholder="Confirm password"
              required
            />
          </div>

          {/* Password Validation */}
          {formData.newPassword && passwordValidationFeedback(formData.newPassword)}

          {/* Status Message */}
          {status && (
            <p
              className={`text-sm ${
                status.startsWith('Error') || status.includes('not')
                  ? 'text-red-400'
                  : 'text-green-400'
              }`}
            >
              {status}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-pink-600 hover:bg-pink-700 rounded-lg text-lg font-semibold transition duration-300"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
