import { useRekordbox } from '@/hooks/use-rekordbox';
import { Disc3 } from 'lucide-react';

export default function CurrentTrack() {
  const { currentTrack, connected } = useRekordbox();
  
  if (!connected) {
    return (
      <div className="bg-secondary rounded-lg p-6 mb-6">
        <div className="flex items-center mb-4 text-primary">
          <Disc3 className="mr-2 h-5 w-5" />
          <h3 className="text-lg font-semibold">Rekordbox Connection</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-300">Connecting to rekordbox...</p>
            <p className="text-sm text-gray-400 mt-1">
              Make sure rekordbox is running and connected to the same network.
            </p>
          </div>
          <div className="animate-pulse bg-background rounded-full h-3 w-3"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-secondary rounded-lg p-6 mb-6 overflow-hidden">
      <div className="flex items-center mb-4 text-primary">
        <Disc3 className="mr-2 h-5 w-5 animate-spin-slow" />
        <h3 className="text-lg font-semibold">Now Playing</h3>
      </div>
      
      {currentTrack ? (
        <div className="relative overflow-hidden rounded-md">
          {/* Visual animation for the track */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 animate-pulse"></div>
          
          <div className="relative z-10 p-4 bg-background/30 backdrop-blur-sm">
            <h4 className="text-xl font-bold text-white truncate">{currentTrack.title}</h4>
            <p className="text-primary truncate">{currentTrack.artist}</p>
            
            <div className="h-1 w-full bg-gray-700 rounded-full mt-4 mb-1">
              <div 
                className="h-1 bg-primary rounded-full" 
                style={{ width: `${(currentTrack.position / currentTrack.duration) * 100}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-xs text-gray-400">
              <span>
                {formatTime(currentTrack.position)} / {formatTime(currentTrack.duration)}
              </span>
              <span className="flex items-center">
                <span className="inline-block h-2 w-2 rounded-full bg-primary mr-1 animate-pulse"></span>
                Live from rekordbox
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-background p-4 rounded-md">
          <p className="text-gray-300">No track currently playing</p>
          <p className="text-sm text-gray-400 mt-1">
            Tracks will appear here when playing in rekordbox
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
