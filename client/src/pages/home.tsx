import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Music, ListMusic, Users, Headphones, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Event } from "@shared/schema";
import SongRequestForm from "@/components/song-request-form";
import { useState } from "react";

export default function Home() {
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Select the first event by default if available
  if (events && events.length > 0 && selectedEventId === null) {
    setSelectedEventId(events[0].id);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      {/* Hero Section with Song Request Form - Minimalist Dark Design */}
      <div className="container px-4 max-w-6xl mx-auto py-16">
        <div className="text-center">
          <div className="text-xs text-white/70 uppercase tracking-widest mb-4">Request song</div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-8">
            Get your song played<br />
            <span className="text-white/90">without asking</span>
          </h1>
          
          <p className="text-xl text-white/70 max-w-2xl mx-auto mb-10">
            Request your favorite song and lets dance together
          </p>
          
          {events && events.length > 0 ? (
            <Button 
              asChild
              className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-4 px-10 rounded-md text-lg"
            >
              {selectedEventId ? (
                <Link to={`/event/${selectedEventId}/request`}>Join session now</Link>
              ) : (
                <Link to={`/event/${events[0].id}/request`}>Join session now</Link>
              )}
            </Button>
          ) : (
            <div className="bg-zinc-900/70 rounded-md p-6 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-white mb-2">No active sessions</h3>
              <p className="text-white/60 mb-3">There are no DJ events currently available</p>
            </div>
          )}
        </div>
        
        {events && events.length > 1 && (
          <div className="bg-zinc-900/70 rounded-lg p-8 max-w-md mx-auto mt-12">
            <h2 className="text-xl font-semibold text-white mb-4">Session ID</h2>
            <p className="text-white/60 text-sm mb-6">Enter event ID to join session</p>
            
            <select 
              className="bg-zinc-800 text-white rounded-md py-3 px-4 w-full mb-5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={selectedEventId || ''}
              onChange={(e) => setSelectedEventId(Number(e.target.value))}
            >
              {events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.name} ({event.djName})
                </option>
              ))}
            </select>
            
            <Button 
              asChild
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-3 px-4 rounded-md"
            >
              <Link to={selectedEventId ? `/event/${selectedEventId}/request` : '#'}>Join session now</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
