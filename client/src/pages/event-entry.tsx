import { useState } from "react";
import { useLocation } from "wouter";
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
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="container px-4 max-w-md mx-auto py-16">
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-center text-white">Prisijungti prie renginio</CardTitle>
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
                  "Prisijungti"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
