import { QrCode, ArrowRight, Calendar, CalendarCheck, CalendarOff } from 'lucide-react';
import { type Event } from '@shared/schema';
import { generateEventQrCodeUrl } from '@/lib/qr-generator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';

interface EventCardProps {
  event: Event;
  showEnterButton?: boolean;
  translate?: boolean;
}

export default function EventCard({ event, showEnterButton = false, translate = false }: EventCardProps) {
  // Determine event status
  const now = new Date();
  const startTime = new Date(event.startTime);
  const endTime = new Date(event.endTime);
  
  let status: 'active' | 'planned' | 'ended';
  
  if (!event.isActive && endTime < now) {
    status = 'ended';
  } else if (event.isActive && startTime <= now && endTime >= now) {
    status = 'active';
  } else {
    status = 'planned';
  }
  return (
    <div className="mb-8 bg-secondary rounded-xl p-6 shadow-lg">
      <div className="flex items-center">
        <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center mr-4">
          <Music className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold text-white">{event.name}</h2>
            {status === 'active' && (
              <Badge variant="default" className="ml-2 bg-green-600 hover:bg-green-700">
                <CalendarCheck className="h-3 w-3 mr-1" />
                {translate ? 'Aktyvus' : 'Active'}
              </Badge>
            )}
            {status === 'planned' && (
              <Badge variant="default" className="ml-2 bg-blue-600 hover:bg-blue-700">
                <Calendar className="h-3 w-3 mr-1" />
                {translate ? 'Planuojamas' : 'Planned'}
              </Badge>
            )}
            {status === 'ended' && (
              <Badge variant="default" className="ml-2 bg-zinc-600 hover:bg-zinc-700">
                <CalendarOff className="h-3 w-3 mr-1" />
                {translate ? 'Baigtas' : 'Ended'}
              </Badge>
            )}
          </div>
          <p className="text-accent">{event.djName} <span className="text-gray-400">• {event.venue}</span></p>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-background p-3 rounded-lg inline-flex items-center mr-3">
            <QrCode className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-gray-300">{translate ? 'Pasidalinkite šiuo QR kodu!' : 'Share this QR code with your friends!'}</p>
            <p className="text-xs text-gray-400">{translate ? 'Nuskenuokite, norėdami užsakyti dainas' : 'Scan to request songs at this event'}</p>
          </div>
        </div>
        
        {showEnterButton && (
          <Button 
            asChild
            variant="secondary"
            className="ml-4 bg-primary hover:bg-primary/90 text-black"
          >
            <Link to={`/dashboard/${event.id}`}>
              {translate ? 'Atidaryti' : 'Open'} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

function Music(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}
