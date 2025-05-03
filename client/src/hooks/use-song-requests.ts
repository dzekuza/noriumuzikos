import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { type SongRequest } from '@shared/schema';

/**
 * Hook to fetch song requests for an event with optional status filter
 */
export function useSongRequests(eventId: number, status?: string) {
  const queryKey = status 
    ? [`/api/events/${eventId}/song-requests`, status]
    : [`/api/events/${eventId}/song-requests`];
  
  const queryFn = async ({ queryKey }: { queryKey: string[] }) => {
    const url = status 
      ? `${queryKey[0]}?status=${status}`
      : queryKey[0];
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch song requests');
    return response.json();
  };

  return useQuery<SongRequest[]>({
    queryKey,
    queryFn,
  });
}

/**
 * Hook to create a new song request
 */
export function useCreateSongRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      eventId, 
      songData 
    }: { 
      eventId: number; 
      songData: Omit<SongRequest, 'id' | 'requestTime' | 'playedTime'> 
    }) => {
      const response = await apiRequest('POST', `/api/events/${eventId}/song-requests`, songData);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/events/${variables.eventId}/song-requests`] 
      });
    },
  });
}

/**
 * Hook to update a song request status
 */
export function useUpdateSongRequestStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      status,
      eventId
    }: { 
      id: number; 
      status: string;
      eventId: number;
    }) => {
      const response = await apiRequest('PATCH', `/api/song-requests/${id}/status`, { status });
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/events/${variables.eventId}/song-requests`] 
      });
    },
  });
}
