'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaIdCard, FaUser, FaHashtag, FaUpload } from 'react-icons/fa'; // Added FaUpload icon
import createSpecialDiscount from '@/app/actions/createSpecialDiscount';
import updateSpecialDiscount from '@/app/actions/updateSpecialDiscount';

export default function SpecialDiscount({ initialData, onSubmissionSuccess }) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [type, setType] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [fullName, setFullName] = useState('');

  // Use useEffect to pre-populate the form when initialData is available
  useEffect(() => {
    if (initialData) {
      setType(initialData.type || '');
      setIdNumber(initialData.id_number || '');
      setFullName(initialData.fname || '');
      setPreview(initialData.image_card || null);
    }
  }, [initialData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(initialData?.image_card || null); // Revert to initialData if no new file selected
    }
  };

  const handleIdChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');

    if (type === 'pwd') {
      if (value.length > 14) value = value.slice(0, 14);
      setIdNumber(value);
    } else if (type === 'senior-citizen') {
      if (value.length > 9) value = value.slice(0, 9);
      setIdNumber(value);
    } else {
      setIdNumber(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    formData.set('id_number', idNumber);

    // If an initial image_card exists and no new file is selected,
    // ensure the existing image_card URL is sent to the backend if needed
    // (This might require backend adjustment if `image_card` is always expected as a file)
    // For now, assuming backend handles missing file gracefully on update.

    let res;
    if (initialData) {
      // If initialData exists, we are in edit mode
      formData.append('id', initialData.$id);
      res = await updateSpecialDiscount(formData);
    } else {
      // Otherwise, we are creating a new one
      res = await createSpecialDiscount(formData);
    }

    if (res.success) {
      toast.success(initialData ? 'Application updated successfully!' : 'Application submitted successfully!');
      if (onSubmissionSuccess) {
        onSubmissionSuccess();
      }
    } else {
      toast.error(res.error || 'Failed to submit application');
    }

    setLoading(false);
  };

  const formTitle = initialData ? 'Edit Discount' : 'Special Discount';
  const formSubtitle = initialData ? 'Update details.' : 'Apply for PWD / Senior Citizen.';
  const buttonText = initialData ? 'Update Application' : 'Submit Application';

  return (
    <div className="relative w-full max-w-2xl h-auto mx-auto bg-neutral-900 text-white rounded-lg shadow-xl border border-pink-600 overflow-hidden">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row h-full">
        {/* Left Section - Condensed Info */}
        <div className="flex flex-col items-center justify-center p-4 md:p-6 border-b md:border-b-0 md:border-r border-neutral-700 w-full md:w-1/3 flex-shrink-0">
          <div className="flex items-center justify-center w-16 h-16 mb-2 bg-pink-600 rounded-full">
            <FaIdCard className="text-white text-3xl" />
          </div>
          <h3 className="text-xl font-bold text-pink-400 text-center leading-tight mb-1">
            {formTitle}
          </h3>
          <p className="text-sm font-semibold text-center text-gray-300">{formSubtitle}</p>
        </div>

        {/* Right Section: Form Fields */}
        <div className="flex flex-col justify-between flex-grow p-4 md:p-6 space-y-4">
          {initialData && (
            <input type="hidden" name="id" value={initialData.$id} />
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Type */}
            <div>
              <label htmlFor="discountType" className="block text-xs font-medium text-gray-400 mb-1">Type</label>
              <select
                id="discountType"
                name="type"
                required
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setIdNumber('');
                }}
                className="w-full border border-neutral-700 rounded-md px-3 py-2 bg-neutral-800 text-white text-sm focus:ring-pink-600 focus:border-pink-600"
              >
                <option value="">Select Type</option>
                <option value="pwd">PWD</option>
                <option value="senior-citizen">Senior Citizen</option>
              </select>
            </div>

            {/* Full Name */}
            <div className="relative">
              <label htmlFor="fullName" className="block text-xs font-medium text-gray-400 mb-1">Full Name</label>
              <div className="flex items-center border border-neutral-700 rounded-md bg-neutral-800">
                <FaUser className="text-pink-400 ml-3 text-sm" />
                <input
                  id="fullName"
                  type="text"
                  name="fname"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="flex-1 px-3 py-2 bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* ID Number */}
          <div className="relative">
            <label htmlFor="idNumber" className="block text-xs font-medium text-gray-400 mb-1">ID Number</label>
            <div className="flex items-center border border-neutral-700 rounded-md bg-neutral-800">
              <FaHashtag className="text-pink-400 ml-3 text-sm" />
              <input
                id="idNumber"
                type="text"
                name="id_number"
                value={idNumber}
                onChange={handleIdChange}
                placeholder={
                  type === 'pwd'
                    ? 'Format: 11111111111111 (14 digits)'
                    : type === 'senior-citizen'
                    ? 'Format: 111111111 (9 digits)'
                    : 'Select type first'
                }
                required
                className="flex-1 px-3 py-2 bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Upload Card and Preview */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-grow">
              <label htmlFor="idCard" className="block text-xs font-medium text-gray-400 mb-1">Upload ID Card ({initialData ? 'Optional' : 'Required'})</label>
              <div className="relative flex items-center border border-neutral-700 rounded-md bg-neutral-800 focus-within:ring-pink-600 focus-within:border-pink-600">
                <FaUpload className="text-gray-500 ml-3 text-sm" />
                <input
                  id="idCard"
                  type="file"
                  name="image_card"
                  accept="image/*"
                  required={!initialData}
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  aria-label="Upload ID Card"
                />
                <span className="flex-1 px-3 py-2 text-sm text-gray-400 truncate">
                  {preview && !preview.startsWith('blob:') ? 'Existing ID' : (preview ? 'New file selected' : 'Choose file...')}
                </span>
              </div>
            </div>
            {preview && (
              <div className="flex-shrink-0">
                <img
                  src={preview}
                  alt="ID Card Preview"
                  className="w-24 h-16 object-cover rounded-md border border-neutral-700"
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 text-white py-2 rounded-md hover:bg-pink-700 disabled:opacity-50 text-base font-semibold transition-colors duration-200"
          >
            {loading ? 'Submitting...' : buttonText}
          </button>
        </div>
      </form>
    </div>
  );
}