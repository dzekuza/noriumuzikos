import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Check, Music, ChevronRight, Home } from 'lucide-react';

export default function ThankYouPage() {
  const [, setLocation] = useLocation();
  const [eventId, setEventId] = useState<string | null>(null);
  
  // Extract eventId from URL or localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('eventId');
    if (id) {
      setEventId(id);
      localStorage.setItem('lastEventId', id);
    } else {
      // Fallback to last used event id
      setEventId(localStorage.getItem('lastEventId'));
    }
  }, []);
  
  const handleRequestAnother = () => {
    if (eventId) {
      setLocation(`/event/${eventId}/request`);
    } else {
      setLocation('/');
    }
  };
  
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 rounded-md border border-zinc-800 shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="h-20 w-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Check className="h-10 w-10 text-primary" />
          </div>
          
          <h1 className="text-3xl font-bold text-center text-white mb-2">Ačiū!</h1>
          
          <div className="bg-zinc-800/50 rounded-md p-6 mb-6 border border-zinc-700">
            <p className="text-center text-white/70 mb-4">
              Jūsų dainos užsakymas gautas ir bus sugrojamas kuo greičiau.
            </p>
            
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Music className="h-5 w-5 text-primary" />
              <span className="text-white">DJ buvo informuotas</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={handleRequestAnother}
              className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-4 px-4 rounded-md transition-all flex items-center justify-center"
            >
              Užsakyti kitą dainą
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              onClick={() => setLocation('/')}
              variant="outline"
              className="w-full border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-4 px-4 rounded-md transition-all flex items-center justify-center"
            >
              Grįžti į pradžią
              <Home className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
