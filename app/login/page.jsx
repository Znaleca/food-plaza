'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import createSession from "@/app/actions/createSession";
import { toast } from "react-toastify";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";
import Headline from "@/components/Headline";

const LoginPage = () => {
  const [state, formAction] = React.useActionState(createSession, {});
  const { setIsAuthenticated, checkAuthentication } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }

    if (state.success) {
      toast.success("Logged in successfully!");
      setIsAuthenticated(true);
      checkAuthentication();

      const isAdmin = state.labels?.includes("admin");
      const isFoodstall = state.labels?.includes("foodstall");

      if (isAdmin) {
        router.push("/admin");
      } else if (isFoodstall) {
        router.push("/foodstall");
      } else {
        router.push("/");
      }
    }
  }, [state]);

  return (
    <div className="w-full min-h-screen bg-white text-neutral-950 flex flex-col items-center justify-center px-4 py-16">
      
      {/* Logo & Heading */}
      <div className="mt-12 sm:mt-16 text-center mb-10 px-4">
        <span className="text-xs font-bold tracking-[0.4em] text-red-600 uppercase block mb-4">
          WELCOME BACK
        </span>
        <Headline className="justify-center" />
      </div>

      {/* Form Card */}
      <div className="w-full max-w-md bg-white p-8 sm:p-12 border-4 border-neutral-950 relative">
        {/* Decorative corner accent block */}
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-red-600 border-4 border-neutral-950 hidden sm:block"></div>

        <form action={formAction} className="space-y-8">
          
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-xs font-black tracking-widest text-neutral-950 uppercase mb-3">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-12 py-4 bg-white border-2 border-neutral-950 text-neutral-950 font-bold focus:outline-none focus:border-red-600 transition-colors placeholder-neutral-300 rounded-none"
                placeholder="YOU@EXAMPLE.COM"
                required
              />
              <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-950 w-5 h-5" />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-xs font-black tracking-widest text-neutral-950 uppercase mb-3">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="w-full px-12 py-4 bg-white border-2 border-neutral-950 text-neutral-950 font-bold focus:outline-none focus:border-red-600 transition-colors placeholder-neutral-300 rounded-none"
                placeholder="••••••••"
                required
              />
              <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-950 w-5 h-5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-950 hover:text-red-600 transition-colors"
              >
                {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 bg-neutral-950 text-white border-2 border-neutral-950 hover:bg-red-600 hover:border-red-600 text-2xl font-black uppercase tracking-tighter transition-all"
          >
            Sign In
          </button>

          {/* Links */}
          <div className="flex flex-col sm:flex-row justify-between items-center text-xs font-bold uppercase tracking-wider text-neutral-500 gap-4 pt-6 border-t-2 border-neutral-100">
            <p>
              No account?{' '}
              <Link href="/register" className="text-red-600 hover:text-neutral-950 transition-colors">
                Register
              </Link>
            </p>
            <Link href="/forgot-pass" className="text-red-600 hover:text-neutral-950 transition-colors">
              Forgot Password?
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
};

export default LoginPage;