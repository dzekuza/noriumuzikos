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
      {/* Hero Section with Song Request Form */}
      <div className="mb-16 bg-secondary/50 rounded-2xl p-8 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="inline-block bg-primary/20 px-4 py-2 rounded-full">
              <div className="flex items-center space-x-2">
                <Headphones className="text-primary h-5 w-5" />
                <span className="text-primary font-semibold">DJ Song Request System</span>
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              Get Your Song <span className="text-primary">Played Next</span> at the Party
            </h1>
            
            <p className="text-xl text-gray-300">
              No more shouting over the music! Request your favorite songs instantly and get them played for just €5.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild
                className="bg-primary hover:bg-primary/90 text-white font-bold py-6 px-6 rounded-lg transition-all shadow-lg glow flex items-center justify-center"
              >
                <Link to="/dashboard">
                  DJ Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              {events && events.length > 1 && (
                <div className="py-2">
                  <label className="block text-gray-300 mb-2 font-medium">Select Event</label>
                  <select 
                    className="bg-background border border-gray-700 text-white rounded-lg py-3 px-4 w-full focus:outline-none focus:ring-2 focus:ring-primary"
                    value={selectedEventId || ''}
                    onChange={(e) => setSelectedEventId(Number(e.target.value))}
                  >
                    {events.map(event => (
                      <option key={event.id} value={event.id}>
                        {event.name} ({event.djName} at {event.venue})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-secondary rounded-xl shadow-2xl overflow-hidden">
            {selectedEventId ? (
              <SongRequestForm eventId={selectedEventId} />
            ) : (
              <div className="p-8 text-center">
                <h3 className="text-xl font-semibold text-gray-300 mb-4">No Active Events</h3>
                <p className="text-gray-400">There are no DJ events currently available for song requests.</p>
              </div>
            )}
          </div>
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
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      <Link to={`/event/${event.id}/request`}>
                        Request Song
                      </Link>
                    </Button>
                    <Button 
                      asChild
                      variant="secondary" 
                      className="flex-1"
                    >
                      <Link to="/dashboard">
                        DJ Dashboard
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
