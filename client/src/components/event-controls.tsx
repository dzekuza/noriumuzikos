import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { type Event } from '@shared/schema';
import { Pause, Settings, StopCircle, Plus, Save, Share, Copy, Mail, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ImageUpload from '@/components/image-upload';
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
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [eventSettings, setEventSettings] = useState({
    name: '',
    venue: '',
    entryCode: '',
    requestPrice: 0,
    imageUrl: '',
  });
  const [newEventData, setNewEventData] = useState({
    name: '',
    venue: '',
    entryCode: '',
    requestPrice: 500, // Default 500 cents (€5)
    startTime: getDefaultStartTime(), // Default 8:00 PM today in Lithuanian format
    endTime: getDefaultEndTime(), // Default 11:59 PM today in Lithuanian format
    imageUrl: '', // New field for event image
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
        imageUrl: event.imageUrl || '',
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
      isActive: true, // Default to active for new events
      imageUrl: newEventData.imageUrl || null // Include image URL if available
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
      imageUrl: eventSettings.imageUrl || null,
    };
    
    updateEvent(updateData);
    setIsSettingsDialogOpen(false);
    
    toast({
      title: "Nustatymai atnaujinti",
      description: "Renginio nustatymai buvo atnaujinti",
    });
  };
  
  // Generate event URL for sharing
  const getEventUrl = () => {
    // Create URL to the event entry page with event name in the slug
    const eventName = event?.name ? encodeURIComponent(event.name.toLowerCase().replace(/\s+/g, '-')) : '';
    
    // Get the base URL without any additional Replit-specific parts
    let origin = window.location.origin;
    
    // If the URL contains .riker.replit.dev or similar, clean it up
    // This simplifies the URL for sharing purposes
    try {
      const originUrl = new URL(origin);
      // Check if we're on a subdomain of replit that contains a dash (likely a random part)
      if (originUrl.hostname.includes('.replit.') && originUrl.hostname.includes('-')) {
        // Create a cleaner URL (e.g., just noriuMuzikos.app or similar)
        origin = `${originUrl.protocol}//noriuMuzikos.app`;
      }
    } catch (error) {
      console.error('Failed to parse origin URL:', error);
    }
    
    const url = new URL(`${origin}/event-entry${eventName ? `/${eventName}` : ''}`);
    // We don't add the entry code to URL for security reasons, it should be entered manually
    return url.toString();
  };
  
  // Handle copying to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(getEventUrl()).then(() => {
      toast({
        title: "Nuoroda nukopijuota",
        description: "Renginio nuoroda nukopijuota į iškarpinę",
      });
    });
  };
  
  // Handle email sharing
  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Užsisakyk dainas renginye "${event?.name || ''}"`);
    
    // Create a richer email body with event details
    let emailBody = `Sveiki,\n\nNorėčiau pakviesti jus į renginį "${event?.name || ''}"!\n\n`;
    
    if (event?.venue) {
      emailBody += `Vieta: ${event.venue}\n\n`;
    }
    
    // Format date and time in Lithuanian format
    if (event?.startTime) {
      const startTime = new Date(event.startTime);
      const formattedDate = new Intl.DateTimeFormat('lt-LT', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(startTime);
      
      emailBody += `Data ir laikas: ${formattedDate}\n\n`;
    }
    
    emailBody += `Nuoroda į renginį: ${getEventUrl()}\n\n`;
    emailBody += `Prisijungimo kodas: ${event?.entryCode || ''}\n\n`;
    
    // If there's an event image, mention it
    if (event?.imageUrl) {
      emailBody += `Renginio nuotrauką ir daugiau informacijos rasite nuorodoje aukščiau.\n\n`;
    }
    
    emailBody += `Lauksiu!\n\nNoriuMuzikos - Užsakyk dainą gyvam renginiui`;
    
    // Open email client with composed message
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`);
    
    // Show a toast with the entry code reminder
    toast({
      title: "El. pašto nuoroda atidaryta",
      description: `Nepamirškite pasidalinti prisijungimo kodu: ${event?.entryCode || ''}`,
    });
  };
  
  // Handle Facebook sharing
  const handleFacebookShare = () => {
    // Build URL with all necessary parameters
    const url = encodeURIComponent(getEventUrl());
    const title = encodeURIComponent(`Užsisakyk dainas renginye "${event?.name || ''}"`);
    const description = encodeURIComponent(`Prisijunk prie NoriuMuzikos ir užsisakyk savo mėgstamiausią dainą. Prisijungimo kodas: ${event?.entryCode || ''}`);
    
    // URL for dynamic OG meta tags endpoint (if we had one)
    // For now, we'll just use the direct share
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title}`;
    
    // Add event image if available - though Facebook might not pick it up without meta tags
    // Ideally we would have a server endpoint that generates proper OG tags with the image
    // For production, we'd implement a dynamic OG meta tags endpoint for better social sharing
    
    // Open in a popup window
    window.open(facebookShareUrl, '_blank', 'width=600,height=400,resizable=yes');
    
    // Show a toast with the entry code reminder
    toast({
      title: "Dalintis pavyko",
      description: `Nepamirškite pasidalinti prisijungimo kodu: ${event?.entryCode || ''}`,
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
                  onClick={() => setIsShareDialogOpen(true)} 
                  variant="ghost" 
                  className="w-full py-3 px-4 bg-zinc-800 rounded-md text-left flex items-center hover:bg-zinc-700 transition-all justify-start font-normal"
                >
                  <Share className="text-primary mr-3 h-5 w-5" />
                  <span className="text-white">Dalintis renginiu</span>
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
                <Label htmlFor="requestPrice" className="text-white/70">Užsakymo kaina (€)</Label>
                <Input
                  id="requestPrice"
                  name="requestPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newEventData.requestPrice / 100}
                  onChange={(e) => {
                    // Convert euros to cents for storage
                    const valueInCents = Math.round(parseFloat(e.target.value) * 100);
                    setNewEventData(prev => ({
                      ...prev,
                      requestPrice: valueInCents
                    }));
                  }}
                  placeholder="5"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
                <p className="text-xs text-white/50">Dainos užsakymo kaina eurais (pvz., 5€)</p>
              </div>
              
              {/* Image Upload Component */}
              <ImageUpload 
                onImageUploaded={(imageUrl) => {
                  setNewEventData(prev => ({
                    ...prev,
                    imageUrl
                  }));
                }}
                existingImageUrl={newEventData.imageUrl}
                className="mt-4"
              />
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

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="bg-zinc-900 text-white border border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Dalintis renginiu</DialogTitle>
            <DialogDescription className="text-white/70">
              Dalinkites renginio "{event?.name}" nuoroda su draugais
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Social Share Preview */}
            {event?.imageUrl && (
              <div className="mb-4">
                <p className="text-sm font-medium text-white/80 mb-2">Anonsas socialiniuose tinkluose:</p>
                <div className="bg-white rounded-md overflow-hidden border border-zinc-300">
                  <div className="aspect-video bg-zinc-200 overflow-hidden">
                    <img 
                      src={event.imageUrl} 
                      alt={event.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.classList.add('flex', 'items-center', 'justify-center');
                        e.currentTarget.parentElement!.innerHTML = '<div class="text-zinc-400">Nepavyko įkelti nuotraukos</div>';
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-zinc-800 font-medium">{event.name}</p>
                    <p className="text-zinc-500 text-sm">NoriuMuzikos - Užsakyk dainą renginys</p>
                    <p className="text-zinc-400 text-xs mt-1">{getEventUrl()}</p>
                  </div>
                </div>
                <p className="text-xs text-white/70 mt-2 italic">Pastaba: Faktinis atvaizdavimas gali skirtis skirtingose platformose</p>
              </div>
            )}
            
            <div className="bg-zinc-800 p-3 rounded-md border border-zinc-700">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-white/80">Renginio nuoroda:</p>
                <Button 
                  onClick={handleCopyLink} 
                  size="sm" 
                  variant="outline" 
                  className="h-7 px-2 py-0 text-xs bg-zinc-700 hover:bg-zinc-600 border-zinc-600"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Kopijuoti
                </Button>
              </div>
              <div className="px-3 py-2 bg-zinc-950/50 rounded border border-zinc-700/50 font-mono text-xs text-primary break-all">
                {getEventUrl()}
              </div>
            </div>
            
            <div className="bg-zinc-800 p-3 rounded-md border border-zinc-700">
              <p className="text-sm font-medium text-white/80 mb-2">Prisijungimo kodas:</p>
              <div className="px-3 py-2 bg-zinc-950/50 rounded border border-zinc-700/50 font-mono text-sm text-primary text-center">
                <span className="tracking-widest font-bold">{event?.entryCode}</span>
              </div>
              <p className="text-xs text-white/70 mt-2 italic">Svarbu: Vartotojams reikės šio kodo prisijungti</p>
            </div>
            
            <div className="flex flex-col space-y-2 pt-4">
              <p className="text-sm font-semibold text-white mb-2">Dalintis per</p>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={handleEmailShare}
                  variant="outline" 
                  className="bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700 py-6"
                >
                  <Mail className="mr-2 h-5 w-5" />
                  El. paštas
                </Button>
                
                <Button 
                  onClick={handleFacebookShare}
                  variant="outline" 
                  className="bg-blue-600 hover:bg-blue-700 text-white border-blue-700 py-6"
                >
                  <Facebook className="mr-2 h-5 w-5" />
                  Facebook
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => setIsShareDialogOpen(false)}
              className="w-full bg-primary hover:bg-primary/90 text-black font-semibold"
            >
              Uždaryti
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
                <Label htmlFor="settings-requestPrice" className="text-white/70">Užsakymo kaina (€)</Label>
                <Input
                  id="settings-requestPrice"
                  name="requestPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={eventSettings.requestPrice / 100}
                  onChange={(e) => {
                    // Convert euros to cents for storage
                    const valueInCents = Math.round(parseFloat(e.target.value) * 100);
                    setEventSettings(prev => ({
                      ...prev,
                      requestPrice: valueInCents
                    }));
                  }}
                  placeholder="5"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
                <p className="text-xs text-white/50">Dainos užsakymo kaina eurais (pvz., 5€)</p>
              </div>
              
              {/* Image Upload Component */}
              <div className="space-y-2">
                <Label className="text-white/70">Renginio nuotrauka</Label>
                <ImageUpload 
                  onImageUploaded={(imageUrl) => {
                    setEventSettings(prev => ({
                      ...prev,
                      imageUrl
                    }));
                  }}
                  existingImageUrl={eventSettings.imageUrl}
                  className="mt-2"
                />
                <p className="text-xs text-white/50">Nuotrauka bus rodoma dalinantis renginiu socialiniuose tinkluose</p>
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
