'use client';

import { useState } from "react";

const CheckoutButton = ({ cart, total, onCheckoutSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");

  const isValidPhone = phone => /^09\d{9}$/.test(phone);

  const handleCheckout = async () => {
    if (!isValidPhone(phone)) {
      setMessage("Invalid phone number format. Use 09XXXXXXXXX.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const user = JSON.parse(localStorage.getItem("user")) || {};

      // 1. Checkout with Xendit
      const response = await fetch("/api/xendit/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, user, totalAmount: total }),
      });

      const result = await response.json();

      if (result.success) {
        // Format phone before sending to Twilio
        const formattedPhone = phone.replace(/^0/, "+63");

        // 2. Send SMS with Twilio
        const smsRes = await fetch("/api/twilio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: formattedPhone,
            name: user.name || "Customer",
          }),
        });

        const smsResult = await smsRes.json();

        if (!smsResult.success) {
          setMessage(`Order placed, but SMS failed: ${smsResult.message}`);
        } else {
          setMessage("Order placed! SMS sent successfully.");
        }

        localStorage.removeItem("cart");
        onCheckoutSuccess?.();
        setTimeout(() => {
          window.location.href = result.redirect_url;
        }, 1000);
      } else {
        setMessage(result.message || "Checkout failed.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  return (
    <div className="w-full flex flex-col items-center mt-6 space-y-4">
      <input
        type="tel"
        placeholder="(09XXXXXXXXX)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full max-w-xs px-4 py-2 rounded-md border border-gray-600 bg-neutral-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
      />

      <button
        onClick={handleCheckout}
        disabled={loading || !isValidPhone(phone)}
        aria-busy={loading}
        className={`w-full max-w-xs px-4 py-2 rounded-md font-medium transition ${
          loading || !isValidPhone(phone)
            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
            : "bg-pink-600 text-white hover:bg-pink-700"
        }`}
      >
        {loading ? "Processing..." : "Checkout Order"}
      </button>

      {message && (
        <p className="mt-2 text-sm text-center text-red-400">{message}</p>
      )}
    </div>
  );
};

export default CheckoutButton;
