import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { type Event } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SongRequestForm from '@/components/song-request-form';
import RecentSongs from '@/components/recent-songs';
import { Lock, Music } from 'lucide-react';

export default function RequestPage() {
  const { id } = useParams<{ id: string }>();
  const eventId = parseInt(id);
  const [, setLocation] = useLocation();
  
  // State for the entry code verification
  const [entryCode, setEntryCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  
  // Check if we have a stored verification for this event
  useEffect(() => {
    const storedVerification = localStorage.getItem(`event-verified-${eventId}`);
    if (storedVerification === 'true') {
      setIsVerified(true);
    }
  }, [eventId]);
  
  const { data: event, isLoading, error } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (error || !event) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Renginys Nerastas</CardTitle>
            <CardDescription className="text-white/70">
              DJ renginys, kurio ieškote, neegzistuoja arba jau pasibaigęs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setLocation('/')} 
              className="mt-2 bg-primary text-black font-semibold hover:bg-primary/90"
            >
              Grįžti į pradžią
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Check if the event is active
  if (!event.isActive) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Renginys Pasibaigės</CardTitle>
            <CardDescription className="text-white/70">
              DJ renginys "{event.name}" jau pasibaigęs ir nebepriima dainų užsakymų.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setLocation('/')} 
              className="mt-2 bg-primary text-black font-semibold hover:bg-primary/90"
            >
              Grįžti į pradžią
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // We don't need the second useEffect that was causing React Error #310
  // The first useEffect on lines 24-29 already handles loading the verification from localStorage
  // We're already automatically verified from event-entry.tsx setting the localStorage item
  
  // After verification, show the song request form
  return (
    <div className="min-h-screen bg-zinc-950 overflow-hidden">
      <div className="container mx-auto py-2 sm:py-6 px-2 sm:px-4">
        <div className="flex flex-wrap sm:flex-nowrap justify-between items-center mb-4 sm:mb-6">
          <div className="w-full sm:w-auto mb-2 sm:mb-0">
            <div className="text-xs text-white/70 uppercase tracking-widest mb-1">Renginys</div>
            <h1 className="text-xl font-bold text-white truncate">{event.name}</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700 w-full sm:w-auto mt-1 sm:mt-0"
            onClick={() => {
              // Clear verification and return to event entry page
              localStorage.removeItem(`event-verified-${eventId}`);
              setLocation('/event-entry');
            }}
          >
            Keisti renginį
          </Button>
        </div>

        <SongRequestForm eventId={event.id} />
        
        <div className="mt-12">
          <RecentSongs eventId={event.id} />
        </div>
      </div>
    </div>
  );
}
