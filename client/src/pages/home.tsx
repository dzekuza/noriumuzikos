import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { type Event } from "@shared/schema";

export default function Home() {
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      {/* Hero Section with Song Request Form - Minimalist Dark Design */}
      <div className="container px-4 max-w-6xl mx-auto py-16">
        <div className="text-center">
          <div className="text-xs text-white/70 uppercase tracking-widest mb-4">Užsakyti dainą</div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-8">
            Išgirsk savo dainą<br />
            <span className="text-white/90">be prašymo</span>
          </h1>
          
          <p className="text-xl text-white/70 max-w-2xl mx-auto mb-10">
            Užsakyk savo mėgstamiausią dainą ir šokime kartu
          </p>
          
          {events && events.length > 0 ? (
            <Button 
              asChild
              className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-4 px-10 rounded-md text-lg"
            >
              <Link to="/event-entry">Prisijungti dabar</Link>
            </Button>
          ) : (
            <div className="bg-zinc-900/70 rounded-md p-6 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-white mb-2">Nėra aktyvių sesijų</h3>
              <p className="text-white/60 mb-3">Šiuo metu nėra aktyvių DJ renginių</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
