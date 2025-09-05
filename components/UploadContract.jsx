'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import updateContract from '@/app/actions/updateContract';

const UploadContract = ({ bookingId, onUploaded }) => {
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const res = await updateContract(bookingId, formData);
    if (res.error) {
      toast.error(res.error);
    }
    if (res.success) {
      toast.success('File uploaded successfully!');
      if (onUploaded) onUploaded(res.fileId);
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <div>
        <label
          htmlFor="attachment"
          className="block text-sm font-medium text-white"
        >
          Upload Contract
        </label>
        <input
          type="file"
          id="attachment"
          name="attachment"
          accept="application/pdf"
          className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-600 rounded-md shadow-sm focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm"
        />
      </div>
      <button
        type="submit"
        className="w-full py-3 px-4 bg-gradient-to-r from-yellow-400 to-pink-500 text-white font-semibold text-sm rounded-md shadow-md hover:from-yellow-300 hover:to-pink-400 transition duration-300"
      >
        Upload File
      </button>
    </form>
  );
};

export default UploadContract;
