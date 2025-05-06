import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function EventEntry() {
  const [entryCode, setEntryCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Check if we have an event name in the URL
  const [matchEventName, params] = useRoute<{ eventName: string }>('/event-entry/:eventName');
  const eventName = matchEventName ? params.eventName : null;
  
  useEffect(() => {
    // Update the page title if we have an event name
    if (eventName) {
      // Convert hyphenated URL format back to readable name
      const formattedName = decodeURIComponent(eventName).replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      document.title = `${formattedName} | NoriuMuzikos`;
    }
  }, [eventName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryCode.trim()) {
      toast({
        title: "Klaida",
        description: "Prašome įvesti renginio kodą",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/events/entry", { entryCode });
      const data = await response.json();
      
      if (response.ok) {
        // Store verification in localStorage so we don't need to ask again
        localStorage.setItem(`event-verified-${data.eventId}`, 'true');
        setLocation(`/event/${data.eventId}/request`);
      } else {
        toast({
          title: "Klaida",
          description: data.message || "Neteisingas renginio kodas",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Klaida",
        description: "Serverio klaida. Bandykite vėliau.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="container px-4 max-w-md mx-auto py-16">
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-center text-white">
              Prisijunkite prie renginio
              {eventName && (
                <span className="block mt-1 text-cyan-500">
                  "{decodeURIComponent(eventName).replace(/-/g, ' ')}"
                </span>
              )}
            </CardTitle>
            <p className="text-center text-white/70 mt-2">Įveskite renginio kodą norint užsisakyti dainą.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Įveskite renginio kodą"
                  value={entryCode}
                  onChange={(e) => setEntryCode(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full mr-2"></div>
                    Tikrinama...
                  </div>
                ) : (
                  "Prisijungti prie renginio"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
