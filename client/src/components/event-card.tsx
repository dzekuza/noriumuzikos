import { QrCode } from 'lucide-react';
import { type Event } from '@shared/schema';
import { generateEventQrCodeUrl } from '@/lib/qr-generator';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <div className="mb-8 bg-secondary rounded-xl p-6 shadow-lg">
      <div className="flex items-center">
        <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center mr-4">
          <Music className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{event.name}</h2>
          <p className="text-accent">{event.djName} <span className="text-gray-400">• {event.venue}</span></p>
        </div>
      </div>
      
      <div className="mt-4 flex items-center">
        <div className="bg-background p-3 rounded-lg inline-flex items-center mr-3">
          <QrCode className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm text-gray-300">Share this QR code with your friends!</p>
          <p className="text-xs text-gray-400">Scan to request songs at this event</p>
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
