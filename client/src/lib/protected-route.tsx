import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
  requireSubscription = true,
}: {
  path: string;
  component: () => React.JSX.Element;
  requireSubscription?: boolean;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // If subscription is required and user isn't subscribed,
  // redirect to subscription page unless we're already there
  if (requireSubscription && 
      !user.isSubscribed && 
      !path.startsWith("/subscription")) {
    return (
      <Route path={path}>
        <Redirect to="/subscription" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
