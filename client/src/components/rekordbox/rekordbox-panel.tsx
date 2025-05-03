import { useState } from 'react';
import { useRekordbox } from '@/hooks/use-rekordbox';
import { Music, Database, Disc3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CurrentTrack from './current-track';
import UpcomingPlaylist from './upcoming-playlist';
import RecentlyPlayed from './recently-played';

interface RekordboxPanelProps {
  eventId: number;
}

export default function RekordboxPanel({ eventId }: RekordboxPanelProps) {
  const [showSimulator, setShowSimulator] = useState(false);
  const { connected, simulatePlayingTrack, simulatePlaylist } = useRekordbox();
  
  // Form state for the simulator
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [playlistItems, setPlaylistItems] = useState('');
  
  const handlePlayTrack = () => {
    if (title && artist) {
      simulatePlayingTrack({
        title,
        artist,
        id: `track-${Date.now()}`,
        duration: 180
      });
    }
  };
  
  const handleUpdatePlaylist = () => {
    try {
      // Parse the playlist items - one per line in format: Title - Artist
      const tracks = playlistItems.split('\n')
        .filter(line => line.trim() !== '')
        .map((line, index) => {
          const [title, artist] = line.split('-').map(part => part.trim());
          return {
            id: `playlist-${Date.now()}-${index}`,
            title: title || 'Unknown Title',
            artist: artist || 'Unknown Artist',
            duration: 180,
            position: index
          };
        });
      
      simulatePlaylist(tracks);
    } catch (error) {
      console.error('Error parsing playlist:', error);
    }
  };
  
  return (
    <div className="bg-background rounded-xl p-6 shadow-lg mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Disc3 className="mr-2 h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold text-white">Rekordbox Integration</h2>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSimulator(!showSimulator)}
          className="text-xs"
        >
          {showSimulator ? 'Hide Simulator' : 'Show Simulator'}
        </Button>
      </div>
      
      <CurrentTrack />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UpcomingPlaylist />
        <RecentlyPlayed />
      </div>
      
      {/* Simulator for testing - only shown when requested */}
      {showSimulator && (
        <div className="mt-6 p-4 border border-dashed border-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Rekordbox Simulator</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-primary font-medium mb-2">Simulate Playing Track</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Track Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-secondary border border-gray-700 rounded py-2 px-3 text-white"
                    placeholder="Enter track title"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Artist</label>
                  <input
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    className="w-full bg-secondary border border-gray-700 rounded py-2 px-3 text-white"
                    placeholder="Enter artist name"
                  />
                </div>
                <Button 
                  onClick={handlePlayTrack} 
                  disabled={!title || !artist}
                  className="w-full"
                >
                  <Music className="mr-2 h-4 w-4" />
                  Simulate Playing This Track
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="text-primary font-medium mb-2">Simulate Playlist</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Playlist (one per line: Title - Artist)</label>
                  <textarea
                    value={playlistItems}
                    onChange={(e) => setPlaylistItems(e.target.value)}
                    className="w-full bg-secondary border border-gray-700 rounded py-2 px-3 text-white h-32"
                    placeholder="Track 1 - Artist 1\nTrack 2 - Artist 2\nTrack 3 - Artist 3"
                  />
                </div>
                <Button 
                  onClick={handleUpdatePlaylist} 
                  disabled={!playlistItems.trim()}
                  className="w-full"
                >
                  <Database className="mr-2 h-4 w-4" />
                  Update Playlist
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
