import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function SubscriptionSuccessPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // You could update user data here if needed
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Subscription Successful!</CardTitle>
          <CardDescription className="text-center">
            Thank you for subscribing to NoriuMuzikos
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <CheckCircle className="h-24 w-24 text-green-500 mb-4" />
          <p className="text-center mb-4">
            Your subscription has been successfully activated. You now have full access to all features.
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => setLocation("/")}>
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}