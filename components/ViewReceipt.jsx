// ViewReceipt.js

"use client";

import OrderReceipt from "./OrderReceipt"; // Changed OrderCard to OrderReceipt based on typical usage
import { FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const ViewReceipt = ({ order, onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        // Adjusted the top padding to make sure the receipt is not behind a header.
        className="fixed inset-0 bg-gray-950 bg-opacity-80 backdrop-blur-sm z-40 flex justify-center pt-24 p-4 overflow-y-auto"
      >
        <div className="flex flex-col items-center gap-4 w-full max-w-xl">
          {/* Receipt Content */}
          <motion.div
            initial={{ rotateX: 90, opacity: 0, scale: 0.8 }}
            animate={{ rotateX: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            className="relative w-full rounded-lg shadow-2xl"
          >
            {/* Using OrderReceipt which contains the actual receipt structure */}
            <OrderReceipt order={order} /> 

            {/* Close Button on top of the receipt content container */}
            <button
              onClick={onClose}
              // ADDED w-8, h-8, flex, items-center, and justify-center for a perfect circle and centered icon
              className="absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center bg-pink-600 text-white rounded-full shadow-lg transition-transform transform hover:scale-110 z-50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-75"
              aria-label="Close receipt"
            >
              <FaTimes size={18} /> {/* Reduced size for a better fit */}
            </button>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ViewReceipt;