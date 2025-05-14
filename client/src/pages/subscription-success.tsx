import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";

export default function SubscriptionSuccessPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(true);

  useEffect(() => {
    // Refresh user data to get updated subscription status
    const refreshUserData = async () => {
      try {
        await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        setIsRefreshing(false);
      } catch (error) {
        console.error("Error refreshing user data:", error);
        setIsRefreshing(false);
      }
    };
    
    refreshUserData();
  }, []);

  if (isRefreshing) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[80vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg">Atnaujinama prenumeratos būsena...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Užsakymas Sėkmingas!</CardTitle>
          <CardDescription className="text-center">
            Ačiū už prenumeratą NoriuMuzikos platformoje
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <CheckCircle className="h-24 w-24 text-green-500 mb-4" />
          <p className="text-center mb-4">
            Jūsų prenumerata sėkmingai aktyvuota. Dabar turite prieigą prie visų platformos funkcijų.
          </p>
          {user?.isSubscribed ? (
            <p className="text-center font-semibold text-green-500">
              Jūsų paskyra aktyvuota!
            </p>
          ) : (
            <p className="text-center text-yellow-500">
              Jūsų prenumerata aktyvuojama. Tai gali užtrukti kelias minutes.
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => setLocation("/dashboard")}>
            Eiti į Valdymo Skydelį
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}