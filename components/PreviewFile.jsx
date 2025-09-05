'use client';

import { useEffect, useState } from 'react';
import getContractDisplay from '@/app/actions/getContractDisplay';

const PreviewFile = ({ bookingId }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) return;
    const fetchFile = async () => {
      const res = await getContractDisplay(bookingId);
      setFile(res);
      setLoading(false);
    };
    fetchFile();
  }, [bookingId]);

  if (loading) return <p>Loading preview...</p>;
  if (!file?.url) return <p className="text-gray-400">No file attached.</p>;

  return (
    <div className="mt-4">
      {file.mimeType?.includes('pdf') ? (
        <iframe
          src={file.url}
          className="w-full h-[600px] border border-gray-700 rounded-md"
          title="Contract Preview"
        />
      ) : (
        <img
          src={file.url}
          alt={file.name || 'Contract Preview'}
          className="w-full h-auto rounded-md object-cover"
        />
      )}
    </div>
  );
};

export default PreviewFile;
