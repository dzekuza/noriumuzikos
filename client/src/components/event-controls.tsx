import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { type Event } from '@shared/schema';
import { Pause, Settings, StopCircle, Plus, Save } from 'lucide-react';
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
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isEventActive, setIsEventActive] = useState(true); // Assume active until checked
  const [eventSettings, setEventSettings] = useState({
    name: '',
    venue: '',
    entryCode: '',
    requestPrice: 0,
  });
  const [newEventData, setNewEventData] = useState({
    name: '',
    venue: '',
    entryCode: '',
    requestPrice: 500, // Default 500 cents (€5)
    startTime: getDefaultStartTime(), // Default 8:00 PM today in Lithuanian format
    endTime: getDefaultEndTime(), // Default 11:59 PM today in Lithuanian format
  });
  
  // Helper function to get default start time (8:00 PM today)
  function getDefaultStartTime() {
    const today = new Date();
    today.setHours(20, 0, 0, 0); // 8:00 PM
    return today.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
  }
  
  // Helper function to get default end time (11:59 PM today)
  function getDefaultEndTime() {
    const today = new Date();
    today.setHours(23, 59, 0, 0); // 11:59 PM
    return today.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
  }
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createEventMutation = useCreateEvent();
  
  // Fetch event data to check if it's active
  const { data: event } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
  });
  
  // Update the event settings and status when event data changes
  useEffect(() => {
    if (event) {
      setIsEventActive(event.isActive);
      setEventSettings({
        name: event.name,
        venue: event.venue,
        entryCode: event.entryCode || '',
        requestPrice: event.requestPrice,
      });
      console.log(`Event ${eventId} loaded:`, event);
    }
  }, [event, eventId]);
  
  const { mutate: updateEvent } = useMutation({
    mutationFn: async (data: Partial<Event>) => {
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
      title: isPaused ? "Užsakymai atnaujinti" : "Užsakymai pristabdyti",
      description: isPaused 
        ? "Klientai vėl gali siųsti dainų užsakymus" 
        : "Nauji dainų užsakymai buvo pristabdyti",
    });
  };
  
  const handleEndEvent = () => {
    updateEvent({ isActive: false });
    setIsEndEventDialogOpen(false);
    
    // Redirect to the main dashboard
    window.location.href = '/dashboard';
    
    toast({
      title: "Renginys baigtas",
      description: "Renginys pažymėtas kaip baigtas",
    });
  };
  
  const handleCreateEvent = () => {
    // Convert entry code to string and request price to number
    const eventData = {
      ...newEventData,
      djName: "", // Providing empty value for djName since it's required but field was removed
      entryCode: String(newEventData.entryCode),
      requestPrice: Number(newEventData.requestPrice),
      startTime: new Date(newEventData.startTime),
      endTime: new Date(newEventData.endTime),
      isActive: true // Default to active for new events
    };
    
    createEventMutation.mutate(eventData, {
      onSuccess: (newEvent) => {
        toast({
          title: "Renginys sukurtas",
          description: `Renginys "${newEvent.name}" sėkmingai sukurtas`,
        });
        setIsCreateEventDialogOpen(false);
        // Redirect to the new event dashboard would happen here in a real app
        queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      },
      onError: (error) => {
        toast({
          title: "Klaida kuriant renginį",
          description: error instanceof Error ? error.message : "Nežinoma klaida",
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
  
  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEventSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSaveSettings = () => {
    // Prepare the update data
    const updateData = {
      name: eventSettings.name,
      venue: eventSettings.venue,
      djName: "", // Providing empty value for djName since it's required but field was removed
      entryCode: eventSettings.entryCode,
      requestPrice: Number(eventSettings.requestPrice),
    };
    
    updateEvent(updateData);
    setIsSettingsDialogOpen(false);
    
    toast({
      title: "Nustatymai atnaujinti",
      description: "Renginio nustatymai buvo atnaujinti",
    });
  };
  
  return (
    <>
      <Card className="bg-zinc-900 border border-zinc-800 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-white">Renginio valdymas</CardTitle>
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
                    {isPaused ? "Atnaujinti užsakymus" : "Pristabdyti užsakymus"}
                  </span>
                </Button>
                
                <Button
                  onClick={() => setIsSettingsDialogOpen(true)} 
                  variant="ghost" 
                  className="w-full py-3 px-4 bg-zinc-800 rounded-md text-left flex items-center hover:bg-zinc-700 transition-all justify-start font-normal"
                >
                  <Settings className="text-primary mr-3 h-5 w-5" />
                  <span className="text-white">Nustatymai</span>
                </Button>
                
                <Button 
                  onClick={() => setIsEndEventDialogOpen(true)}
                  variant="ghost" 
                  className="w-full py-3 px-4 bg-destructive/90 rounded-md text-left flex items-center hover:bg-destructive transition-all justify-start font-normal"
                >
                  <StopCircle className="mr-3 h-5 w-5" />
                  <span className="text-white">Baigti renginį</span>
                </Button>
              </>
            ) : (
              <p className="text-white/60 text-sm mb-2">Šis renginys jau baigtas.</p>
            )}
            
            {/* We've removed the Create New Event button as requested */}
          </div>
        </CardContent>
      </Card>
      
      {/* End Event Dialog */}
      <AlertDialog open={isEndEventDialogOpen} onOpenChange={setIsEndEventDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border border-zinc-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Baigti šį renginį?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Tai sustabdys naujų dainų užsakymų priėmimą ir pažymės renginį kaip baigtą.
              Šio veiksmo negalima atšaukti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700">Atšaukti</AlertDialogCancel>
            <AlertDialogAction onClick={handleEndEvent} className="bg-destructive text-white">
              Baigti renginį
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Create New Event Dialog */}
      <Dialog open={isCreateEventDialogOpen} onOpenChange={setIsCreateEventDialogOpen}>
        <DialogContent className="bg-zinc-900 text-white border border-zinc-800 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Sukurti naują renginį</DialogTitle>
            <DialogDescription className="text-white/70">
              Sukurkite naują renginį dainų užsakymams
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/70">Renginio pavadinimas</Label>
                <Input
                  id="name"
                  name="name"
                  value={newEventData.name}
                  onChange={handleInputChange}
                  placeholder="Šeštadienio vakarėlis"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="venue" className="text-white/70">Vieta</Label>
                <Input
                  id="venue"
                  name="venue"
                  value={newEventData.venue}
                  onChange={handleInputChange}
                  placeholder="Klubas XYZ"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>
              
              {/* DJ Name field removed as requested */}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-white/70">Pradžios laikas</Label>
                  <Input
                    id="startTime"
                    name="startTime"
                    type="datetime-local"
                    value={newEventData.startTime}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    required
                  />
                  <p className="text-xs text-white/50">Formato pavyzdys: 2025-05-06T20:00</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-white/70">Pabaigos laikas</Label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="datetime-local"
                    value={newEventData.endTime}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    required
                  />
                  <p className="text-xs text-white/50">Formato pavyzdys: 2025-05-06T23:59</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="entryCode" className="text-white/70">Prieigos kodas</Label>
                <Input
                  id="entryCode"
                  name="entryCode"
                  value={newEventData.entryCode}
                  onChange={handleInputChange}
                  placeholder="VAKARĖLIS123"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
                <p className="text-xs text-white/50">Klientams reikalingas kodas norint prisijungti prie užsakymų puslapio</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="requestPrice" className="text-white/70">Užsakymo kaina (centais)</Label>
                <Input
                  id="requestPrice"
                  name="requestPrice"
                  type="number"
                  min="0"
                  value={newEventData.requestPrice}
                  onChange={(e) => {
                    // Store the price directly in cents
                    const valueInCents = parseInt(e.target.value, 10);
                    setNewEventData(prev => ({
                      ...prev,
                      requestPrice: valueInCents
                    }));
                  }}
                  placeholder="500"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
                <p className="text-xs text-white/50">Dainos užsakymo kaina centais (500 = €5,00)</p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateEventDialogOpen(false)}
              className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700"
            >
              Atšaukti
            </Button>
            <Button 
              onClick={handleCreateEvent} 
              disabled={createEventMutation.isPending}
              className="bg-primary hover:bg-primary/90 text-black font-semibold"
            >
              {createEventMutation.isPending ? 'Kuriama...' : 'Sukurti renginį'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="bg-zinc-900 text-white border border-zinc-800 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Renginio nustatymai</DialogTitle>
            <DialogDescription className="text-white/70">
              Redaguokite renginio informaciją ir parametrus
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="settings-name" className="text-white/70">Renginio pavadinimas</Label>
                <Input
                  id="settings-name"
                  name="name"
                  value={eventSettings.name}
                  onChange={handleSettingsChange}
                  placeholder="Šeštadienio vakarėlis"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="settings-venue" className="text-white/70">Vieta</Label>
                <Input
                  id="settings-venue"
                  name="venue"
                  value={eventSettings.venue}
                  onChange={handleSettingsChange}
                  placeholder="Klubas XYZ"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>
              
              {/* DJ Name field removed as requested */}
              
              <div className="space-y-2">
                <Label htmlFor="settings-entryCode" className="text-white/70">Prieigos kodas</Label>
                <Input
                  id="settings-entryCode"
                  name="entryCode"
                  value={eventSettings.entryCode}
                  onChange={handleSettingsChange}
                  placeholder="VAKARĖLIS123"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
                <p className="text-xs text-white/50">Klientams reikalingas kodas norint prisijungti prie užsakymų puslapio</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="settings-requestPrice" className="text-white/70">Užsakymo kaina (centais)</Label>
                <Input
                  id="settings-requestPrice"
                  name="requestPrice"
                  type="number"
                  min="0"
                  value={eventSettings.requestPrice}
                  onChange={(e) => {
                    // Store the price directly in cents
                    const valueInCents = parseInt(e.target.value, 10);
                    setEventSettings(prev => ({
                      ...prev,
                      requestPrice: valueInCents
                    }));
                  }}
                  placeholder="500"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
                <p className="text-xs text-white/50">Dainos užsakymo kaina centais (500 = €5,00)</p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSettingsDialogOpen(false)}
              className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700"
            >
              Atšaukti
            </Button>
            <Button 
              onClick={handleSaveSettings}
              className="bg-primary hover:bg-primary/90 text-black font-semibold"
            >
              <Save className="mr-2 h-4 w-4" /> Išsaugoti
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
