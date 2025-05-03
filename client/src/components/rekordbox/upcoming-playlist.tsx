import { useRekordbox } from '@/hooks/use-rekordbox';
import { ListMusic } from 'lucide-react';

export default function UpcomingPlaylist() {
  const { playlist, connected } = useRekordbox();
  
  if (!connected) {
    return null; // Don't show if not connected
  }
  
  return (
    <div className="bg-secondary rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-primary">
          <ListMusic className="mr-2 h-5 w-5" />
          <h3 className="text-lg font-semibold">Upcoming in Rekordbox</h3>
        </div>
        <span className="text-xs text-gray-400 bg-background px-2 py-1 rounded">
          {playlist.length} tracks
        </span>
      </div>
      
      {playlist.length > 0 ? (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
          {playlist.map((track, index) => (
            <div 
              key={track.id} 
              className="bg-background p-3 rounded-md flex items-center justify-between group hover:bg-background/70 transition-colors"
            >
              <div className="flex items-center">
                <div className="text-gray-500 font-medium w-6 text-center mr-3">
                  {index + 1}
                </div>
                <div>
                  <h4 className="text-white font-medium truncate max-w-[240px]">{track.title}</h4>
                  <p className="text-gray-400 text-sm truncate max-w-[240px]">{track.artist}</p>
                </div>
              </div>
              <div className="text-gray-500 text-sm">
                {formatTime(track.duration)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-background p-4 rounded-md text-center">
          <p className="text-gray-300">No upcoming tracks</p>
          <p className="text-sm text-gray-400 mt-1">
            Queue tracks in rekordbox to see them here
          </p>
        </div>
      )}
    </div>
  );
}

// Utility function to format seconds to MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
