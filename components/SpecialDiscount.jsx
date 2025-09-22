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
  FaSyncAlt,
  FaExclamationCircle
} from 'react-icons/fa';
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
  const [isAccessGranted, setIsAccessGranted] = useState(false);
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

  // Request camera permission and get devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setIsAccessGranted(true);
        stream.getTracks().forEach((track) => track.stop());

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
        console.error('Error fetching devices or permission denied:', err);
        setIsAccessGranted(false);
        if (err.name === 'NotAllowedError') {
          toast.error('Camera access was denied. Please enable it in your browser settings.');
        } else {
          toast.error('Unable to access cameras.');
        }
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
        toast.error('Camera access denied or device not found');
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

    const currentDevice = devices.find((d) => d.deviceId === currentDeviceId);
    const isCurrentBackCam = /back|rear|environment/i.test(currentDevice?.label || '');

    let nextDevice;
    if (isCurrentBackCam) {
      nextDevice = devices.find((d) => /front|user/i.test(d.label)) || devices.find((d) => !/back|rear|environment/i.test(d.label));
    } else {
      nextDevice = devices.find((d) => /back|rear|environment/i.test(d.label));
    }

    if (nextDevice) {
      setCurrentDeviceId(nextDevice.deviceId);
      setCurrentLabel(
        /back|rear|environment/i.test(nextDevice.label || '')
          ? 'Back Camera'
          : /front|user/i.test(nextDevice.label || '')
          ? 'Front Camera'
          : nextDevice.label || 'Camera'
      );
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
    else setPreview(null);
  };

  const handleIdChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // remove non-digits
  
    if (type === 'pwd') {
      // Format: XX-XXXX-XXX-XXXXX
      if (value.length > 2) value = value.slice(0, 2) + '-' + value.slice(2);
      if (value.length > 7) value = value.slice(0, 7) + '-' + value.slice(7);
      if (value.length > 11) value = value.slice(0, 11) + '-' + value.slice(11);
      if (value.length > 17) value = value.slice(0, 17); // max length
    } else if (type === 'senior-citizen') {
      value = value.slice(0, 9); // max 9 digits only
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

  const captureImage = async () => {
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
                <span className="hidden sm:inline">Camera</span>
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
                {!isAccessGranted ? (
                  <div className="text-center text-gray-400 p-4">
                    <FaExclamationCircle className="inline text-2xl text-red-500 mb-2" />
                    <p>
                      Camera access is required for scanning.
                      <br />
                      Please grant permission in your browser settings.
                    </p>
                  </div>
                ) : (
                  <>
                    {!scanning ? (
                      <button
                        type="button"
                        onClick={startScanner}
                        className="w-full bg-pink-600 px-4 py-2 rounded-md"
                      >
                        <FaCamera className="inline mr-2" /> Start Camera
                      </button>
                    ) : (
                      <div className="flex flex-col items-center w-full">
                        <div className="relative w-full max-w-sm rounded-md overflow-hidden aspect-video">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="absolute top-0 left-0 w-full h-full object-cover"
                          />
                        </div>

                        <canvas ref={canvasRef} className="hidden"></canvas>

                        <p className="text-xs text-gray-400 text-center mb-2">
                          Using: {currentLabel}
                        </p>

                        <div className="flex gap-2 w-full justify-center flex-wrap">
                          <button
                            type="button"
                            onClick={captureImage}
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

                        {devices.length < 2 && (
                          <p className="text-xs text-gray-400 mt-1">
                            No other camera available
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

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
                placeholder="JOHN D. DOE"
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

        {/* Data Privacy Notice */}
        <div className="p-4 space-y-2 bg-neutral-900 rounded-md border border-neutral-700 text-sm mx-4 mb-4">
          <h4 className="font-semibold text-pink-400 flex items-center gap-2">
            <FaExclamationCircle className="text-pink-400" /> Data Privacy Notice
          </h4>
          <p className="text-gray-300">
            We collect your full name, ID number, and a photo of your valid PWD or Senior Citizen card solely for the purpose of verifying your eligibility for a special discount.
          </p>
          <p className="text-gray-300">
            This data will be handled securely and in strict compliance with the Data Privacy Act of 2012 (Republic Act No. 10173). Your information will not be shared with third parties and will be used exclusively for its stated purpose.
          </p>
          <div className="flex items-start mt-4">
            <input
              type="checkbox"
              id="privacyConsent"
              name="privacyConsent"
              required
              className="mt-1 mr-2 accent-pink-600"
            />
            <label htmlFor="privacyConsent" className="text-gray-400 text-xs">
              I have read and agree to the collection and use of my personal data as described above.
            </label>
          </div>
        </div>

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
          
          <div className="mt-4 p-3 bg-blue-900 text-blue-200 rounded-md text-sm text-center">
            <p>
              Please be ready to present your physical PWD or Senior Citizen ID at the counter to verify your discount upon pickup.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}