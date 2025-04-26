'use client';

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import createUser from "@/app/actions/createUser";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const RegisterPage = () => {
  const [state, formAction] = useFormState(createUser, {});
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [matchError, setMatchError] = useState("");

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) {
      toast.success("Account created! Check your email.");
      router.push("/login");
    }
  }, [state, router]);

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-200/50 via-green-200/50 to-teal-200/50">
      <div className="relative z-10 bg-white bg-opacity-90 rounded-lg shadow-lg p-10 max-w-md w-full">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Create Your Account</h2>
        <form action={formAction}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Nickname</label>
            <input type="text" id="name" name="name" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" placeholder="John" required />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</label>
            <input type="email" id="email" name="email" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" placeholder="johndoe@example.com" required />
          </div>

          <div className="mb-4 relative">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} id="password" name="password" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" placeholder="Enter your password" required value={password} onChange={handlePasswordChange} />
              <button type="button" className="absolute inset-y-0 right-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
              </button>
            </div>
            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
          </div>

          <div className="mb-6 relative">
            <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">Confirm Password</label>
            <div className="relative">
              <input type={showConfirmPassword ? "text" : "password"} id="confirmPassword" name="confirmPassword" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" placeholder="Confirm your password" required value={confirmPassword} onChange={handleConfirmPasswordChange} />
              <button type="button" className="absolute inset-y-0 right-3 flex items-center" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
              </button>
            </div>
            {matchError && <p className="text-red-500 text-sm mt-1">{matchError}</p>}
          </div>

          <button type="submit" className="w-full py-3 text-lg font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400" disabled={!!passwordError || !!matchError}>
            Register
          </button>
          <p className="text-center mt-4 text-sm text-gray-700">Already have an account? <Link href="/login" className="text-green-500 hover:underline">Log in</Link></p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
