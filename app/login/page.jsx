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
        if (state.error) {
            toast.error(state.error);
        }

        if (state.success) {
            toast.success("Logged in successfully!");
            setIsAuthenticated(true);
            checkAuthentication();

            if (state.roles?.isAdmin) {
                router.push("/admin");
            } else if (state.roles?.isFoodstall) {
                router.push("/foodstall");
            } else {
                router.push("/home");
            }
        }
    }, [state]);

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-yellow-400/50  to-pink-600/50 flex items-center justify-center p-6">
            <div
                className="relative z-10 bg-cover bg-center bg-no-repeat rounded-3xl shadow-lg w-full max-w-md"
                style={{ backgroundImage: "url('/images/card.jpg')" }}
            >
                <div className="bg-white bg-opacity-80 rounded-3xl p-12">
                    <form action={formAction} className="space-y-8">
                        <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-6">
                            Welcome to <span className="text-pink-600">THE CORNER</span>!
                        </h2>

                        {/* Email Input */}
                        <div className="relative">
                            <label htmlFor="email" className="block text-gray-700 font-semibold mb-3 text-lg">
                                Email
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="border rounded-lg w-full py-4 px-12 text-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                                    placeholder="Enter your email"
                                    required
                                />
                                <div className="absolute inset-y-0 left-4 flex items-center">
                                    <FaEnvelope className="text-gray-500" />
                                </div>
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="relative">
                            <label htmlFor="password" className="block text-gray-700 font-semibold mb-3 text-lg">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    className="border rounded-lg w-full py-4 px-12 text-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                                    placeholder="Enter your password"
                                    required
                                />
                                <div className="absolute inset-y-0 left-4 flex items-center">
                                    <FaLock className="text-gray-500" />
                                </div>
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-4 flex items-center"
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
                            className="w-full py-4 bg-pink-600 text-white rounded-lg text-xl font-medium hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-300"
                        >
                            Login
                        </button>

                        <div className="flex justify-between items-center mt-6 text-lg">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{" "}
                                <Link href="/register" className="text-pink-600 hover:underline">
                                    Register
                                </Link>
                            </p>
                            <Link href="/forgot-password" className="text-sm text-pink-600 hover:underline">
                                Forgot Password?
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
