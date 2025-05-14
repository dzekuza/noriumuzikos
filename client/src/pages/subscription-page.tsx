import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SubscriptionPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  useEffect(() => {
    // If user is not logged in, redirect to login page
    if (!isLoading && !user) {
      setLocation("/auth");
      return;
    }
    
    // Fetch subscription status
    const fetchSubscription = async () => {
      setIsSubscriptionLoading(true);
      try {
        const res = await apiRequest("GET", "/api/subscription");
        if (res.ok) {
          const data = await res.json();
          setSubscriptionStatus(data.isSubscribed ? "active" : "inactive");
        }
      } catch (error) {
        console.error("Error fetching subscription status:", error);
      } finally {
        setIsSubscriptionLoading(false);
      }
    };
    
    if (user) {
      fetchSubscription();
    }
  }, [user, isLoading, setLocation]);

  const handleSubscribe = async () => {
    setIsCheckoutLoading(true);
    try {
      const res = await apiRequest("POST", "/api/subscription/checkout");
      
      if (res.ok) {
        const data = await res.json();
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        const error = await res.json();
        toast({
          title: "Subscription Error",
          description: error.message || "Failed to initiate subscription",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      toast({
        title: "Subscription Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    setLocation("/");
  };

  if (isLoading || isSubscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">NoriuMuzikos Prenumerata</CardTitle>
          <CardDescription>
            Užsisakykite prenumeratą, kad gautumėte prieigą prie DJ renginių valdymo platformos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-secondary/20 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Premium DJ Planas</h3>
              <p className="text-3xl font-bold mb-4">
                €10<span className="text-sm font-normal text-muted-foreground"> / mėnesiui</span>
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                  Kurkite neribotą kiekį renginių
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                  Rinkite dainų užsakymus su mokėjimais
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                  Realaus laiko valdymo skydelis su analitika
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                  QR kodo dalinimasis renginiams
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                  Individuali užsakymų kainodara
                </li>
              </ul>
            </div>

            {subscriptionStatus === "active" ? (
              <div className="flex items-center justify-center bg-green-500/10 p-4 rounded-lg">
                <CheckCircle className="mr-2 h-6 w-6 text-green-500" />
                <span className="font-medium">Jūsų prenumerata yra aktyvi</span>
              </div>
            ) : (
              <div className="flex items-center justify-center bg-destructive/10 p-4 rounded-lg">
                <XCircle className="mr-2 h-6 w-6 text-destructive" />
                <span className="font-medium">Jūs neturite aktyvios prenumeratos</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4">
          {subscriptionStatus === "active" ? (
            <Button className="w-full" onClick={handleGoToDashboard}>
              Eiti į Valdymo Skydelį
            </Button>
          ) : (
            <Button 
              className="w-full" 
              onClick={handleSubscribe} 
              disabled={isCheckoutLoading}
            >
              {isCheckoutLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Apdorojama...
                </>
              ) : (
                <>Užsisakyti Dabar</>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}