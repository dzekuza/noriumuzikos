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
  
  // This function is used to create the WebSocket safely without throwing errors
  // and is defined outside the useEffect to avoid any potential issues
  const createSafeWebSocket = () => {
    // Create a mock WebSocket as fallback
    const mockWebSocket = {
      onopen: null,
      onmessage: null,
      onclose: null,
      onerror: null,
      readyState: 3, // CLOSED
      OPEN: 1,       // WebSocket.OPEN constant
      send: (data: string) => console.log('Mock WebSocket send:', data),
      close: () => console.log('Mock WebSocket close')
    } as unknown as WebSocket;
    
    try {
      // Get the current hostname and port
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      
      if (!host || !protocol) {
        console.warn('Invalid WebSocket URL parameters, using mock connection');
        return mockWebSocket;
      }
      
      const wsUrl = `${protocol}//${host}/ws`;
      console.log(`Attempting to connect to WebSocket at ${wsUrl}`);
      
      try {
        // Try to create a real WebSocket with error handling
        const realWebSocket = new WebSocket(wsUrl);
        console.log('WebSocket connection created successfully');
        return realWebSocket;
      } catch (wsError) {
        console.error('Error creating WebSocket:', wsError);
        return mockWebSocket;
      }
    } catch (error) {
      console.error('Error in WebSocket setup:', error);
      return mockWebSocket;
    }
  };
  
  useEffect(() => {
    // Create WebSocket connection with robust error handling
    const ws = createSafeWebSocket();
    let isComponentMounted = true;
    
    // Setup event handlers
    const handleOpen = () => {
      if (isComponentMounted) {
        setConnected(true);
        console.log('Connected to Rekordbox WebSocket');
        
        // Request initial state
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({ type: 'get_state' }));
        }
      }
    };
    
    const handleMessage = (event: MessageEvent) => {
      if (!isComponentMounted) return;
      
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
    
    const handleClose = () => {
      if (isComponentMounted) {
        setConnected(false);
        console.log('Disconnected from Rekordbox WebSocket');
      }
    };
    
    const handleError = (error: Event) => {
      console.error('WebSocket error:', error);
      if (isComponentMounted) {
        toast({
          title: 'Connection Notice',
          description: 'Running in offline mode for track synchronization',
          variant: 'default'
        });
      }
    };
    
    // Assign event handlers
    ws.onopen = handleOpen;
    ws.onmessage = handleMessage;
    ws.onclose = handleClose;
    ws.onerror = handleError;
    
    setSocket(ws);
    
    // Clean up WebSocket on unmount
    return () => {
      isComponentMounted = false;
      
      try {
        if (ws && ws.readyState === ws.OPEN) {
          ws.close();
        }
      } catch (error) {
        console.error('Error closing WebSocket:', error);
      }
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
