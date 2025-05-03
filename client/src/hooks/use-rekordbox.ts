import { useEffect, useState } from 'react';
import { useToast } from './use-toast';

interface RekordboxTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  position: number;
  status: 'playing' | 'queued' | 'played';
  playedAt?: Date;
}

interface RekordboxState {
  currentTrack: RekordboxTrack | null;
  playlist: RekordboxTrack[];
  recentlyPlayed: RekordboxTrack[];
}

/**
 * Hook to connect to the rekordbox WebSocket server and receive updates
 */
export function useRekordbox() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [state, setState] = useState<RekordboxState>({
    currentTrack: null,
    playlist: [],
    recentlyPlayed: []
  });
  const { toast } = useToast();
  
  useEffect(() => {
    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/rekordbox`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      setConnected(true);
      console.log('Connected to Rekordbox WebSocket');
      
      // Request initial state
      ws.send(JSON.stringify({ type: 'get_state' }));
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'state_update') {
          setState({
            currentTrack: data.currentTrack,
            playlist: data.playlist || [],
            recentlyPlayed: data.recentlyPlayed || []
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.onclose = () => {
      setConnected(false);
      console.log('Disconnected from Rekordbox WebSocket');
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: 'Connection Error',
        description: 'Could not connect to Rekordbox service',
        variant: 'destructive'
      });
    };
    
    setSocket(ws);
    
    // Clean up WebSocket on unmount
    return () => {
      ws.close();
    };
  }, [toast]);
  
  /**
   * Mark a song request as played
   */
  const markAsPlayed = async (songRequestId: number) => {
    try {
      const response = await fetch(`/api/rekordbox/mark-played/${songRequestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark song as played');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error marking song as played:', error);
      throw error;
    }
  };
  
  /**
   * Simulate playing a track (for testing)
   */
  const simulatePlayingTrack = async (track: {
    title: string;
    artist: string;
    id?: string;
    duration?: number;
  }) => {
    try {
      const response = await fetch('/api/rekordbox/simulate/playing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(track)
      });
      
      if (!response.ok) {
        throw new Error('Failed to simulate playing track');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error simulating playing track:', error);
      throw error;
    }
  };
  
  /**
   * Simulate updating the playlist (for testing)
   */
  const simulatePlaylist = async (tracks: Array<{
    id: string;
    title: string;
    artist: string;
    duration?: number;
    position?: number;
  }>) => {
    try {
      const response = await fetch('/api/rekordbox/simulate/playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tracks })
      });
      
      if (!response.ok) {
        throw new Error('Failed to simulate playlist update');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error simulating playlist update:', error);
      throw error;
    }
  };
  
  return {
    ...state,
    connected,
    markAsPlayed,
    simulatePlayingTrack,
    simulatePlaylist
  };
}

export type { RekordboxTrack };
