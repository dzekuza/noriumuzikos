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
    <div className="mt-6 sm:mt-8 w-full max-w-md mx-auto">
      <h3 className="text-white/70 text-sm font-medium mb-2 sm:mb-4">Neseniai grotos dainos</h3>
      
      <div className="space-y-2 sm:space-y-3 max-h-60 sm:max-h-80 overflow-y-auto pr-1 sm:pr-2 hide-scrollbar">
        {isLoading ? (
          <div className="py-4 text-center">
            <div className="animate-spin w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : recentSongs && recentSongs.length > 0 ? (
          recentSongs.map(song => (
            <div key={song.id} className="bg-zinc-900/50 rounded-md p-3 sm:p-4 hover:bg-zinc-900/80 transition-all">
              <div className="flex flex-wrap sm:flex-nowrap justify-between items-start sm:items-center gap-1">
                <div className="w-full sm:w-auto">
                  <h3 className="font-medium text-white text-sm sm:text-base truncate">{song.songName}</h3>
                  <p className="text-xs sm:text-sm text-white/60 truncate">{song.artistName}</p>
                  {song.wishes && (
                    <p className="text-xs italic text-white/40 mt-1 truncate">Palinkėjimas: {song.wishes}</p>
                  )}
                </div>
                <span className="text-xs text-white/40 whitespace-nowrap">
                  {song.playedTime 
                    ? formatDistanceToNow(new Date(song.playedTime), { addSuffix: true })
                    : formatDistanceToNow(new Date(song.requestTime), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-zinc-900/50 rounded-md p-4 text-center">
            <p className="text-white/40">Dar nėra grotų dainų</p>
          </div>
        )}
      </div>
    </div>
  );
}
