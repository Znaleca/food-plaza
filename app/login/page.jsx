'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import createSession from "@/app/actions/createSession";
import { useFormState, useFormStatus } from "react-dom";
import { toast } from "react-toastify";
import { useEffect, useState, useTransition } from "react";
import { useAuth } from "@/context/authContext";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";
import Headline from "@/components/Headline";

const LoginPage = () => {
  const [state, formAction] = useFormState(createSession, {});
  const { setIsAuthenticated, checkAuthentication } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

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
        router.push("/home");
      }
    }
  }, [state]);

  // Handle Guest Login
  const handleGuestLogin = () => {
    const guestForm = new FormData();
    guestForm.set("email", "guest@gmail.com");
    guestForm.set("password", "asd12345");

    startTransition(async () => {
      const result = await createSession({}, guestForm);
      if (result.error) {
        toast.error(result.error);
      } else if (result.success) {
        toast.success("Welcome to The Corner!");
        setIsAuthenticated(true);
        checkAuthentication();

        const isAdmin = result.labels?.includes("admin");
        const isFoodstall = result.labels?.includes("foodstall");

        if (isAdmin) {
          router.push("/admin");
        } else if (isFoodstall) {
          router.push("/foodstall");
        } else {
          router.push("/home");
        }
      }
    });
  };

  return (
    <div className="w-full min-h-screen -mt-28 bg-neutral-900 text-white flex flex-col items-center justify-center px-4 py-16">
      {/* Logo & Heading */}
      <div className="mt-12 sm:mt-16 text-center mb-12 px-4">
        <Headline className="mb-9 -mt-12 justify-center" />
      </div>

      {/* Form Card */}
      <div className="w-full max-w-md bg-neutral-850 p-10 sm:p-12 rounded-3xl shadow-2xl border border-pink-500/50 backdrop-blur-md">
        <form action={formAction} className="space-y-7 sm:space-y-8">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-10 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-neutral-500"
                placeholder="you@example.com"
                required
              />
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className="w-full px-10 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-neutral-500"
                placeholder="••••••••"
                required
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
          </div>

          {/* Submit Button */}
<button
  type="submit"
  className="w-full py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:brightness-110 text-white rounded-xl text-lg font-semibold transition duration-300 shadow-md"
>
  Sign In
</button>

{/* OR Divider */}
<div className="flex items-center my-4">
  <div className="flex-grow border-t border-neutral-700"></div>
  <span className="mx-4 text-neutral-400 text-sm">OR</span>
  <div className="flex-grow border-t border-neutral-700"></div>
</div>

{/* Continue as Guest Button */}
<button
  type="button"
  onClick={handleGuestLogin}
  disabled={isPending}
  className="w-full py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-xl text-lg font-sans transition duration-300 shadow-md"
>
  {isPending ? "Continuing to The Corner..." : "Continue without an Account"}
</button>


          {/* Links */}
          <div className="flex flex-col sm:flex-row justify-between text-sm text-neutral-400 gap-3 sm:gap-0 text-center mt-4">
            <p>
              Don't have an account?{" "}
              <Link href="/register" className="text-pink-500 hover:underline">
                Register
              </Link>
            </p>
            <Link href="/forgot-pass" className="text-pink-500 hover:underline">
              Forgot Password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
