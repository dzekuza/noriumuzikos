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
  
  // Handle entry code verification
  const handleVerifyCode = () => {
    if (entryCode.trim() === '') {
      setVerificationError('Please enter the event code');
      return;
    }
    
    if (entryCode === event.entryCode) {
      setIsVerified(true);
      setVerificationError('');
      // Store verification in localStorage
      localStorage.setItem(`event-verified-${eventId}`, 'true');
    } else {
      setVerificationError('Incorrect event code. Please try again.');
    }
  };
  
  // If not verified yet, show the entry code verification form
  if (!isVerified) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center overflow-hidden p-4">
        <Card className="max-w-md w-full bg-zinc-900 border-zinc-800 text-white shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Lock className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Reikalingas prieigos kodas</CardTitle>
            <CardDescription className="text-white/70">
              Įveskite renginio kodą, kad galėtumėte užsakyti dainas "{event.name}" vietoje {event.venue}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="entry-code" className="text-white/70">Renginio kodas</Label>
                <Input
                  id="entry-code"
                  placeholder="Įveskite DJ pateikimą kodą"
                  value={entryCode}
                  onChange={(e) => setEntryCode(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleVerifyCode();
                    }
                  }}
                />
                {verificationError && (
                  <p className="text-sm text-red-500">{verificationError}</p>
                )}
              </div>
              <Button 
                onClick={handleVerifyCode}
                className="w-full bg-primary hover:bg-primary/90 text-black font-semibold"
              >
                Prieiti prie renginio
              </Button>
            </div>
            
            <div className="mt-8 border-t border-zinc-800 pt-6 text-center">
              <div className="flex justify-center mb-3">
                <Music className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm text-white/70">
                Užsakykite mėgstamiausias dainas ir jos bus įtrauktos į DJ grojaraštį!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // After verification, show the song request form
  return (
    <div className="min-h-screen bg-zinc-950 overflow-hidden">
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="text-xs text-white/70 uppercase tracking-widest mb-1">Renginys</div>
            <h1 className="text-xl font-bold text-white">{event.name}</h1>
          </div>
          <Button
            variant="outline"
            className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700"
            onClick={() => {
              // Clear verification and return to verification screen
              localStorage.removeItem(`event-verified-${eventId}`);
              setIsVerified(false);
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
