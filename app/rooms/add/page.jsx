'use client';
import { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Heading from '@/components/Heading';
import createRoom from '@/app/actions/createRoom';

const AddRoomPage = () => {
  const [state, formAction] = useFormState(createRoom, {});

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
      <Heading title='Add a Room' />
      <div className='bg-white shadow-lg rounded-lg p-6 w-full'>
        <form action={formAction}>
          <div className='mb-4'>
            <label
              htmlFor='name'
              className='block text-gray-700 font-bold mb-2'
            >
              Room Name
            </label>
            <input
              type='text'
              id='name'
              name='name'
              className='border rounded w-full py-2 px-3'
              placeholder= '(BPSU Library, Nursing Lab, CCST Office)'
              required
            />
          </div>

          <div className='mb-4'>
            <label
              htmlFor='description'
              className='block text-gray-700 font-bold mb-2'
            >
              Description
            </label>
            <textarea
              id='description'
              name='description'
              className='border rounded w-full h-24 py-2 px-3'
              placeholder='For Conference and Meeting Purposes'
              required
            ></textarea>
          </div>


          <div className='mb-4'>
            <label
              htmlFor='capacity'
              className='block text-gray-700 font-bold mb-2'
            >
              Capacity
            </label>
            <input
              type='number'
              id='capacity'
              name='capacity'
              className='border rounded w-full py-2 px-3'
              placeholder='Number of people the room can hold'
              required
            />
          </div>

          

          <div className='mb-4'>
  <label
    htmlFor='building'
    className='block text-gray-700 font-bold mb-2'
  >
    Building
  </label>
  <select
    id='building'
    name='building'
    className='border rounded w-full py-2 px-3'
    required
  >
    <option value=''>Choose Building</option>
    <option value='CAHS'>CAHS</option>
    <option value='CEA'>CEA</option>
    <option value='OLD CEA'>OLD CEA</option>
    <option value='MEDINA LACSON'>MEDINA LACSON</option>
    <option value='BACOMM'>BACOMM</option>
    <option value='STS'>STS</option>
    <option value='CBA'>CBA</option>
    <option value='CTEC'>CTEC</option>
    <option value='CCST'>CCST</option>
  </select>
</div>


<div className='mb-4'>
  <label
    htmlFor='floor'
    className='block text-gray-700 font-bold mb-2'
  >
    Floor
  </label>
  <select
    id='floor'
    name='floor'
    className='border rounded w-full py-2 px-3'
    required
  >
    <option value=''>Choose Floor</option>
    <option value='1F'>1F</option>
    <option value='2F'>2F</option>
    <option value='3F'>3F</option>
    <option value='4F'>4F</option>
    <option value='5F'>5F</option>
    <option value='6F'>6F</option>
  </select>
</div>


          <div className='mb-4'>
            <label
              htmlFor='room'
              className='block text-gray-700 font-bold mb-2'
            >
            Room #
            </label>
            <input
              type='number'
              id='room'
              name='room'
              className='border rounded w-full py-2 px-3'
              placeholder='(Input Room Number)'
              required
            />
          </div>

          <div className='mb-4'>
            <label
              htmlFor='availability'
              className='block text-gray-700 font-bold mb-2'
            >
              Availability
            </label>
            <input
              type='text'
              id='availability'
              name='availability'
              className='border rounded w-full py-2 px-3'
              placeholder='Availability (Monday - Friday, 9am - 5pm)'
              required
            />
          </div>

          <div className='mb-4'>
            <label
              htmlFor='amenities'
              className='block text-gray-700 font-bold mb-2'
            >
              Amenities
            </label>
            <input
              type='text'
              id='amenities'
              name='amenities'
              className='border rounded w-full py-2 px-3'
              placeholder='Amenities CSV (projector, whiteboard, etc.)'
              required
            />
          </div>

         
          <div className='mb-8'>
            <label
              htmlFor='image'
              className='block text-gray-700 font-bold mb-2'
            >
              Image
            </label>

            <input
              type='file'
              id='image'
              name='image'
              className='border rounded w-full py-2 px-3'
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

export default AddRoomPage;