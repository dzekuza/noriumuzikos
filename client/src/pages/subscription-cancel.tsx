import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function SubscriptionCancelPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Užsakymas Atšauktas</CardTitle>
          <CardDescription className="text-center">
            Prenumeratos procesas buvo atšauktas
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <XCircle className="h-24 w-24 text-destructive mb-4" />
          <p className="text-center mb-4">
            Jūs atšaukėte prenumeratos procesą. Jokie mokesčiai nebuvo nuskaityti nuo jūsų sąskaitos.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => setLocation("/dashboard")}
          >
            Grįžti į Valdymo Skydelį
          </Button>
          <Button 
            className="w-full" 
            onClick={() => setLocation("/subscription")}
          >
            Bandyti dar kartą
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}