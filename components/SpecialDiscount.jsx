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
  const fileInputRef = useRef(null); // Ref for the actual file input

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

    // Set canvas dimensions to match video stream
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/png');
    setPreview(dataUrl);

    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], 'scanned-id.png', { type: 'image/png' });

    // ⭐️ FIX: Programmatically set the captured file to the file input
    const fileInput = fileInputRef.current; // Use the ref to target the file input

    if (fileInput) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;

      // Manually trigger the file change handler to ensure state is consistent if needed
      // const event = new Event('change', { bubbles: true });
      // fileInput.dispatchEvent(event);
    }
    // ⭐️ END FIX

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
    
    // Check if the file input has a file set (either by upload or capture)
    const imageFile = fileInputRef.current.files[0];

    // If initialData exists AND there is NO new file, we must explicitly tell the action 
    // NOT to use the placeholder file input value. The server action handles not changing the image 
    // if 'image_card' is missing or a Blob of size 0.
    if (initialData && !imageFile) {
        // We ensure FormData's 'image_card' is handled correctly. 
        // For update, the server action is designed to check if image_card is a Blob with size > 0.
        // We can simply remove it if it's not a new file, but since the component only uses one input,
        // if no file was uploaded/captured, the input's files list will be empty, and FormData will 
        // send an empty string or nothing for 'image_card', which is fine for the server action.
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
      <div className="flex items-center text-cyan-400 font-semibold mb-2">
        <FaInfoCircle className="mr-2" /> Data Privacy Notice
      </div>
      <p className="text-sm text-neutral-400 mb-2">
        We collect your full name, ID number, and a photo of your valid PWD or Senior Citizen card solely for the purpose of verifying your eligibility for a special discount.
      </p>
      <p className="text-sm text-neutral-400">
        This data will be handled securely and in strict compliance with the Data Privacy Act of 2012 (Republic Act No. 10173). Your information will not be shared with third parties and will be used exclusively for its stated purpose.
      </p>
    </>
  );

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="flex flex-col">
        {/* Header */}
        <div className="flex flex-col items-center p-4 text-center border-b border-neutral-800">
          <div className="flex items-center justify-center w-12 h-12 mb-2 bg-gradient-to-r from-cyan-400 to-fuchsia-500 rounded-full">
            <FaIdCard className="text-white text-2xl" />
          </div>
          <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
            {initialData ? 'Edit Discount' : 'Special Discount'}
          </h3>
          <p className="text-sm text-neutral-400">
            {initialData ? 'Update details.' : 'Apply for PWD / Senior Citizen.'}
          </p>
        </div>

        {/* Form */}
        <div className="flex flex-col p-4 space-y-4">
          {/* Type */}
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Type</label>
            <select
              name="type"
              value={type}
              required
              onChange={(e) => {
                setType(e.target.value);
                setIdNumber('');
              }}
              className="w-full border border-neutral-700 rounded-md px-3 py-2 bg-neutral-800 text-sm focus:ring-fuchsia-500 focus:ring-2 focus:outline-none"
            >
              <option value="">Select Type</option>
              <option value="pwd">PWD</option>
              <option value="senior-citizen">Senior Citizen</option>
            </select>
          </div>

          {/* Upload/Scanner Section */}
          <div>
            {/* Removed the initial hidden file input to avoid confusion */}

            <label className="block text-xs text-neutral-400 mb-1">Verification Method</label>
            <div className="flex gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => {
                  setMode('upload');
                  stopScanner();
                }}
                className={`px-3 py-2 rounded-md flex-1 text-xs sm:text-base font-semibold transition-colors ${
                  mode === 'upload' ? 'bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-white' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                }`}
              >
                <FaUpload className="inline mr-1 sm:mr-2" />{' '}
                <span className="hidden sm:inline">Upload</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('scanner')}
                className={`px-3 py-2 rounded-md flex-1 text-xs sm:text-base font-semibold transition-colors ${
                  mode === 'scanner' ? 'bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-white' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                }`}
              >
                <FaCamera className="inline mr-1 sm:mr-2" />{' '}
                <span className="hidden sm:inline">Camera</span>
              </button>
            </div>

            {/* Upload Mode - This is the primary file input */}
            {mode === 'upload' && (
              <div className="mt-2">
                <input
                  ref={fileInputRef} // ⭐️ Added Ref
                  type="file"
                  name="image_card"
                  accept="image/*"
                  required={!initialData || !preview} // Added !preview for better UX on update
                  onChange={handleFileChange}
                  className="block w-full text-sm text-neutral-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-neutral-800 file:text-cyan-400
                  hover:file:bg-neutral-700"
                />
              </div>
            )}
            
            {/* Scanner Mode (Only needs the ref for the file input when capturing) */}
            {mode === 'scanner' && (
              <div className="flex flex-col items-center mt-2">
                {/* ⭐️ Add a file input here, but hide it and link it to the ref ⭐️ */}
                {/* This hidden input ensures the FormData mechanism always finds a file input 
                    to attach the captured file, regardless of the 'mode' being rendered. */}
                <input
                    ref={fileInputRef} // ⭐️ Added Ref here too
                    type="file"
                    name="image_card"
                    accept="image/*"
                    required={!initialData || !preview}
                    onChange={handleFileChange}
                    className="hidden" // Keep it hidden
                />
                
                {!isAccessGranted ? (
                  <div className="text-center text-neutral-400 p-4">
                    <FaExclamationCircle className="inline text-2xl text-fuchsia-500 mb-2" />
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
                        className="w-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-white px-4 py-2 rounded-md"
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

                        <p className="text-xs text-neutral-400 text-center mb-2">
                          Using: {currentLabel}
                        </p>

                        <div className="flex gap-2 w-full justify-center flex-wrap">
                          <button
                            type="button"
                            onClick={captureImage}
                            className="bg-white text-neutral-900 px-3 py-2 rounded-md text-sm flex-1 sm:flex-none"
                          >
                            <FaCamera className="inline mr-1" /> Capture
                          </button>
                          <button
                            type="button"
                            onClick={switchCamera}
                            disabled={devices.length < 2}
                            className={`px-3 py-2 rounded-md text-sm flex-1 sm:flex-none ${
                              devices.length < 2
                                ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            <FaSyncAlt className="inline mr-1" /> Switch
                          </button>
                          <button
                            type="button"
                            onClick={stopScanner}
                            className="bg-neutral-800 text-neutral-400 px-3 py-2 rounded-md text-sm flex-1 sm:flex-none"
                          >
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
              <div className="flex justify-center mt-3">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-w-sm h-auto object-cover rounded-md border-2 border-neutral-700 aspect-video"
                />
              </div>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Full Name</label>
            <div className="flex items-center border border-neutral-700 rounded-md bg-neutral-800">
              <FaUser className="text-cyan-400 ml-3 text-sm" />
              <input
                type="text"
                name="fname"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="JOHN D. DOE"
                className="flex-1 px-3 py-2 bg-transparent text-sm focus:ring-fuchsia-500 focus:ring-2 focus:outline-none"
              />
            </div>
          </div>

          {/* ID Number */}
          <div>
            <label className="block text-xs text-neutral-400 mb-1">ID Number</label>
            <div className="flex items-center border border-neutral-700 rounded-md bg-neutral-800">
            <FaHashtag className="text-cyan-400 ml-3 text-sm" />
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
                className="flex-1 px-3 py-2 bg-transparent text-sm focus:ring-fuchsia-500 focus:ring-2 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Data Privacy Act Section */}
        <div className="p-4 border-t border-b border-neutral-800">
          {dpaNotice}
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="agree-to-dpa"
              checked={agreedToDPA}
              onChange={(e) => setAgreedToDPA(e.target.checked)}
              className="form-checkbox h-4 w-4 text-cyan-500 bg-neutral-800 border-neutral-600 rounded focus:ring-cyan-500"
            />
            <label htmlFor="agree-to-dpa" className="ml-2 text-sm text-neutral-400">
              I have read and agree to the collection and use of my personal data as described above.
            </label>
          </div>
        </div>

        <div className="p-4 border-t border-neutral-800">
          <button
            type="submit"
            disabled={loading || !agreedToDPA}
            className={`w-full py-2 rounded-md font-semibold transition-colors duration-200 ${
              loading || !agreedToDPA ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-white hover:from-cyan-500 hover:to-fuchsia-600'
            }`}
          >
            {loading
              ? 'Submitting...'
              : initialData
              ? 'Update Application'
              : 'Submit Application'}
          </button>
          
          <div className="mt-4 p-3 bg-neutral-800 text-neutral-300 rounded-md text-sm text-center border-l-4 border-cyan-400">
            <p>
              Please be ready to present your physical PWD or Senior Citizen ID at the counter to verify your discount upon pickup.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}