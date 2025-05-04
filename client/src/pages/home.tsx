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
    <div className="container py-10 mx-auto">
      {/* Hero Section with Song Request Form - Minimalist Dark Design */}
      <div className="mb-16 min-h-[85vh] flex flex-col justify-center items-center text-center bg-black py-16">
        <div className="container px-4 max-w-6xl mx-auto">
          <div className="mb-12">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Card className="bg-secondary border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-xl">
              <Music className="mr-2 text-primary" size={24} />
              Request Songs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              Easily request your favorite songs by scanning a QR code for your DJ event
            </p>
          </CardContent>
        </Card>

        <Card className="bg-secondary border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-xl">
              <ListMusic className="mr-2 text-primary" size={24} />
              DJ Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              DJs can manage song requests, track payments, and maintain the song queue
            </p>
          </CardContent>
        </Card>

        <Card className="bg-secondary border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-xl">
              <Users className="mr-2 text-primary" size={24} />
              Connect with Party-goers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              Create a more interactive experience between DJs and the audience
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Active DJ Events</h2>
        
        {events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <Card key={event.id} className="bg-secondary border-none shadow-lg overflow-hidden">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{event.name}</h3>
                  <p className="text-accent mb-1">{event.djName}</p>
                  <p className="text-gray-400 mb-4">{event.venue}</p>
                  
                  <div className="flex space-x-3 mt-4">
                    <Button 
                      asChild
                      variant="default" 
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      <Link to={`/event/${event.id}/request`}>
                        Request Song
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-secondary rounded-lg">
            <h3 className="text-xl font-semibold text-gray-400">No Active Events</h3>
            <p className="text-gray-500 mt-2">There are no DJ events currently active.</p>
          </div>
        )}
      </div>
    </div>
  );
}
