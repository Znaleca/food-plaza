'use client';
import { toast } from 'react-toastify';
import { FaTrash } from 'react-icons/fa';
import deleteSpace from '@/app/actions/deleteSpace';

const DeleteRoomButton = ({ roomId }) => {
  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this room?'
    );

    if (confirmed) {
      try {
        await deleteSpace(roomId);
        toast.success('Room deleted successfully!');
      } catch (error) {
        console.error('Failed to delete room', error);
        toast.error('Failed to delete room');
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-full shadow-md text-sm font-semibold flex items-center justify-center gap-2 transform hover:scale-105 transition-all"
    >
      <FaTrash /> Delete
    </button>
  );
};

export default DeleteRoomButton;
