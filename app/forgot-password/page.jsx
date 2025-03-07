'use client';

import { useState } from "react";
import { toast } from "react-toastify";
import { createAdminClient } from "@/config/appwrite";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const adminClient = await createAdminClient();

            // Appwrite's createRecovery method sends the password reset link
            await adminClient.account.createRecovery(
                email,
                `${window.location.origin}/reset-password` // Reset password page URL
            );

            toast.success("Password reset link has been sent to your email.");
        } catch (error) {
            console.error("Error sending recovery email:", error);
            toast.error(
                error?.response?.message || "Failed to send password reset link. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center">
            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm mt-20">
                <form onSubmit={handleForgotPassword}>
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                        Forgot Password
                    </h2>

                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
