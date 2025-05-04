import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ListMusic, RefreshCw, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type SongRequest } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface PendingRequestsProps {
  eventId: number;
}

type SortOption = 'newest' | 'oldest' | 'amount';

export default function PendingRequests({ eventId }: PendingRequestsProps) {
  const [sortOrder, setSortOrder] = useState<SortOption>('newest');
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: requests, isLoading, refetch } = useQuery<SongRequest[]>({
    queryKey: [`/api/events/${eventId}/song-requests`, 'pending'],
    queryFn: async ({ queryKey }) => {
      console.log('Fetching song requests for eventId:', eventId, 'with status: pending');
      const response = await fetch(`${queryKey[0]}?status=pending`);
      if (!response.ok) {
        console.error('Failed to fetch song requests:', response.status, response.statusText);
        throw new Error('Failed to fetch pending requests');
      }
      const data = await response.json();
      console.log('Received song requests:', data);
      return data;
    },
  });
  
  const { mutate: updateRequestStatus } = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest('PATCH', `/api/song-requests/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/song-requests`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive",
      });
    },
  });
  
  const handlePlay = (id: number) => {
    updateRequestStatus({ id, status: 'played' });
    toast({
      title: "Song Played",
      description: "The song has been marked as played",
    });
  };
  
  const handleSkip = (id: number) => {
    updateRequestStatus({ id, status: 'skipped' });
    toast({
      title: "Song Skipped",
      description: "The song has been skipped",
    });
  };
  
  const sortRequests = (requests: SongRequest[] | undefined) => {
    if (!requests) return [];
    
    return [...requests].sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.requestTime).getTime() - new Date(a.requestTime).getTime();
      } else if (sortOrder === 'oldest') {
        return new Date(a.requestTime).getTime() - new Date(b.requestTime).getTime();
      } else { // amount (all are €5, so this is just for the UI)
        return b.amount - a.amount;
      }
    });
  };
  
  const sortedRequests = sortRequests(requests);
  
  return (
    <Card className="bg-secondary border-none shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <ListMusic className="text-primary mr-2 h-5 w-5" /> 
            Pending Requests
          </h2>
          
          <div className="flex items-center space-x-2">
            <Select 
              value={sortOrder} 
              onValueChange={(value) => setSortOrder(value as SortOption)}
            >
              <SelectTrigger className="bg-background text-white text-sm px-3 py-1.5 rounded-lg border border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="amount">Amount (High-Low)</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={() => refetch()}
              size="icon" 
              className="bg-primary text-white p-1.5 rounded-lg hover:bg-primary/90 transition-all"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="py-10 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : sortedRequests.length > 0 ? (
            sortedRequests.map(request => (
              <div 
                key={request.id} 
                className="bg-background rounded-lg p-4 hover:bg-opacity-80 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg">{request.songName}</h3>
                    <p className="text-gray-300">{request.artistName}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-gray-400 mr-3">Requested by: {request.requesterName}</span>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(request.requestTime), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className="text-accent font-bold mb-2">€{(request.amount / 100).toFixed(2)}</span>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => handlePlay(request.id)}
                        size="sm"
                        className="bg-[#00F5A0] text-white py-1 px-3 rounded-lg text-sm hover:bg-opacity-90 transition-all"
                      >
                        <Check className="mr-1 h-3 w-3" /> Play
                      </Button>
                      <Button 
                        onClick={() => handleSkip(request.id)}
                        size="sm"
                        variant="destructive"
                        className="py-1 px-3 rounded-lg text-sm hover:bg-opacity-90 transition-all"
                      >
                        <X className="mr-1 h-3 w-3" /> Skip
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <ListMusic className="h-10 w-10 text-gray-600 mx-auto mb-3" />
              <h3 className="text-xl text-gray-400 font-semibold">No Pending Requests</h3>
              <p className="text-gray-500 mt-2">Share your event QR code to get song requests</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
