'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { FaIdCard, FaUser, FaHashtag, FaUpload, FaCamera, FaTimesCircle, FaSyncAlt } from 'react-icons/fa';
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
  const [facingMode, setFacingMode] = useState('user'); // 'user' for front, 'environment' for rear
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
      value = value.replace(/[^0-9-]/g, ''); // only digits and hyphens
      setIdNumber(value);
    } else if (type === 'senior-citizen') {
      value = value.replace(/\D/g, '').slice(0, 9);
      setIdNumber(value);
    } else {
      setIdNumber(value);
    }
  };

  const startScanner = async () => {
    setScanning(true);
    try {
      const constraints = {
        video: {
          facingMode: facingMode
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      toast.error('Camera access denied. Please check your permissions.');
      setScanning(false);
    }
  };
  
  const stopScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
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
  
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], 'scanned-id.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[name="image_card"]');
    if (fileInput) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;
    }
  
    toast.info('Extracting text from ID...');
    const { data: { text } } = await Tesseract.recognize(dataUrl, 'eng');
    console.log('OCR Result:', text);
  
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
    let nameLine = lines.find(l =>
      /^[A-Z\s\.]+$/.test(l) && l.split(/\s+/).length >= 2
    );
    if (nameLine) {
      setFullName(nameLine);
    }
  
    const seniorMatch = text.match(/\b\d{9}\b/);
    const pwdMatch = text.match(/\d{2}-\d{4}-\d{3}-\d{5}/);
  
    if (type === 'pwd' && pwdMatch) {
      setIdNumber(pwdMatch[0]);
    } else if (type === 'senior-citizen' && seniorMatch) {
      setIdNumber(seniorMatch[0]);
    } else {
      const idMatch = lines.find(l => /\d+/.test(l));
      if (idMatch) {
        let extracted = idMatch.replace(/\D/g, '');
        if (type === 'pwd' && extracted.length > 14) {
          extracted = extracted.slice(0, 2) + '-' + extracted.slice(2, 6) + '-' + extracted.slice(6, 9) + '-' + extracted.slice(9, 14);
        } else if (type === 'senior-citizen' && extracted.length > 9) {
          extracted = extracted.slice(0, 9);
        }
        setIdNumber(extracted);
      }
    }
  
    stopScanner();
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
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="flex flex-col">
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
        <div className="flex flex-col p-4 space-y-4">
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
            <input type="file" name="image_card" accept="image/*" className="hidden" />

            <label className="block text-xs text-gray-400 mb-1">Verification Method</label>
            <div className="flex gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => {
                  setMode('upload');
                  stopScanner();
                }}
                className={`px-3 py-2 rounded-md flex-1 text-xs sm:text-base ${mode === 'upload' ? 'bg-pink-600' : 'bg-neutral-700'}`}
              >
                <FaUpload className="inline mr-1 sm:mr-2" /> <span className="hidden sm:inline">Upload</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('scanner');
                  setFacingMode('environment'); // Default to rear camera for scanning IDs
                }}
                className={`px-3 py-2 rounded-md flex-1 text-xs sm:text-base ${mode === 'scanner' ? 'bg-pink-600' : 'bg-neutral-700'}`}
              >
                <FaCamera className="inline mr-1 sm:mr-2" /> <span className="hidden sm:inline">Scanner</span>
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
                    className="w-full bg-pink-600 px-4 py-2 rounded-md"
                  >
                    <FaCamera className="inline mr-2" /> Start Scanner
                  </button>
                ) : (
                  <div className="flex flex-col items-center w-full">
                    <video ref={videoRef} autoPlay playsInline className="w-full max-w-sm h-auto bg-black rounded-md mb-2 aspect-video" />
                    <canvas ref={canvasRef} className="hidden"></canvas>
                    <div className="flex gap-2 w-full justify-center flex-wrap">
                      <button
                        type="button"
                        onClick={captureAndExtract}
                        className="bg-white text-black px-3 py-2 rounded-md text-sm flex-1 sm:flex-none"
                      >
                        <FaCamera className="inline mr-1" /> Capture
                      </button>
                      <button
                        type="button"
                        onClick={() => setFacingMode(facingMode === 'user' ? 'environment' : 'user')}
                        className="bg-neutral-700 text-white px-3 py-2 rounded-md text-sm flex-1 sm:flex-none"
                      >
                        <FaSyncAlt className="inline mr-1" /> Switch
                      </button>
                      <button
                        type="button"
                        onClick={stopScanner}
                        className="bg-neutral-700 text-white px-3 py-2 rounded-md text-sm flex-1 sm:flex-none"
                      >
                        <FaTimesCircle className="inline mr-1" /> Stop
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Preview */}
            {preview && (
              <div className="flex justify-center mt-3">
                <img src={preview} alt="Preview" className="w-full max-w-sm h-auto object-cover rounded-md border aspect-video" />
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
                  ? 'XX-XXXX-XXX-XXXXX'
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