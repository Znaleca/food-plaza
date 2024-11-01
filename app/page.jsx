import RoomCard from '@/components/RoomCard';
import getAllRooms from '@/app/actions/getAllRooms';
import Heading from '@/components/Heading';

export default async function Home() {
  
  const rooms = await getAllRooms();
  return (
    <>
    <Heading title="Available Rooms" />
      {rooms.length > 0 ? (
        rooms.map((room) => <RoomCard room={room} key={room.$id}/>)
      ) : (
        <p>No rooms available at the moment</p>
      )}
    </>
  );
}
