'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import {
  FaIdCard,
  FaUser,
  FaHashtag,
  FaUpload,
  FaCamera,
  FaTimesCircle,
  FaSyncAlt
} from 'react-icons/fa';
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
  const [mode, setMode] = useState('upload');

  // Scanner states
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState([]);
  const [currentDeviceId, setCurrentDeviceId] = useState(null);
  const [currentLabel, setCurrentLabel] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Load initial data
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

  // Get cameras (prefer back camera if available)
  useEffect(() => {
    const getDevices = async () => {
      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter((d) => d.kind === 'videoinput');
        setDevices(videoDevices);

        if (videoDevices.length > 0) {
          const backCam = videoDevices.find((d) =>
            /back|rear|environment/i.test(d.label)
          );
          const chosen = backCam || videoDevices[0];
          setCurrentDeviceId(chosen.deviceId);
          setCurrentLabel(
            /back|rear|environment/i.test(chosen.label)
              ? 'Back Camera'
              : /front|user/i.test(chosen.label)
              ? 'Front Camera'
              : chosen.label || 'Camera'
          );
        }
      } catch (err) {
        console.error('Error fetching devices:', err);
        toast.error('Unable to access cameras');
      }
    };

    getDevices();
  }, []);

  // Start camera stream
  useEffect(() => {
    const startCamera = async () => {
      if (!scanning || !currentDeviceId) return;

      try {
        if (videoRef.current?.srcObject) {
          videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: currentDeviceId } }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Update label
        const device = devices.find((d) => d.deviceId === currentDeviceId);
        setCurrentLabel(
          /back|rear|environment/i.test(device?.label || '')
            ? 'Back Camera'
            : /front|user/i.test(device?.label || '')
            ? 'Front Camera'
            : device?.label || 'Camera'
        );
      } catch (err) {
        console.error('Camera error:', err);
        toast.error('Camera access denied');
        setScanning(false);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, [scanning, currentDeviceId, devices]);

  const switchCamera = () => {
    if (devices.length < 2) {
      toast.info('No other camera available');
      return;
    }

    const currentIndex = devices.findIndex((d) => d.deviceId === currentDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    setCurrentDeviceId(devices[nextIndex].deviceId);
    setCurrentLabel(
      /back|rear|environment/i.test(devices[nextIndex].label || '')
        ? 'Back Camera'
        : /front|user/i.test(devices[nextIndex].label || '')
        ? 'Front Camera'
        : devices[nextIndex].label || 'Camera'
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
    else setPreview(null);
  };

  const handleIdChange = (e) => {
    let value = e.target.value;
    if (type === 'pwd') {
      value = value.replace(/[^0-9-]/g, '');
    } else if (type === 'senior-citizen') {
      value = value.replace(/\D/g, '').slice(0, 9);
    }
    setIdNumber(value);
  };

  const startScanner = () => setScanning(true);

  const stopScanner = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
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

    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], 'scanned-id.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[name="image_card"]');
    if (fileInput) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInput.files = dt.files;
    }

    toast.info('Extracting text from ID...');
    const {
      data: { text }
    } = await Tesseract.recognize(dataUrl, 'eng');
    console.log('OCR Result:', text);

    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

    let nameLine = lines.find(
      (l) => /^[A-Z\s\.]+$/.test(l) && l.split(/\s+/).length >= 2
    );
    if (nameLine) setFullName(nameLine);

    const seniorMatch = text.match(/\b\d{9}\b/);
    const pwdMatch = text.match(/\d{2}-\d{4}-\d{3}-\d{5}/);

    if (type === 'pwd' && pwdMatch) {
      setIdNumber(pwdMatch[0]);
    } else if (type === 'senior-citizen' && seniorMatch) {
      setIdNumber(seniorMatch[0]);
    } else {
      const idMatch = lines.find((l) => /\d+/.test(l));
      if (idMatch) {
        let extracted = idMatch.replace(/\D/g, '');
        if (type === 'pwd' && extracted.length > 14) {
          extracted =
            extracted.slice(0, 2) +
            '-' +
            extracted.slice(2, 6) +
            '-' +
            extracted.slice(6, 9) +
            '-' +
            extracted.slice(9, 14);
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
      toast.success(
        initialData ? 'Application updated successfully!' : 'Application submitted successfully!'
      );
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
                className={`px-3 py-2 rounded-md flex-1 text-xs sm:text-base ${
                  mode === 'upload' ? 'bg-pink-600' : 'bg-neutral-700'
                }`}
              >
                <FaUpload className="inline mr-1 sm:mr-2" />{' '}
                <span className="hidden sm:inline">Upload</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('scanner')}
                className={`px-3 py-2 rounded-md flex-1 text-xs sm:text-base ${
                  mode === 'scanner' ? 'bg-pink-600' : 'bg-neutral-700'
                }`}
              >
                <FaCamera className="inline mr-1 sm:mr-2" />{' '}
                <span className="hidden sm:inline">Scanner</span>
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
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full max-w-sm h-auto bg-black rounded-md mb-2 aspect-video"
                    />
                    <canvas ref={canvasRef} className="hidden"></canvas>

                    {/* Show current camera */}
                    <p className="text-xs text-gray-400 text-center mb-2">
                      Using: {currentLabel}
                    </p>

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
                        onClick={switchCamera}
                        disabled={devices.length < 2}
                        className={`px-3 py-2 rounded-md text-sm flex-1 sm:flex-none ${
                          devices.length < 2
                            ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                            : 'bg-neutral-700 text-white'
                        }`}
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

                    {/* No other camera hint */}
                    {devices.length < 2 && (
                      <p className="text-xs text-gray-400 mt-1">
                        No other camera available
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Preview */}
            {preview && (
              <div className="flex justify-center mt-3">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-w-sm h-auto object-cover rounded-md border aspect-video"
                />
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
                placeholder={
                  type === 'pwd'
                    ? 'XX-XXXX-XXX-XXXXX'
                    : type === 'senior-citizen'
                    ? '9 digits only'
                    : 'Select type first'
                }
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
            {loading
              ? 'Submitting...'
              : initialData
              ? 'Update Application'
              : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
}
