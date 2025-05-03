import { WebSocketServer, WebSocket } from 'ws';
import { SongRequest } from '@shared/schema';
import { Server } from 'http';
import { storage } from './storage';
import { log } from './vite';

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

// Simulate rekordbox integration with in-memory storage
// In a real implementation, this would connect to the rekordbox PRO DJ LINK API
export class RekordboxService {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();
  private currentPlaylist: RekordboxTrack[] = [];
  private currentTrack: RekordboxTrack | null = null;
  private recentlyPlayed: RekordboxTrack[] = [];
  
  /**
   * Initialize the WebSocket server for rekordbox integration
   */
  init(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws/rekordbox' 
    });
    
    this.wss.on('connection', (ws) => {
      log('New Rekordbox WebSocket connection', 'rekordbox');
      this.clients.add(ws);
      
      // Send current state to the new client
      this.sendState(ws);
      
      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message.toString());
          await this.handleMessage(data, ws);
        } catch (error) {
          log(`Error handling WebSocket message: ${error}`, 'rekordbox');
        }
      });
      
      ws.on('close', () => {
        this.clients.delete(ws);
        log('Rekordbox WebSocket connection closed', 'rekordbox');
      });
    });
    
    log('Rekordbox WebSocket server initialized', 'rekordbox');
    return this;
  }
  
  /**
   * Handle incoming messages from clients
   */
  private async handleMessage(data: any, ws: WebSocket) {
    switch (data.type) {
      case 'get_state':
        this.sendState(ws);
        break;
        
      case 'update_track':
        // Update current track playing in rekordbox
        if (data.track) {
          this.updateCurrentTrack(data.track);
        }
        break;
        
      case 'update_playlist':
        // Update the upcoming playlist
        if (data.tracks) {
          this.updatePlaylist(data.tracks);
        }
        break;
        
      case 'mark_as_played':
        // Mark a song request as played
        if (data.songRequestId) {
          await this.markSongRequestAsPlayed(data.songRequestId);
        }
        break;
    }
  }
  
  /**
   * Update the currently playing track
   */
  updateCurrentTrack(track: RekordboxTrack) {
    // If there was a previous track, mark it as played
    if (this.currentTrack && this.currentTrack.id !== track.id) {
      const playedTrack = {
        ...this.currentTrack,
        status: 'played' as const,
        playedAt: new Date()
      };
      
      this.recentlyPlayed.unshift(playedTrack);
      // Keep only the last 50 played tracks
      this.recentlyPlayed = this.recentlyPlayed.slice(0, 50);
      
      // Try to find and mark any matching song requests as played
      this.tryMatchAndMarkAsPlayed(playedTrack);
    }
    
    this.currentTrack = {
      ...track,
      status: 'playing'
    };
    
    // Remove the track from the playlist if it's there
    this.currentPlaylist = this.currentPlaylist.filter(t => t.id !== track.id);
    
    // Broadcast the update to all clients
    this.broadcastState();
  }
  
  /**
   * Update the upcoming playlist
   */
  updatePlaylist(tracks: RekordboxTrack[]) {
    this.currentPlaylist = tracks.map(track => ({
      ...track,
      status: 'queued'
    }));
    
    // Broadcast the update to all clients
    this.broadcastState();
  }
  
  /**
   * Try to match a played track to song requests and mark them as played
   */
  private async tryMatchAndMarkAsPlayed(track: RekordboxTrack) {
    // Get all pending song requests for all events
    // In a real app, you might want to filter by event
    const events = await storage.getEvents();
    
    for (const event of events) {
      const requests = await storage.getSongRequests(event.id, 'pending');
      
      // Find requests that match the track that was just played
      for (const request of requests) {
        // Simple matching by title and artist - case insensitive
        if (
          request.songName.toLowerCase().includes(track.title.toLowerCase()) ||
          track.title.toLowerCase().includes(request.songName.toLowerCase())
        ) {
          // If artist also matches, it's a strong match
          const artistMatches = 
            request.artistName.toLowerCase().includes(track.artist.toLowerCase()) ||
            track.artist.toLowerCase().includes(request.artistName.toLowerCase());
            
          if (artistMatches) {
            // Mark the request as played
            await this.markSongRequestAsPlayed(request.id);
          }
        }
      }
    }
  }
  
  /**
   * Mark a song request as played
   */
  async markSongRequestAsPlayed(requestId: number) {
    try {
      const updatedRequest = await storage.updateSongRequestStatus(requestId, 'played');
      if (updatedRequest) {
        log(`Marked song request ${requestId} as played`, 'rekordbox');
      }
      return updatedRequest;
    } catch (error) {
      log(`Error marking song request as played: ${error}`, 'rekordbox');
      return null;
    }
  }
  
  /**
   * Send the current state to a specific client
   */
  private sendState(ws: WebSocket) {
    const state = {
      type: 'state_update',
      currentTrack: this.currentTrack,
      playlist: this.currentPlaylist,
      recentlyPlayed: this.recentlyPlayed
    };
    
    ws.send(JSON.stringify(state));
  }
  
  /**
   * Broadcast the current state to all connected clients
   */
  private broadcastState() {
    const state = {
      type: 'state_update',
      currentTrack: this.currentTrack,
      playlist: this.currentPlaylist,
      recentlyPlayed: this.recentlyPlayed
    };
    
    const stateJson = JSON.stringify(state);
    
    // Convert Set to Array to avoid iteration issues
    Array.from(this.clients).forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(stateJson);
      }
    });
  }
  
  /**
   * Get the current track being played
   */
  getCurrentTrack() {
    return this.currentTrack;
  }
  
  /**
   * Get the upcoming playlist
   */
  getPlaylist() {
    return this.currentPlaylist;
  }
  
  /**
   * Get recently played tracks
   */
  getRecentlyPlayed() {
    return this.recentlyPlayed;
  }
}

export const rekordboxService = new RekordboxService();
