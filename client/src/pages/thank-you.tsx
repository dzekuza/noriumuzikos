import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Check, Music, ChevronRight } from 'lucide-react';

export default function ThankYouPage() {
  const [timeLeft, setTimeLeft] = useState(5);
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
  
  // Auto-redirect countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      // Redirect to request page for same event
      if (eventId) {
        setLocation(`/event/${eventId}/request`);
      } else {
        setLocation('/');
      }
      return;
    }
    
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft, setLocation, eventId]);
  
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
          
          <h1 className="text-3xl font-bold text-center text-white mb-2">Thank You!</h1>
          
          <div className="bg-zinc-800/50 rounded-md p-6 mb-6 border border-zinc-700">
            <p className="text-center text-white/70 mb-4">
              Your song request has been received and will be played as soon as possible.
            </p>
            
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Music className="h-5 w-5 text-primary" />
              <span className="text-white">The DJ has been notified</span>
            </div>
            
            <div className="w-full bg-zinc-700 h-2 rounded-full overflow-hidden mb-2">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-300" 
                style={{ width: `${(timeLeft / 5) * 100}%` }}
              />
            </div>
            
            <p className="text-xs text-center text-white/50">
              Redirecting in {timeLeft} seconds...
            </p>
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={handleRequestAnother}
              className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-4 px-4 rounded-md transition-all flex items-center justify-center"
            >
              Request Another Song
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
