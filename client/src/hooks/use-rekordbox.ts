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
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;
    
    console.log(`Attempting to connect to WebSocket at ${wsUrl}`);
    
    // Create the WebSocket connection with error handling
    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl);
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      // Create a mock WebSocket for fallback (to prevent app crashes)
      ws = {
        onopen: null,
        onmessage: null,
        onclose: null,
        onerror: null,
        send: (data: string) => console.log('Mock WebSocket send:', data),
        close: () => console.log('Mock WebSocket close')
      } as unknown as WebSocket;
      
      toast({
        title: 'Connection Warning',
        description: 'Using offline mode for DJ tracks',
        variant: 'default'
      });
    }
    
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
