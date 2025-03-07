'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { createSessionClient } from "@/config/appwrite";

const ResetPasswordPage = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);

        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get("userId");
        const secret = urlParams.get("secret");

        if (!userId || !secret) {
            toast.error("Invalid password reset link.");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            const sessionClient = await createSessionClient();
            await sessionClient.account.updateRecovery(userId, secret, password, confirmPassword);

            toast.success("Password reset successfully! Please log in.");
            router.push("/login");
        } catch (error) {
            toast.error(error.message || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center">
            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm mt-20">
                <form onSubmit={handleResetPassword}>
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                        Reset Password
                    </h2>

                    <div className="mb-4">
                        <label htmlFor="password" className="block text-gray-700 font-bold mb-2">
                            New Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border rounded w-full py-2 px-3"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label
                            htmlFor="confirmPassword"
                            className="block text-gray-700 font-bold mb-2"
                        >
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="border rounded w-full py-2 px-3"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 ${
                            loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={loading}
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
