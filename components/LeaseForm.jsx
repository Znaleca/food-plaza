'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import leaseStall from '@/app/actions/leaseStall';
import { useEffect, useState } from 'react';

// List of real, valid government-issued IDs in the Philippines
const VALID_ID_TYPES = [
  'Philippine Identification Card (PhilID) / ePhilID',
  'Philippine Passport (DFA)',
  'Driver\'s License (LTO) - Non-Prof/Prof',
  'Unified Multi-Purpose Identification (UMID) Card',
  'Professional Regulation Commission (PRC) ID',
  'Social Security System (SSS) Card',
  'Government Service Insurance System (GSIS) e-Card',
  'Postal ID (PVC Card)',
  'Voter\'s ID (COMELEC)',
  'Senior Citizen ID (OSCA/LGU)',
  'Persons with Disability (PWD) ID',
  'Overseas Workers Welfare Administration (OWWA) E-Card',
  'Seafarer\'s Record Book (SRB) / SID (MARINA)',
  'Integrated Bar of the Philippines (IBP) ID',
  'Taxpayer Identification Number (TIN) ID (w/ Photo)',
];

const LeaseForm = ({ room }) => {
  const router = useRouter();
  const [minStartDate, setMinStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [duration, setDuration] = useState('6months');
  const inputClassName = 'mt-1 block w-full border-2 border-black bg-white px-3 py-2 text-sm font-medium text-black outline-none transition-colors duration-200 focus:border-red-600';
  const labelClassName = 'block text-xs font-black uppercase tracking-[0.2em] text-neutral-900';

  useEffect(() => {
    const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' });
    const phDate = new Date(now);
    const year = phDate.getFullYear();
    const month = String(phDate.getMonth() + 1).padStart(2, '0');
    const day = String(phDate.getDate()).padStart(2, '0');
    setMinStartDate(`${year}-${month}-${day}`);
  }, []);

  const handleStartDateChange = (e) => {
    const startDate = new Date(e.target.value);
    if (!isNaN(startDate)) calculateEndDate(startDate, duration);
  };

  const handleDurationChange = (e) => {
    const newDuration = e.target.value;
    setDuration(newDuration);
    const startInput = document.getElementById('check_in_date');
    if (startInput?.value) calculateEndDate(new Date(startInput.value), newDuration);
  };

  const calculateEndDate = (startDate, type) => {
    const newEnd = new Date(startDate);
    if (type === '6months') newEnd.setMonth(newEnd.getMonth() + 6);
    if (type === '1year') newEnd.setFullYear(newEnd.getFullYear() + 1);
    if (type === '2years') newEnd.setFullYear(newEnd.getFullYear() + 2);
    const year = newEnd.getFullYear();
    const month = String(newEnd.getMonth() + 1).padStart(2, '0');
    const day = String(newEnd.getDate()).padStart(2, '0');
    setEndDate(`${year}-${month}-${day}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    // Combine names
    const first = formData.get('firstName') || '';
    const middle = formData.get('middleName') || '';
    const last = formData.get('lastName') || '';
    const suffix = formData.get('suffix') || '';
    const fullName = [first, middle, last, suffix].filter(Boolean).join(' ');
    formData.append('fname', fullName);
    formData.delete('firstName');
    formData.delete('middleName');
    formData.delete('lastName');
    formData.delete('suffix');

    // Time handling
    const now = new Date().toLocaleTimeString('en-US', {
      timeZone: 'Asia/Manila',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });

    formData.append('check_in_time', now);
    formData.append('check_out_time', '23:59');
    formData.append('check_out_date', endDate);
    if (room?.stallNumber) formData.append('stallNumber', room.stallNumber.toString());

    const res = await leaseStall(null, formData);
    if (res.error) toast.error(res.error);
    if (res.success) {
      toast.success('Stall has been leased! Awaiting approval.');
      router.push('/bookings');
    }
  };

  return (
    <div className="border-2 border-black bg-white p-4 text-neutral-950 shadow-[6px_6px_0px_#000] md:p-6">
      <form onSubmit={handleSubmit} className="space-y-7">
        <input type="hidden" name="room_id" value={room.$id} />
        <input type="hidden" name="status" value="pending" />
        <input type="hidden" name="stallNumber" value={room.stallNumber || ''} readOnly />
        <input type="hidden" id="check_out_date" name="check_out_date" value={endDate} readOnly />

        {/* Full Name */}
        <div className="space-y-3 border-2 border-black bg-neutral-50 p-4">
          <label className={labelClassName}>Full Name of Lessee</label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <input type="text" id="firstName" name="firstName" required placeholder="First Name *" className={inputClassName} />
            <input type="text" id="middleName" name="middleName" placeholder="Middle Name" className={inputClassName} />
            <input type="text" id="lastName" name="lastName" required placeholder="Last Name *" className={inputClassName} />
            <input type="text" id="suffix" name="suffix" placeholder="Suffix (Optional)" className={inputClassName} />
          </div>
          <p className="text-xs font-semibold text-neutral-600">* Required field</p>
        </div>

        {/* Gender & Phone */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="gender" className={labelClassName}>Gender *</label>
            <select id="gender" name="gender" required className={inputClassName}>
              <option value="">-- Select Male or Female --</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label htmlFor="phoneNumber" className={labelClassName}>Phone Number (11 digits) *</label>
            <input
              type="text"
              inputMode="numeric"
              id="phoneNumber"
              name="phoneNumber"
              maxLength={11}
              pattern="^[0-9]{11}$"
              required
              placeholder="e.g., 09123456789"
              title="Phone number must be exactly 11 digits (e.g., 09123456789)"
              onInput={(e) => (e.target.value = e.target.value.replace(/\D/g, ''))}
              className={inputClassName}
            />
          </div>
        </div>

        {/* Address & Social Media */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="residentialAddress" className={labelClassName}>Residential Address *</label>
            <input type="text" id="residentialAddress" name="residentialAddress" required maxLength={255} placeholder="Enter full residential address" className={inputClassName} />
          </div>
          <div>
            <label htmlFor="socialMediaAccount" className={labelClassName}>Social Media Link (Optional)</label>
            <input type="url" id="socialMediaAccount" name="socialMediaAccount" maxLength={100} placeholder="https://facebook.com/your-profile" className={inputClassName} />
          </div>
        </div>

        {/* NEW: Valid ID Type Dropdown */}
        <div>
          <label htmlFor="idType" className={labelClassName}>Valid ID Type *</label>
          <select id="idType" name="idType" required className={inputClassName}>
            <option value="">-- Select Valid ID Type --</option>
            {VALID_ID_TYPES.map((id, index) => (
              <option key={index} value={id}>{id}</option>
            ))}
          </select>
        </div>

        {/* Valid ID File Input (Image Only) */}
        <div>
          <label htmlFor="validID" className={labelClassName}>Upload Valid ID (JPG or PNG) *</label>
          <input
            type="file"
            id="validID"
            name="validID"
            required
            accept="image/jpeg,image/png" // Only accepts JPG and PNG
            capture="environment" // Hint for mobile devices to open the camera
            className="mt-1 block w-full border-2 border-black bg-white px-3 py-2 text-sm text-black transition-colors duration-200 focus:border-red-600 file:mr-4 file:border-2 file:border-black file:bg-red-600 file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-wider file:text-white hover:file:bg-black"
          />
          <p className="mt-1 text-xs font-semibold text-neutral-600">Accepted formats: JPG, PNG. Max file size recommended: 5MB. Must match the type selected above.</p>
        </div>

        {/* Start Date & Duration */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="check_in_date" className={labelClassName}>Start Date *</label>
            <input type="date" id="check_in_date" name="check_in_date" min={minStartDate} onChange={handleStartDateChange} required className={inputClassName} />
          </div>
          <div>
            <label htmlFor="duration" className={labelClassName}>Duration *</label>
            <select id="duration" name="duration" value={duration} onChange={handleDurationChange} required className={inputClassName}>
              <option value="6months">6 Months</option>
              <option value="1year">1 Year</option>
              <option value="2years">2 Years</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <div>
          <button type="submit" className="w-full border-2 border-black bg-red-600 px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-white shadow-[4px_4px_0px_#000] transition-all duration-200 hover:translate-y-[2px] hover:bg-black hover:shadow-[2px_2px_0px_#000]">
            Send Approval
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeaseForm;