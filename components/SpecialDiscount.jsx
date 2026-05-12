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
  FaExclamationCircle,
  FaInfoCircle
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
  const [agreedToDPA, setAgreedToDPA] = useState(false);

  // Scanner states
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState([]);
  const [currentDeviceId, setCurrentDeviceId] = useState(null);
  const [currentLabel, setCurrentLabel] = useState('');
  const [isAccessGranted, setIsAccessGranted] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

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
    let value = e.target.value.replace(/\D/g, '');
  
    if (type === 'pwd') {
      if (value.length > 2) value = value.slice(0, 2) + '-' + value.slice(2);
      if (value.length > 7) value = value.slice(0, 7) + '-' + value.slice(7);
      if (value.length > 11) value = value.slice(0, 11) + '-' + value.slice(11);
      if (value.length > 17) value = value.slice(0, 17);
    } else if (type === 'senior-citizen') {
      value = value.slice(0, 9);
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

    const fileInput = fileInputRef.current;
    if (fileInput) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;
    }

    stopScanner();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreedToDPA) {
      toast.error('Please agree to the Data Privacy Notice to proceed.');
      return;
    }

    setLoading(true);

    const formData = new FormData(e.target);
    formData.set('id_number', idNumber);
    
    const imageFile = fileInputRef.current.files[0];

    if (initialData && !imageFile) {
      // Server action handles missing image gracefully for updates
    }

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

  const dpaNotice = (
    <>
      <div className="flex items-center text-neutral-950 font-black uppercase tracking-widest text-xs mb-3 gap-2">
        <FaInfoCircle className="text-red-600 flex-shrink-0" /> Data Privacy Notice
      </div>
      <p className="text-sm text-neutral-700 mb-2 leading-relaxed">
        We collect your full name, ID number, and a photo of your valid PWD or Senior Citizen card solely for the purpose of verifying your eligibility for a special discount.
      </p>
      <p className="text-sm text-neutral-700 leading-relaxed">
        This data will be handled securely and in strict compliance with the Data Privacy Act of 2012 (Republic Act No. 10173). Your information will not be shared with third parties and will be used exclusively for its stated purpose.
      </p>
    </>
  );

  return (
    <div className="relative w-full bg-white text-neutral-950 font-sans selection:bg-red-600 selection:text-white">
      <form onSubmit={handleSubmit} className="flex flex-col">

        {/* ── HEADER ── */}
        <div className="bg-neutral-950 text-white px-8 py-6">
          <span className="text-xs font-black tracking-[0.4em] text-red-400 uppercase block mb-2">
            {initialData ? 'EDIT' : 'APPLY'}
          </span>
          <h3 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
            <FaIdCard className="text-red-500" />
            {initialData ? 'Edit Discount' : 'Special Discount'}
          </h3>
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mt-2">
            {initialData ? 'Update your PWD / Senior Citizen details.' : 'Apply for PWD / Senior Citizen discount.'}
          </p>
        </div>

        {/* ── FORM BODY ── */}
        <div className="flex flex-col p-6 gap-6">

          {/* Card Type */}
          <div>
            <label className="block text-xs font-black tracking-[0.3em] uppercase text-neutral-500 mb-2">Card Type</label>
            <select
              name="type"
              value={type}
              required
              onChange={(e) => { setType(e.target.value); setIdNumber(''); }}
              className="w-full border-4 border-neutral-950 px-3 py-3 bg-white text-black font-bold text-sm focus:outline-none focus:border-red-600 transition-colors cursor-pointer"
            >
              <option value="">— SELECT TYPE —</option>
              <option value="pwd">PWD</option>
              <option value="senior-citizen">Senior Citizen</option>
            </select>
          </div>

          {/* Verification Method */}
          <div>
            <label className="block text-xs font-black tracking-[0.3em] uppercase text-neutral-500 mb-2">Verification Method</label>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setMode('upload'); stopScanner(); }}
                className={`flex-1 py-3 border-4 font-black text-xs uppercase tracking-widest transition-all ${
                  mode === 'upload'
                    ? 'bg-neutral-950 text-white border-neutral-950'
                    : 'bg-white text-neutral-950 border-neutral-950 hover:bg-neutral-950 hover:text-white'
                }`}>
                <FaUpload className="inline mr-2" /> Upload
              </button>
              <button type="button" onClick={() => setMode('scanner')}
                className={`flex-1 py-3 border-4 font-black text-xs uppercase tracking-widest transition-all ${
                  mode === 'scanner'
                    ? 'bg-neutral-950 text-white border-neutral-950'
                    : 'bg-white text-neutral-950 border-neutral-950 hover:bg-neutral-950 hover:text-white'
                }`}>
                <FaCamera className="inline mr-2" /> Camera
              </button>
            </div>

            {/* Upload Mode */}
            {mode === 'upload' && (
              <div className="mt-3 border-4 border-neutral-950 p-4 bg-neutral-50">
                <input
                  ref={fileInputRef}
                  type="file"
                  name="image_card"
                  accept="image/*"
                  required={!initialData || !preview}
                  onChange={handleFileChange}
                  className="block w-full text-sm text-neutral-700 font-bold
                    file:mr-4 file:py-2 file:px-4 file:border-0
                    file:text-xs file:font-black file:uppercase file:tracking-widest
                    file:bg-neutral-950 file:text-white hover:file:bg-red-600
                    file:cursor-pointer file:transition-colors"
                />
              </div>
            )}

            {/* Scanner Mode */}
            {mode === 'scanner' && (
              <div className="flex flex-col items-center mt-3">
                <input ref={fileInputRef} type="file" name="image_card" accept="image/*"
                  required={!initialData || !preview} onChange={handleFileChange} className="hidden" />

                {!isAccessGranted ? (
                  <div className="w-full text-center border-4 border-neutral-950 p-6 bg-neutral-50">
                    <FaExclamationCircle className="inline text-3xl text-red-600 mb-2" />
                    <p className="text-sm font-bold uppercase tracking-wide text-neutral-700">
                      Camera access required.
                    </p>
                    <p className="text-sm text-neutral-500 mt-1">Please grant permission in your browser settings.</p>
                  </div>
                ) : (
                  <>
                    {!scanning ? (
                      <button type="button" onClick={startScanner}
                        className="w-full py-4 border-4 border-neutral-950 bg-neutral-950 text-white font-black uppercase tracking-widest text-xs hover:bg-red-600 hover:border-red-600 transition-all">
                        <FaCamera className="inline mr-2" /> START CAMERA
                      </button>
                    ) : (
                      <div className="flex flex-col items-center w-full gap-3">
                        <div className="relative w-full border-4 border-neutral-950 overflow-hidden aspect-video">
                          <video ref={videoRef} autoPlay playsInline
                            className="absolute top-0 left-0 w-full h-full object-cover" />
                        </div>
                        <canvas ref={canvasRef} className="hidden" />
                        <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">Using: {currentLabel}</p>
                        <div className="flex gap-2 w-full">
                          <button type="button" onClick={captureImage}
                            className="flex-1 py-3 border-4 border-neutral-950 bg-white font-black text-xs uppercase tracking-widest hover:bg-neutral-950 hover:text-white transition-all">
                            <FaCamera className="inline mr-1" /> Capture
                          </button>
                          <button type="button" onClick={switchCamera} disabled={devices.length < 2}
                            className={`flex-1 py-3 border-4 font-black text-xs uppercase tracking-widest transition-all ${
                              devices.length < 2
                                ? 'border-neutral-300 text-neutral-400 cursor-not-allowed'
                                : 'border-neutral-950 hover:bg-neutral-950 hover:text-white'
                            }`}>
                            <FaSyncAlt className="inline mr-1" /> Switch
                          </button>
                          <button type="button" onClick={stopScanner}
                            className="flex-1 py-3 border-4 border-red-600 text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
                            <FaTimesCircle className="inline mr-1" /> Stop
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {preview && (
              <div className="flex justify-center mt-4">
                <img src={preview} alt="Preview"
                  className="w-full max-w-sm h-auto object-cover border-4 border-neutral-950 aspect-video" />
              </div>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-black tracking-[0.3em] uppercase text-neutral-500 mb-2">Full Name</label>
            <div className="flex items-center border-4 border-neutral-950 bg-white focus-within:border-red-600 transition-colors">
              <FaUser className="text-red-600 ml-3 text-sm flex-shrink-0" />
              <input type="text" name="fname" value={fullName} onChange={(e) => setFullName(e.target.value)}
                required placeholder="JOHN D. DOE"
                className="flex-1 px-3 py-3 bg-transparent text-black text-sm font-bold uppercase tracking-wide focus:outline-none" />
            </div>
          </div>

          {/* ID Number */}
          <div>
            <label className="block text-xs font-black tracking-[0.3em] uppercase text-neutral-500 mb-2">ID Number</label>
            <div className="flex items-center border-4 border-neutral-950 bg-white focus-within:border-red-600 transition-colors">
              <FaHashtag className="text-red-600 ml-3 text-sm flex-shrink-0" />
              <input type="text" name="id_number" value={idNumber} onChange={handleIdChange}
                required
                placeholder={type === 'pwd' ? 'XX-XXXX-XXX-XXXXX' : type === 'senior-citizen' ? '9 digits only' : 'Select type first'}
                className="flex-1 px-3 py-3 bg-transparent text-black text-sm font-bold focus:outline-none" />
            </div>
          </div>
        </div>

        {/* ── DATA PRIVACY ── */}
        <div className="px-6 pb-6 pt-6 border-t-4 border-neutral-950 bg-neutral-50">
          {dpaNotice}
          <div className="flex items-start mt-4 gap-3">
            <input type="checkbox" id="agree-to-dpa" checked={agreedToDPA}
              onChange={(e) => setAgreedToDPA(e.target.checked)}
              className="w-5 h-5 mt-0.5 cursor-pointer accent-neutral-950 flex-shrink-0" />
            <label htmlFor="agree-to-dpa" className="text-sm font-bold text-neutral-700 cursor-pointer leading-snug">
              I have read and agree to the collection and use of my personal data as described above.
            </label>
          </div>
        </div>

        {/* ── SUBMIT ── */}
        <div className="p-6 border-t-4 border-neutral-950">
          <button type="submit" disabled={loading || !agreedToDPA}
            className={`w-full py-4 font-black uppercase tracking-[0.3em] text-sm border-4 transition-all duration-200 ${
              loading || !agreedToDPA
                ? 'bg-neutral-200 text-neutral-400 border-neutral-300 cursor-not-allowed'
                : 'bg-neutral-950 text-white border-neutral-950 hover:bg-red-600 hover:border-red-600 active:scale-95'
            }`}>
            {loading ? 'SUBMITTING...' : initialData ? 'UPDATE APPLICATION →' : 'SUBMIT APPLICATION →'}
          </button>

          <div className="mt-4 p-4 bg-white border-l-8 border-red-600">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1">Reminder</p>
            <p className="text-sm text-neutral-600">Please be ready to present your physical PWD or Senior Citizen ID at the counter to verify your discount upon pickup.</p>
          </div>
        </div>

      </form>
    </div>
  );
}