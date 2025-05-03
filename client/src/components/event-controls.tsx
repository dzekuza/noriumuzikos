import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pause, Settings, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface EventControlsProps {
  eventId: number;
}

export default function EventControls({ eventId }: EventControlsProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [isEndEventDialogOpen, setIsEndEventDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { mutate: updateEvent } = useMutation({
    mutationFn: async (data: { isActive: boolean }) => {
      const response = await apiRequest('PATCH', `/api/events/${eventId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update event status",
        variant: "destructive",
      });
    },
  });
  
  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
    toast({
      title: isPaused ? "Accepting Requests" : "Paused Requests",
      description: isPaused 
        ? "Customers can now submit song requests" 
        : "New song requests have been paused",
    });
  };
  
  const handleEndEvent = () => {
    updateEvent({ isActive: false });
    setIsEndEventDialogOpen(false);
    toast({
      title: "Event Ended",
      description: "This event has been marked as ended",
    });
  };
  
  return (
    <>
      <Card className="bg-secondary border-none shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-white">Event Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button 
              onClick={handlePauseToggle}
              variant="ghost" 
              className="w-full py-3 px-4 bg-background rounded-lg text-left flex items-center hover:bg-opacity-80 transition-all justify-start font-normal"
            >
              <Pause className="text-accent mr-3 h-5 w-5" />
              <span className="text-white">
                {isPaused ? "Resume Requests" : "Pause Requests"}
              </span>
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full py-3 px-4 bg-background rounded-lg text-left flex items-center hover:bg-opacity-80 transition-all justify-start font-normal"
            >
              <Settings className="text-accent mr-3 h-5 w-5" />
              <span className="text-white">Settings</span>
            </Button>
            
            <Button 
              onClick={() => setIsEndEventDialogOpen(true)}
              variant="ghost" 
              className="w-full py-3 px-4 bg-destructive bg-opacity-90 rounded-lg text-left flex items-center hover:bg-opacity-100 transition-all justify-start font-normal"
            >
              <StopCircle className="mr-3 h-5 w-5" />
              <span className="text-white">End Event</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={isEndEventDialogOpen} onOpenChange={setIsEndEventDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End this event?</AlertDialogTitle>
            <AlertDialogDescription>
              This will stop accepting new song requests and mark this event as ended.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEndEvent} className="bg-destructive text-white">
              End Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
