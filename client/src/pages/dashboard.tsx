import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventStats from '@/components/event-stats';
import QRCodeDisplay from '@/components/qr-code-display';
import EventControls from '@/components/event-controls';
import PendingRequests from '@/components/pending-requests';
import PlayedSongs from '@/components/played-songs';
import RekordboxPanel from '@/components/rekordbox/rekordbox-panel';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { type Event } from '@shared/schema';
import { useEvents, useCreateEvent } from '@/hooks/use-events';
import EventCard from '@/components/event-card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Music, Calendar, CalendarPlus, CalendarX } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Function to create a new event using a dialog
function CreateEventDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [venue, setVenue] = useState('');
  const [djName, setDjName] = useState('');
  const [entryCode, setEntryCode] = useState('');
  const [requestPrice, setRequestPrice] = useState(500);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const createEventMutation = useCreateEvent();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Create a date for today at noon
    const today = new Date();
    const startTime = new Date(today);
    startTime.setHours(13, 0, 0, 0); // 1 PM
    
    // Create end time 3 hours later
    const endTime = new Date(today);
    endTime.setHours(3, 59, 0, 0); // 3:59 AM next day
    
    try {
      await createEventMutation.mutateAsync({
        name,
        venue,
        djName,
        entryCode,
        requestPrice,
        startTime,
        endTime,
        isActive: true
      });
      
      // Reset form and close dialog
      setName('');
      setVenue('');
      setDjName('');
      setEntryCode('');
      setRequestPrice(500);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to create event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-black">
          <Plus className="mr-2 h-4 w-4" /> Sukurti naują renginį
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Sukurti naują renginį</DialogTitle>
          <DialogDescription className="text-white/70">
            Įveskite naujo DJ renginio informaciją
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="max-h-[60vh] overflow-y-auto">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-white col-span-4">
                Renginio pavadinimas
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-4 bg-zinc-800 border-zinc-700 text-white"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="venue" className="text-white col-span-4">
                Vieta
              </Label>
              <Input
                id="venue"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="col-span-4 bg-zinc-800 border-zinc-700 text-white"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="djName" className="text-white col-span-4">
                DJ vardas
              </Label>
              <Input
                id="djName"
                value={djName}
                onChange={(e) => setDjName(e.target.value)}
                className="col-span-4 bg-zinc-800 border-zinc-700 text-white"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="entryCode" className="text-white col-span-4">
                Įėjimo kodas
              </Label>
              <Input
                id="entryCode"
                value={entryCode}
                onChange={(e) => setEntryCode(e.target.value)}
                className="col-span-4 bg-zinc-800 border-zinc-700 text-white"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="requestPrice" className="text-white col-span-4">
                Užsakymo kaina (centais)
              </Label>
              <Input
                id="requestPrice"
                type="number"
                value={requestPrice}
                onChange={(e) => setRequestPrice(parseInt(e.target.value, 10))}
                className="col-span-4 bg-zinc-800 border-zinc-700 text-white"
                required
                min="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90 text-black font-bold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Kuriama...
                </>
              ) : (
                "Sukurti renginį"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Component to show event dashboard
function EventDashboard({ eventId }: { eventId: number }) {
  const { data: event, isLoading } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
  });

  if (isLoading || !event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="container py-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">DJ Dashboard - {event.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Stats & Controls */}
        <div className="lg:col-span-1 space-y-6">
          <EventStats eventId={event.id} event={event} />
          <QRCodeDisplay eventId={event.id} eventName={event.name} />
          <EventControls eventId={event.id} />
        </div>
        
        {/* Right Column - Song Queue & History */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="pending" className="flex-1">Laukiantys užsakymai</TabsTrigger>
              <TabsTrigger value="history" className="flex-1">Neseniai grojusios</TabsTrigger>
              <TabsTrigger value="rekordbox" className="flex-1">Rekordbox</TabsTrigger>
            </TabsList>
            <TabsContent value="pending">
              <PendingRequests eventId={event.id} />
            </TabsContent>
            <TabsContent value="history">
              <PlayedSongs eventId={event.id} />
            </TabsContent>
            <TabsContent value="rekordbox">
              <RekordboxPanel eventId={event.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Main Dashboard component to handle both events list and single event view
export default function Dashboard() {
  const { id } = useParams<{ id?: string }>();
  
  // If id is provided, show single event dashboard
  if (id) {
    return <EventDashboard eventId={parseInt(id, 10)} />;
  }
  
  // Otherwise, show list of events
  const { data: events, isLoading } = useEvents();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Filter for future or active events
  const futureEvents = events?.filter(event => {
    const now = new Date();
    const endTime = new Date(event.endTime);
    return event.isActive || endTime > now;
  }) || [];
  
  return (
    <div className="container py-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">DJ Valdymo Skydelis</h1>
        <CreateEventDialog />
      </div>
      
      {futureEvents.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl p-12 text-center border border-zinc-800">
          <div className="mx-auto w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-6">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-white">Nėra aktyvių renginių</h2>
          <p className="text-white/70 mb-8 max-w-md mx-auto">
            Šiuo metu nėra aktyvių ar būsimų renginių. Sukurkite naują renginį, kad pradėtumėte.
          </p>
          <CreateEventDialog />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {futureEvents.map(event => (
            <EventCard 
              key={event.id} 
              event={event} 
              showEnterButton 
              translate
            />
          ))}
        </div>
      )}
    </div>
  );
}
