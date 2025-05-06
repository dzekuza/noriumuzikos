import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { History } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { type SongRequest } from '@shared/schema';

interface PlayedSongsProps {
  eventId: number;
}

export default function PlayedSongs({ eventId }: PlayedSongsProps) {
  const { data: playedSongs, isLoading } = useQuery<SongRequest[]>({
    queryKey: [`/api/events/${eventId}/song-requests`, 'played'],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(`${queryKey[0]}?status=played`);
      if (!response.ok) throw new Error('Failed to fetch played songs');
      return response.json();
    },
  });

  return (
    <Card className="bg-secondary border-none shadow-lg">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-white flex items-center mb-4">
          <History className="text-accent mr-2 h-5 w-5" /> 
          Recently Played
        </h2>
        
        <div className="space-y-3 max-h-[320px] overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="py-6 text-center">
              <div className="animate-spin w-6 h-6 border-3 border-primary border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : playedSongs && playedSongs.length > 0 ? (
            playedSongs.map(song => (
              <div 
                key={song.id}
                className="bg-background rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-medium text-white">{song.songName}</h3>
                  <p className="text-sm text-gray-300">{song.artistName}</p>
                  <span className="text-xs text-gray-400 mt-1">Requested by: {song.requesterName}</span>
                  {song.wishes && (
                    <p className="text-xs italic text-gray-400 mt-1">Palinkėjimas: {song.wishes}</p>
                  )}
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-accent font-bold">€{(song.amount / 100).toFixed(2)}</span>
                  <span className="text-xs text-gray-400 mt-1">
                    Played {song.playedTime 
                      ? formatDistanceToNow(new Date(song.playedTime), { addSuffix: true })
                      : 'recently'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <History className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <h3 className="text-lg text-gray-400">No Songs Played Yet</h3>
              <p className="text-gray-500 mt-1 text-sm">Played songs will appear here</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
