'use client';
import { toast } from 'react-toastify';
import { FaTrash } from 'react-icons/fa';
import deletePromo from '@/app/actions/deletePromo';

const DeletePromosButton = ({ promoId, onDelete }) => {
  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this promo?'
    );

    if (confirmed) {
      try {
        await deletePromo(promoId);
        toast.success('Promo deleted successfully!');
        if (onDelete) onDelete();
      } catch (error) {
        console.error('Failed to delete promo', error);
        toast.error('Failed to delete promo');
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl 
                 bg-gradient-to-r from-red-500 to-red-600 
                 text-white font-semibold text-sm tracking-wide
                 shadow-md hover:from-red-600 hover:to-red-700 hover:shadow-lg 
                 active:scale-95 transition-all duration-200"
    >
      <FaTrash className="text-white text-sm" />
    </button>
  );
};

export default DeletePromosButton;
