import { useRekordbox } from '@/hooks/use-rekordbox';
import { History } from 'lucide-react';

export default function RecentlyPlayed() {
  const { recentlyPlayed, connected } = useRekordbox();
  
  if (!connected) {
    return null; // Don't show if not connected
  }
  
  return (
    <div className="bg-secondary rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-primary">
          <History className="mr-2 h-5 w-5" />
          <h3 className="text-lg font-semibold">Recently Played</h3>
        </div>
        <span className="text-xs text-gray-400 bg-background px-2 py-1 rounded">
          From rekordbox
        </span>
      </div>
      
      {recentlyPlayed.length > 0 ? (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
          {recentlyPlayed.map((track) => (
            <div 
              key={track.id} 
              className="bg-background p-3 rounded-md hover:bg-background/70 transition-colors"
            >
              <h4 className="text-white font-medium truncate">{track.title}</h4>
              <div className="flex justify-between items-center mt-1">
                <p className="text-gray-400 text-sm truncate flex-1">{track.artist}</p>
                {track.playedAt && (
                  <span className="text-xs text-gray-500">
                    {formatPlayedTime(new Date(track.playedAt))}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-background p-4 rounded-md text-center">
          <p className="text-gray-300">No track history yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Recently played tracks will appear here
          </p>
        </div>
      )}
    </div>
  );
}

// Format played time relative to now
function formatPlayedTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else {
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  }
}
