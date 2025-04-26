"use client";

import { useState } from "react";

const CheckoutButton = ({ cart, total, onCheckoutSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleCheckout = async () => {
    setLoading(true);
    setMessage("");

    try {
      const user = JSON.parse(localStorage.getItem("user")) || {}; // Fetch user info from localStorage

      const response = await fetch("/api/xendit/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: cart, user, totalAmount: total }), // Send final total to backend
      });

      const result = await response.json();

      if (result.success) {
        localStorage.removeItem("cart"); // Clear cart on success

        onCheckoutSuccess?.(); // Notify parent component

        window.location.href = result.redirect_url; // Redirect to payment
      } else {
        setMessage(result.message || "Checkout failed.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000); // Reset message after 3 seconds
    }
  };

  return (
    <div className="w-full flex flex-col items-center mt-8">
      <button
        onClick={handleCheckout}
        disabled={loading}
        aria-busy={loading}
        className={`px-6 py-3 rounded-lg text-white font-semibold transition ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "Redirecting for Payment..." : "Checkout Order"}
      </button>
      {message && <p className="mt-2 text-sm text-center text-red-600">{message}</p>}
    </div>
  );
};

export default CheckoutButton;
