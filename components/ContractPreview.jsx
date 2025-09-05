'use client';

import React, { useRef } from 'react';
import { Printer, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ContractPreview = ({ booking }) => {
  const contractRef = useRef(null);

  if (!booking) {
    return (
      <div className="text-center text-red-500 font-semibold p-4">
        No booking data provided.
      </div>
    );
  }

  const { room_id, fname, lname, check_in, check_out } = booking;
  const stallName = room_id?.name || 'Unnamed Stall';
  const stallNumber = room_id?.stallNumber || 'N/A';
  const tenantName = `${fname || ''} ${lname || ''}`.trim() || 'Unnamed Lessee';
  const leaseFee = 'To be determined';

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const generatePDF = async (action = 'download') => {
    if (!contractRef.current) return;

    const canvas = await html2canvas(contractRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

    if (action === 'print') {
      pdf.autoPrint();
      window.open(pdf.output('bloburl'), '_blank');
    } else {
      pdf.save('Lease_Agreement.pdf');
    }
  };

  return (
    <div>
      {/* Contract Content */}
      <div ref={contractRef} className="a4-paper">
        <h1 className="text-center font-bold uppercase tracking-widest mb-10 text-2xl">
          Commercial Lease Agreement
        </h1>

        <p className="mb-6 text-justify">
          This Commercial Lease Agreement ("Agreement") is made and entered into on{' '}
          <strong>{formatDate(check_in)}</strong>, by and between{' '}
          <strong>The Corner Food Plaza</strong> (the "Lessor"), and{' '}
          <strong>{tenantName}</strong> (the "Lessee").
        </p>

        <div className="space-y-6 text-justify">
          <h2 className="font-bold uppercase text-lg">1. Leased Premises</h2>
          <p>
            The Lessor hereby leases to the Lessee the premises located at Stall #
            <strong>{stallNumber}</strong>, known as <strong>{stallName}</strong>, situated within
            The Corner Food Plaza.
          </p>

          <h2 className="font-bold uppercase text-lg">2. Term of Lease</h2>
          <p>
            The term of this lease shall commence on <strong>{formatDate(check_in)}</strong> and
            shall expire on <strong>{formatDate(check_out)}</strong>, unless terminated earlier in
            accordance with the terms of this Agreement.
          </p>

          <h2 className="font-bold uppercase text-lg">3. Lease Fee</h2>
          <p>
            The Lessee agrees to pay a monthly lease fee of <strong>{leaseFee}</strong> to the
            Lessor, due on the first day of each month throughout the term of this Agreement.
          </p>
        </div>

        <div className="mt-8">
          <h2 className="font-bold uppercase text-lg mb-4">4. General Provisions</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Lessee shall maintain the leased premises in a clean and orderly condition.</li>
            <li>Lessee shall comply with all rules of The Corner Food Plaza.</li>
            <li>No subleasing or assignment is permitted without written consent of Lessor.</li>
            <li>Lessee is responsible for any damages caused by their negligence.</li>
            <li>
              Lessor reserves the right to terminate this Agreement immediately upon material
              breach.
            </li>
          </ol>
        </div>

        {/* Signatures */}
        <div className="mt-24 grid grid-cols-2 gap-16 text-center">
          <div>
            <div className="border-t border-black w-3/4 mx-auto mb-8" />
            <p className="font-semibold text-lg">{tenantName}</p>
            <p className="text-sm">Lessee</p>
          </div>
          <div>
            <div className="border-t border-black w-3/4 mx-auto mb-8" />
            <p className="font-semibold text-lg">The Corner Food Plaza</p>
            <p className="text-sm">Authorized Representative</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={() => generatePDF('print')}
          className="px-6 py-3 bg-pink-600 text-white font-medium rounded-lg shadow-md hover:bg-pink-700 transition flex items-center gap-2"
        >
          <Printer className="w-5 h-5" />
          Print
        </button>
        <button
          onClick={() => generatePDF('download')}
          className="px-6 py-3 bg-yellow-500 text-white font-medium rounded-lg shadow-md hover:bg-yellow-400 transition flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default ContractPreview;
