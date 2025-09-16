"use client";

import { useEffect, useState } from "react";

const ManageTable = ({
  isOpen,
  onClose,
  initialTable,
  onSave,
  isUpdating,
}) => {
  const [newTableNumber, setNewTableNumber] = useState(initialTable || null);

  useEffect(() => {
    setNewTableNumber(initialTable || null);
  }, [initialTable]);

  if (!isOpen) return null;

  const handleTableClick = (num) => {
    // If the clicked table is already selected, unselect it.
    // Otherwise, select the new table.
    setNewTableNumber(newTableNumber === num ? null : num);
  };

  const handleSave = () => {
    onSave(newTableNumber);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-neutral-800 p-6 rounded-lg w-full max-w-md">
        <h3 className="text-lg font-semibold text-white mb-4">
          Select a Table
        </h3>

        {/* Table grid like cinema seats */}
        <div className="grid grid-cols-5 gap-3 justify-center">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              // Use the new toggle handler
              onClick={() => handleTableClick(num)}
              className={`w-12 h-12 flex items-center justify-center rounded-md border 
                ${
                  newTableNumber === num
                    ? "bg-pink-500 text-white border-pink-500"
                    : "bg-neutral-900 text-neutral-300 border-neutral-600 hover:bg-neutral-700"
                }`}
            >
              {num}
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="text-xs px-4 py-1.5 rounded border border-neutral-400 text-neutral-400 hover:bg-neutral-600 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            // `disabled` is now handled by checking if a table is selected
            disabled={isUpdating}
            className="text-xs px-4 py-1.5 rounded border border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white transition disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageTable;