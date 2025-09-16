'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { FaIdCard, FaUser, FaHashtag, FaUpload, FaCamera } from 'react-icons/fa';
import Tesseract from 'tesseract.js';
import createSpecialDiscount from '@/app/actions/createSpecialDiscount';
import updateSpecialDiscount from '@/app/actions/updateSpecialDiscount';

const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

export default function SpecialDiscount({ initialData, onSubmissionSuccess }) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [type, setType] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [mode, setMode] = useState('upload'); // upload or scanner

  // Scanner
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || '');
      setIdNumber(initialData.id_number || '');
      setFullName(initialData.fname || '');

      if (initialData.image_card) {
        setPreview(
          `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${initialData.image_card}/view?project=${PROJECT_ID}`
        );
      } else {
        setPreview(null);
      }
    }
  }, [initialData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const handleIdChange = (e) => {
    let value = e.target.value;

    if (type === 'pwd') {
      value = value.replace(/[^0-9]/g, ''); // only digits
      value = value.slice(0, 14); // max 14 digits
      if (value.length > 2) value = value.slice(0, 2) + '-' + value.slice(2);
      if (value.length > 7) value = value.slice(0, 7) + '-' + value.slice(7);
      if (value.length > 11) value = value.slice(0, 11) + '-' + value.slice(11);
    } else if (type === 'senior-citizen') {
      value = value.replace(/\D/g, '').slice(0, 9);
    }

    setIdNumber(value);
  };

  const startScanner = async () => {
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast.error('Camera access denied');
    }
  };

  const captureAndExtract = async () => {
    if (!videoRef.current || !canvasRef.current) return;
  
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
  
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
    const dataUrl = canvas.toDataURL('image/png');
    setPreview(dataUrl);
  
    // ✅ Convert canvas image to File and inject into hidden file input
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], 'scanned-id.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[name="image_card"]');
    if (fileInput) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;
    }
  
    // OCR with Tesseract.js
    toast.info('Extracting text from ID...');
    const { data: { text } } = await Tesseract.recognize(dataUrl, 'eng');
    console.log('OCR Result:', text);
  
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
    // 🔹 Extract Name (all caps, at least 2 words)
    let nameLine = lines.find(l =>
      /^[A-Z\s\.]+$/.test(l) && l.split(/\s+/).length >= 2
    );
    if (nameLine) {
      setFullName(nameLine);
    }
  
    // 🔹 Extract ID Numbers
    const seniorMatch = text.match(/\b\d{9}\b/);
    const pwdMatch = text.match(/\d{2}-\d{4}-\d{3}-\d{5}/);
  
    if (type === 'pwd' && pwdMatch) {
      const cleaned = pwdMatch[0].replace(/-/g, '');
      setIdNumber(cleaned);
    } else if (type === 'senior-citizen' && seniorMatch) {
      setIdNumber(seniorMatch[0]);
    } else {
      const idMatch = lines.find(l => /\d+/.test(l));
      if (idMatch) {
        let extracted = idMatch.replace(/\D/g, '');
        if (type === 'pwd' && extracted.length > 14) extracted = extracted.slice(0, 14);
        if (type === 'senior-citizen' && extracted.length > 9) extracted = extracted.slice(0, 9);
        setIdNumber(extracted);
      }
    }
  
    if (video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
    }
    setScanning(false);
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    formData.set('id_number', idNumber);

    let res;
    if (initialData) {
      formData.append('id', initialData.$id);
      res = await updateSpecialDiscount(formData);
    } else {
      res = await createSpecialDiscount(formData);
    }

    if (res.success) {
      toast.success(initialData ? 'Application updated successfully!' : 'Application submitted successfully!');
      if (onSubmissionSuccess) onSubmissionSuccess();
    } else {
      toast.error(res.error || 'Failed to submit application');
    }

    setLoading(false);
  };

  return (
    <div className="relative w-full max-w-2xl h-auto mx-auto bg-neutral-900 text-white rounded-lg shadow-xl border border-pink-600 overflow-hidden">
      <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[85vh]">
        {/* Header */}
        <div className="flex flex-col items-center p-4 text-center border-b border-neutral-700">
          <div className="flex items-center justify-center w-12 h-12 mb-2 bg-pink-600 rounded-full">
            <FaIdCard className="text-white text-2xl" />
          </div>
          <h3 className="text-xl font-bold text-pink-400">
            {initialData ? 'Edit Discount' : 'Special Discount'}
          </h3>
          <p className="text-sm text-gray-300">
            {initialData ? 'Update details.' : 'Apply for PWD / Senior Citizen.'}
          </p>
        </div>

        {/* Form */}
        <div className="flex flex-col flex-grow p-4 space-y-4 overflow-y-auto">
          {/* Type */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Type</label>
            <select
              name="type"
              value={type}
              required
              onChange={(e) => {
                setType(e.target.value);
                setIdNumber('');
              }}
              className="w-full border border-neutral-700 rounded-md px-3 py-2 bg-neutral-800 text-sm"
            >
              <option value="">Select Type</option>
              <option value="pwd">PWD</option>
              <option value="senior-citizen">Senior Citizen</option>
            </select>
          </div>

          {/* Upload/Scanner Section */}
          <div>
            {/* Hidden file input for scanner injection */}
            <input type="file" name="image_card" accept="image/*" className="hidden" />

            <label className="block text-xs text-gray-400 mb-1">Verification Method</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setMode('upload')}
                className={`px-4 py-2 rounded-md ${mode === 'upload' ? 'bg-pink-600' : 'bg-neutral-700'}`}
              >
                <FaUpload className="inline mr-2" /> Upload
              </button>
              <button
                type="button"
                onClick={() => setMode('scanner')}
                className={`px-4 py-2 rounded-md ${mode === 'scanner' ? 'bg-pink-600' : 'bg-neutral-700'}`}
              >
                <FaCamera className="inline mr-2" /> Scanner
              </button>
            </div>

            {/* Upload Mode */}
            {mode === 'upload' && (
              <div className="mt-2">
                <input
                  type="file"
                  name="image_card"
                  accept="image/*"
                  required={!initialData}
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-400"
                />
              </div>
            )}

            {/* Scanner Mode */}
            {mode === 'scanner' && (
              <div className="flex flex-col items-center mt-2">
                {!scanning ? (
                  <button
                    type="button"
                    onClick={startScanner}
                    className="bg-pink-600 px-4 py-2 rounded-md"
                  >
                    Start Scanner
                  </button>
                ) : (
                  <div className="flex flex-col items-center">
                    <video ref={videoRef} autoPlay playsInline className="w-64 h-40 bg-black rounded-md mb-2" />
                    <canvas ref={canvasRef} className="hidden"></canvas>
                    <button
                      type="button"
                      onClick={captureAndExtract}
                      className="bg-white text-black px-4 py-2 rounded-md"
                    >
                      Capture & Extract
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Preview */}
            {preview && (
              <div className="flex justify-center mt-3">
                <img src={preview} alt="Preview" className="w-32 h-20 object-cover rounded-md border" />
              </div>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Full Name</label>
            <div className="flex items-center border border-neutral-700 rounded-md bg-neutral-800">
              <FaUser className="text-pink-400 ml-3 text-sm" />
              <input
                type="text"
                name="fname"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="John D. Doe"
                className="flex-1 px-3 py-2 bg-transparent text-sm"
              />
            </div>
          </div>

          {/* ID Number */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">ID Number</label>
            <div className="flex items-center border border-neutral-700 rounded-md bg-neutral-800">
              <FaHashtag className="text-pink-400 ml-3 text-sm" />
              <input
                type="text"
                name="id_number"
                value={idNumber}
                onChange={handleIdChange}
                required
                placeholder={type === 'pwd'
                  ? '14 digit only'
                  : type === 'senior-citizen'
                  ? '9 digits only'
                  : 'Select type first'}
                className="flex-1 px-3 py-2 bg-transparent text-sm"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="p-4 border-t border-neutral-700">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 py-2 rounded-md font-semibold"
          >
            {loading ? 'Submitting...' : initialData ? 'Update Application' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
}
