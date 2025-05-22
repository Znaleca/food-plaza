'use client';

import { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Heading from '@/components/Heading';
import createPromos from '@/app/actions/createPromos';

const AddPromosPage = () => {
  const [state, formAction] = useFormState(createPromos, { success: false, error: null });
  const router = useRouter();

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) {
      toast.success('Promo added successfully!');
      router.push('/foodstall/promos');
    }
  }, [state, router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append('claimed_users', JSON.stringify([]));
    formAction(formData);
  };

  return (
    <div className="bg-neutral-900 min-h-screen text-white p-6">
      <div className="text-center mb-10">
        <h2 className="text-lg sm:text-xl text-pink-600 font-light tracking-widest uppercase">Create Promo</h2>
        <p className="mt-4 text-2xl sm:text-5xl font-extrabold text-white leading-tight">Add Deals</p>
      </div>

      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 w-full max-w-3xl mx-auto shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Title</label>
            <input
              type="text"
              name="title"
              required
              className="bg-neutral-900 border border-neutral-700 text-white rounded-lg w-full py-3 px-4"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea
              name="description"
              required
              className="bg-neutral-900 border border-neutral-700 text-white rounded-lg w-full h-24 py-3 px-4"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Discount (%)</label>
              <input
                type="number"
                name="discount"
                min="0"
                max="100"
                required
                className="bg-neutral-900 border border-neutral-700 text-white rounded-lg w-full py-3 px-4"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Quantity of Promos</label>
              <input
                type="number"
                name="quantity"
                min="1"
                required
                className="bg-neutral-900 border border-neutral-700 text-white rounded-lg w-full py-3 px-4"
              />
            </div>
          </div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>
    <label className="block text-sm font-semibold mb-2">Valid From</label>
    <input
      type="date"
      name="valid_from"
      required
      className="bg-white text-black border border-neutral-700 rounded-lg w-full py-3 px-4"
    />
  </div>
  <div>
    <label className="block text-sm font-semibold mb-2">Valid To</label>
    <input
      type="date"
      name="valid_to"
      required
      className="bg-white text-black border border-neutral-700 rounded-lg w-full py-3 px-4"
    />
  </div>
</div>


          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-8 rounded-xl transition-all text-lg tracking-widest"
            >
              Save Promotion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPromosPage;
