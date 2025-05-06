import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { type Event } from '@shared/schema';
import { Pause, Settings, StopCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useCreateEvent } from '@/hooks/use-events';

interface EventControlsProps {
  eventId: number;
}

export default function EventControls({ eventId }: EventControlsProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [isEndEventDialogOpen, setIsEndEventDialogOpen] = useState(false);
  const [isCreateEventDialogOpen, setIsCreateEventDialogOpen] = useState(false);
  const [isEventActive, setIsEventActive] = useState(true); // Assume active until checked
  const [newEventData, setNewEventData] = useState({
    name: '',
    venue: '',
    djName: '',
    entryCode: '',
    requestPrice: 500, // Default €5.00
    startTime: new Date().toISOString().split('T')[0] + 'T20:00', // Default 8:00 PM today
    endTime: new Date().toISOString().split('T')[0] + 'T23:59', // Default 11:59 PM today
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createEventMutation = useCreateEvent();
  
  // Fetch event data to check if it's active
  const { data: event } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
  });
  
  // Update the event active status when event data changes
  useEffect(() => {
    if (event) {
      setIsEventActive(event.isActive);
      console.log(`Event ${eventId} active status:`, event.isActive);
    }
  }, [event, eventId]);
  
  const { mutate: updateEvent } = useMutation({
    mutationFn: async (data: { isActive: boolean }) => {
      const response = await apiRequest('PATCH', `/api/events/${eventId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
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
    setIsCreateEventDialogOpen(true);
    toast({
      title: "Event Ended",
      description: "This event has been marked as ended",
    });
  };
  
  const handleCreateEvent = () => {
    // Convert entry code to string and request price to number
    const eventData = {
      ...newEventData,
      entryCode: String(newEventData.entryCode),
      requestPrice: Number(newEventData.requestPrice),
      startTime: new Date(newEventData.startTime),
      endTime: new Date(newEventData.endTime),
      isActive: true // Default to active for new events
    };
    
    createEventMutation.mutate(eventData, {
      onSuccess: (newEvent) => {
        toast({
          title: "Event Created",
          description: `Successfully created "${newEvent.name}" event`,
        });
        setIsCreateEventDialogOpen(false);
        // Redirect to the new event dashboard would happen here in a real app
        queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      },
      onError: (error) => {
        toast({
          title: "Error Creating Event",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
      }
    });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEventData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  return (
    <>
      <Card className="bg-zinc-900 border border-zinc-800 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-white">Event Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Only show these controls if the event is active */}
            {isEventActive ? (
              <>
                <Button 
                  onClick={handlePauseToggle}
                  variant="ghost" 
                  className="w-full py-3 px-4 bg-zinc-800 rounded-md text-left flex items-center hover:bg-zinc-700 transition-all justify-start font-normal"
                >
                  <Pause className="text-primary mr-3 h-5 w-5" />
                  <span className="text-white">
                    {isPaused ? "Resume Requests" : "Pause Requests"}
                  </span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full py-3 px-4 bg-zinc-800 rounded-md text-left flex items-center hover:bg-zinc-700 transition-all justify-start font-normal"
                >
                  <Settings className="text-primary mr-3 h-5 w-5" />
                  <span className="text-white">Settings</span>
                </Button>
                
                <Button 
                  onClick={() => setIsEndEventDialogOpen(true)}
                  variant="ghost" 
                  className="w-full py-3 px-4 bg-destructive/90 rounded-md text-left flex items-center hover:bg-destructive transition-all justify-start font-normal"
                >
                  <StopCircle className="mr-3 h-5 w-5" />
                  <span className="text-white">End Event</span>
                </Button>
              </>
            ) : (
              <p className="text-white/60 text-sm mb-2">This event has ended.</p>
            )}
            
            {/* Always show the Create New Event button */}
            <Button 
              onClick={() => setIsCreateEventDialogOpen(true)}
              variant="ghost" 
              className="w-full py-3 px-4 bg-zinc-800 rounded-md text-left flex items-center hover:bg-zinc-700 transition-all justify-start font-normal"
            >
              <Plus className="text-primary mr-3 h-5 w-5" />
              <span className="text-white">Create New Event</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* End Event Dialog */}
      <AlertDialog open={isEndEventDialogOpen} onOpenChange={setIsEndEventDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border border-zinc-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">End this event?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              This will stop accepting new song requests and mark this event as ended.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEndEvent} className="bg-destructive text-white">
              End Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Create New Event Dialog */}
      <Dialog open={isCreateEventDialogOpen} onOpenChange={setIsCreateEventDialogOpen}>
        <DialogContent className="bg-zinc-900 text-white border border-zinc-800 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Create New Event</DialogTitle>
            <DialogDescription className="text-white/70">
              Set up a new event for song requests
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/70">Event Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={newEventData.name}
                  onChange={handleInputChange}
                  placeholder="Saturday Night Party"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="venue" className="text-white/70">Venue</Label>
                <Input
                  id="venue"
                  name="venue"
                  value={newEventData.venue}
                  onChange={handleInputChange}
                  placeholder="Club XYZ"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="djName" className="text-white/70">DJ Name</Label>
                <Input
                  id="djName"
                  name="djName"
                  value={newEventData.djName}
                  onChange={handleInputChange}
                  placeholder="DJ Awesome"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-white/70">Start Time</Label>
                  <Input
                    id="startTime"
                    name="startTime"
                    type="datetime-local"
                    value={newEventData.startTime}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-white/70">End Time</Label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="datetime-local"
                    value={newEventData.endTime}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="entryCode" className="text-white/70">Entry Code</Label>
                <Input
                  id="entryCode"
                  name="entryCode"
                  value={newEventData.entryCode}
                  onChange={handleInputChange}
                  placeholder="PARTY123"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
                <p className="text-xs text-white/50">Customers will need this code to access the request page</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="requestPrice" className="text-white/70">Request Price (€)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70">€</span>
                  <Input
                    id="requestPrice"
                    name="requestPrice"
                    type="number"
                    min="0"
                    step="1"
                    value={Number(newEventData.requestPrice) / 100}
                    onChange={(e) => {
                      // Convert EUR to cents when saving
                      const valueInEur = parseFloat(e.target.value);
                      const valueInCents = Math.round(valueInEur * 100);
                      setNewEventData(prev => ({
                        ...prev,
                        requestPrice: valueInCents
                      }));
                    }}
                    placeholder="5.00"
                    className="bg-zinc-800 border-zinc-700 text-white pl-8"
                    required
                  />
                </div>
                <p className="text-xs text-white/50">Default: €5.00 per request</p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateEventDialogOpen(false)}
              className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateEvent} 
              disabled={createEventMutation.isPending}
              className="bg-primary hover:bg-primary/90 text-black font-semibold"
            >
              {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
