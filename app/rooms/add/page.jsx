'use client';
import { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Heading from '@/components/Heading';
import createSpaces from '@/app/actions/createSpaces';

const AddSpacePage = () => {
  const [state, formAction] = useFormState(createSpaces, {});

  const router = useRouter();

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) {
      toast.success('Room created successfully!');
      router.push('/');
    }
  }, [state]);

  return (
    <>
      <Heading title='Add a Space' />
      <div className='bg-white shadow-lg rounded-lg p-6 w-full'>
        <form action={formAction}>
          <div className='mb-4'>
            <label htmlFor='name' className='block text-gray-700 font-bold mb-2'>
              Space Name
            </label>
            <input
              type='text'
              id='name'
              name='name'
              className='border rounded w-full py-2 px-3'
              placeholder='(Example: Sarigamit, OSA, Medina Lacson, etc.)'
              required
            />
          </div>

          <div className='mb-4'>
            <label htmlFor='type' className='block text-gray-700 font-bold mb-2'>
              Type
            </label>
            <input
              type='text'
              id='type'
              name='type'
              className='border rounded w-full py-2 px-3'
              placeholder='(Example: Covered Court, Meeting Room, Watch Room, etc.)'
              required
            />
          </div>

          <div className='mb-4'>
            <label htmlFor='description' className='block text-gray-700 font-bold mb-2'>
              Description
            </label>
            <textarea
              id='description'
              name='description'
              className='border rounded w-full h-24 py-2 px-3'
              placeholder='(Example: For Conference and Meeting Purposes)'
              required
            ></textarea>
          </div>

          <div className='mb-4'>
            <label htmlFor='capacity' className='block text-gray-700 font-bold mb-2'>
              Capacity
            </label>
            <input
              type='number'
              id='capacity'
              name='capacity'
              className='border rounded w-full py-2 px-3'
              placeholder='(Indicate maximum occupancy or number can hold for events, meeting, etc.)'
              required
            />
          </div>

          <div className='mb-4'>
            <label htmlFor='location' className='block text-gray-700 font-bold mb-2'>
              Location
            </label>
            <input
              type='text'
              id='location'
              name='location'
              className='border rounded w-full py-2 px-3'
              placeholder='(e.g., CAHS, CEA, etc.)'
            />
          </div>

          <div className='mb-4'>
  <label htmlFor='floor' className='block text-gray-700 font-bold mb-2'>
    Floor
  </label>
  <select
    id='floor'
    name='floor'
    className='border rounded w-full py-2 px-3'
    defaultValue='' // Set initial blank value
  >
    <option value='' disabled hidden>
      (Optional)
    </option>
    <option value='N/A'>N/A</option>
    <option value='1F'>1F</option>
    <option value='2F'>2F</option>
    <option value='3F'>3F</option>
    <option value='4F'>4F</option>
    <option value='5F'>5F</option>
    <option value='6F'>6F</option>
  </select>
</div>

<div className='mb-4'>
  <label htmlFor='room' className='block text-gray-700 font-bold mb-2'>
    Room #
  </label>
  <input
    type='number'
    id='room'
    name='room'
    className='border rounded w-full py-2 px-3'
    placeholder='(Optional)'
  />
</div>


          <div className='mb-4'>
            <label htmlFor='amenities' className='block text-gray-700 font-bold mb-2'>
              Amenities
            </label>
            <input
              type='text'
              id='amenities'
              name='amenities'
              className='border rounded w-full py-2 px-3'
              placeholder='Amenities CSV (projector, whiteboard, etc.)'
              
            />
          </div>

          <div className='mb-8'>
  <label htmlFor='image' className='block text-gray-700 font-bold mb-2'>
    Images
  </label>
  <input
    type='file'
    id='image'
    name='images' // Updated name to reflect multiple files
    className='border rounded w-full py-2 px-3'
    multiple // Enable multiple file selection
    accept='image/*' // Restrict to image files only
  />
</div>


          <div className='flex flex-col gap-5'>
            <button
              type='submit'
              className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700'
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddSpacePage;
