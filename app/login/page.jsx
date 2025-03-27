'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import createSession from "@/app/actions/createSession";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";

const LoginPage = () => {
    const [state, formAction] = useFormState(createSession, {});
    const { setIsAuthenticated, checkAuthentication } = useAuth();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (state.error) toast.error(state.error);
        if (state.success) {
            toast.success("Logged in successfully!");
            setIsAuthenticated(true);
            checkAuthentication(); // Refresh authentication state
            router.push("/home");
        }
    }, [state]);

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-blue-200/50 via-blue-300/50 to-indigo-200/50 flex items-center justify-center">
            <div className="relative z-10 bg-white bg-opacity-90 shadow-xl rounded-lg p-8 w-full max-w-sm">
                <form action={formAction}>
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                        Welcome to The Corner!
                    </h2>

                    {/* Email Input */}
                    <div className="mb-6 relative">
                        <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="border rounded-lg w-full py-3 px-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                placeholder="Enter your email"
                                required
                            />
                            <div className="absolute inset-y-0 left-3 flex items-center">
                                <FaEnvelope className="text-gray-500" />
                            </div>
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="mb-6 relative">
                        <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                className="border rounded-lg w-full py-3 px-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                placeholder="Enter your password"
                                required
                            />
                            <div className="absolute inset-y-0 left-3 flex items-center">
                                <FaLock className="text-gray-500" />
                            </div>
                            <button
                                type="button"
                                className="absolute inset-y-0 right-3 flex items-center"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <FaEyeSlash className="text-gray-600" />
                                ) : (
                                    <FaEye className="text-gray-600" />
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
                    >
                        Login
                    </button>

                    <div className="flex justify-between items-center mt-4">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{" "}
                            <Link href="/register" className="text-blue-500 hover:underline">
                                Register
                            </Link>
                        </p>
                        <Link href="/forgot-password" className="text-sm text-blue-500 hover:underline">
                            Forgot Password?
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;