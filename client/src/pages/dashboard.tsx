import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventStats from '@/components/event-stats';
import QRCodeDisplay from '@/components/qr-code-display';
import EventControls from '@/components/event-controls';
import PendingRequests from '@/components/pending-requests';
import PlayedSongs from '@/components/played-songs';
import RekordboxPanel from '@/components/rekordbox/rekordbox-panel';
import { useQuery } from '@tanstack/react-query';
import { type Event } from '@shared/schema';

export default function Dashboard() {
  // In a real app, we would get the event ID from a login/selection page
  // For now, we'll use the demo event with ID 1
  const eventId = 1;
  
  const { data: event, isLoading } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
  });

  if (isLoading || !event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container py-6 mx-auto">
      <h1 className="text-3xl font-bold mb-6">DJ Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Stats & Controls */}
        <div className="lg:col-span-1 space-y-6">
          <EventStats eventId={event.id} event={event} />
          <QRCodeDisplay eventId={event.id} eventName={event.name} />
          <EventControls eventId={event.id} />
        </div>
        
        {/* Right Column - Song Queue & History */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="pending" className="flex-1">Pending Requests</TabsTrigger>
              <TabsTrigger value="history" className="flex-1">Recently Played</TabsTrigger>
              <TabsTrigger value="rekordbox" className="flex-1">Rekordbox</TabsTrigger>
            </TabsList>
            <TabsContent value="pending">
              <PendingRequests eventId={event.id} />
            </TabsContent>
            <TabsContent value="history">
              <PlayedSongs eventId={event.id} />
            </TabsContent>
            <TabsContent value="rekordbox">
              <RekordboxPanel eventId={event.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
