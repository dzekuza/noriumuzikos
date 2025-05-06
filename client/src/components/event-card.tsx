import { QrCode, ArrowRight, Calendar, CalendarCheck, CalendarOff, Trash2 } from 'lucide-react';
import { type Event } from '@shared/schema';
import { generateEventQrCodeUrl } from '@/lib/qr-generator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';

interface EventCardProps {
  event: Event;
  showEnterButton?: boolean;
  showDeleteButton?: boolean;
  onDelete?: (id: number) => void;
  translate?: boolean;
}

export default function EventCard({ 
  event, 
  showEnterButton = false, 
  showDeleteButton = false,
  onDelete,
  translate = false 
}: EventCardProps) {
  // Determine event status
  const now = new Date();
  const startTime = new Date(event.startTime);
  const endTime = new Date(event.endTime);
  
  let status: 'active' | 'planned' | 'ended';
  
  if (!event.isActive) {
    // If event is marked as inactive, it's ended
    status = 'ended';
  } else if (startTime > now) {
    // If start time is in the future, it's planned
    status = 'planned';
  } else if (endTime < now) {
    // If end time is in the past, it's ended
    status = 'ended';
  } else {
    // Otherwise it's active (current time is between start and end)
    status = 'active';
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
          <p className="text-accent">{event.venue}</p>
          <p className="text-sm text-gray-400 mt-1">
            {new Intl.DateTimeFormat('lt-LT', { 
              year: 'numeric', 
              month: '2-digit', 
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }).format(new Date(event.startTime))}
          </p>
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
        
        <div className="flex items-center space-x-2">
          {showDeleteButton && onDelete && (
            <Button 
              variant="destructive"
              size="sm"
              className="bg-red-600 hover:bg-red-700"
              onClick={() => onDelete(event.id)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">{translate ? 'Ištrinti' : 'Delete'}</span>
            </Button>
          )}
          
          {showEnterButton && (
            <Button 
              asChild
              variant="secondary"
              className="bg-primary hover:bg-primary/90 text-black"
            >
              <Link to={`/dashboard/${event.id}`}>
                {translate ? 'Atidaryti' : 'Open'} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
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
