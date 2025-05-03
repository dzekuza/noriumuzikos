import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { type Event } from '@shared/schema';
import EventCard from '@/components/event-card';
import SongRequestForm from '@/components/song-request-form';
import RecentSongs from '@/components/recent-songs';

export default function RequestPage() {
  const { id } = useParams<{ id: string }>();
  const eventId = parseInt(id);
  
  const { data: event, isLoading, error } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (error || !event) {
    return (
      <div className="container py-10 mx-auto max-w-xl">
        <div className="text-center p-8 bg-secondary rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-white">Event Not Found</h2>
          <p className="text-gray-300 mt-4">
            The DJ event you're looking for doesn't exist or has ended.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-6 mx-auto max-w-xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 text-white">Request Your Favorite Song</h1>
        <p className="text-gray-300">Let the DJ know what you want to hear next! Only €5 per request.</p>
      </div>

      <EventCard event={event} />
      
      <SongRequestForm eventId={event.id} />
      
      <RecentSongs eventId={event.id} />
    </div>
  );
}
