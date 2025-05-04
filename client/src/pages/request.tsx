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
    <div className="min-h-screen bg-black overflow-hidden">
      <div className="container mx-auto py-6 px-4">
        <div className="text-xs text-white/70 uppercase tracking-widest mb-4">Request song</div>

        <SongRequestForm eventId={event.id} />
        
        {/* We'll keep the recent songs but style them differently */}
        <div className="mt-12">
          <RecentSongs eventId={event.id} />
        </div>
      </div>
    </div>
  );
}
