'use client';
import { toast } from 'react-toastify';
import { FaTrash } from 'react-icons/fa';
import deletePromo from '@/app/actions/deletePromo';

const DeletePromosButton = ({ promoId }) => {
  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this promo?'
    );

    if (confirmed) {
      try {
        const response = await deletePromo(promoId);
        toast.success('Promo deleted successfully!');
      } catch (error) {
        console.log('Failed to delete promo', error);
        toast.error('Failed to delete promo');
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      className='bg-red-500 text-white px-4 py-2 rounded mb-2 sm:mb-0 w-full sm:w-auto text-center hover:bg-red-700'
    >
      <FaTrash className='inline mr-1' />
    </button>
  );
};

export default DeletePromosButton;
