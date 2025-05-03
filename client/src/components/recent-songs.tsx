import { useQuery } from '@tanstack/react-query';
import { History } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { type SongRequest } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';

interface RecentSongsProps {
  eventId: number;
}

export default function RecentSongs({ eventId }: RecentSongsProps) {
  const { data: recentSongs, isLoading } = useQuery<SongRequest[]>({
    queryKey: [`/api/events/${eventId}/song-requests`, 'played'],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(`${queryKey[0]}?status=played`);
      if (!response.ok) throw new Error('Failed to fetch recent songs');
      return response.json();
    },
  });

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4 text-white flex items-center">
        <History className="h-5 w-5 text-accent mr-2" />
        Recently Played
      </h2>
      
      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
        {isLoading ? (
          <div className="py-4 text-center">
            <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : recentSongs && recentSongs.length > 0 ? (
          recentSongs.map(song => (
            <Card key={song.id} className="bg-secondary border-none shadow-md hover:shadow-lg transition-all">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-white">{song.songName}</h3>
                    <p className="text-sm text-gray-300">{song.artistName}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {song.playedTime 
                      ? formatDistanceToNow(new Date(song.playedTime), { addSuffix: true })
                      : formatDistanceToNow(new Date(song.requestTime), { addSuffix: true })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-secondary border-none">
            <CardContent className="p-4 text-center">
              <p className="text-gray-400">No songs have been played yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
