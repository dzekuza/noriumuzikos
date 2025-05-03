import { useQuery } from '@tanstack/react-query';
import { type Event, type SongRequest } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EventStatsProps {
  eventId: number;
  event: Event;
}

export default function EventStats({ eventId, event }: EventStatsProps) {
  const { data: pendingRequests } = useQuery<SongRequest[]>({
    queryKey: [`/api/events/${eventId}/song-requests`, 'pending'],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(`${queryKey[0]}?status=pending`);
      if (!response.ok) throw new Error('Failed to fetch pending requests');
      return response.json();
    },
  });

  const { data: playedRequests } = useQuery<SongRequest[]>({
    queryKey: [`/api/events/${eventId}/song-requests`, 'played'],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(`${queryKey[0]}?status=played`);
      if (!response.ok) throw new Error('Failed to fetch played requests');
      return response.json();
    },
  });

  // Calculate total revenue (€5 per request)
  const totalRevenue = ((playedRequests?.length || 0) * 5);
  
  // Format event times
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  // Calculate average wait time (stub - would be calculated from real data)
  const avgWait = '15m';

  return (
    <Card className="bg-secondary border-none shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-xl text-white">Event Dashboard</CardTitle>
          <div className="flex items-center px-3 py-1 bg-primary rounded-full">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse-slow mr-2"></div>
            <span className="text-xs font-semibold">LIVE</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <h3 className="text-2xl font-bold text-white">{event.name}</h3>
          <p className="text-gray-300">
            {event.venue} • {formatTime(new Date(event.startTime))} - {formatTime(new Date(event.endTime))}
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-background p-4 rounded-lg">
            <h4 className="text-sm text-gray-400">Requests</h4>
            <div className="text-2xl font-bold text-white">{pendingRequests?.length || 0}</div>
          </div>
          
          <div className="bg-background p-4 rounded-lg">
            <h4 className="text-sm text-gray-400">Total Revenue</h4>
            <div className="text-2xl font-bold text-white">€{totalRevenue}</div>
          </div>
          
          <div className="bg-background p-4 rounded-lg">
            <h4 className="text-sm text-gray-400">Played</h4>
            <div className="text-2xl font-bold text-white">{playedRequests?.length || 0}</div>
          </div>
          
          <div className="bg-background p-4 rounded-lg">
            <h4 className="text-sm text-gray-400">Avg. Wait</h4>
            <div className="text-2xl font-bold text-white">{avgWait}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
