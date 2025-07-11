import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import RequestPage from "@/pages/request";
import ThankYouPage from "@/pages/thank-you";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import ProfilePage from "@/pages/profile";
import EventEntry from "@/pages/event-entry";
import SubscriptionPage from "@/pages/subscription-page";
import SubscriptionSuccessPage from "@/pages/subscription-success";
import SubscriptionCancelPage from "@/pages/subscription-cancel";
import AdminDashboard from "@/pages/admin-dashboard";
import Header from "./components/layout/header";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import ErrorBoundary from "@/components/error-boundary";

function Router() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <ProtectedRoute path="/dashboard" component={Dashboard} requireSubscription={true} />
          <ProtectedRoute path="/dashboard/:id" component={Dashboard} requireSubscription={true} />
          <ProtectedRoute path="/profile" component={ProfilePage} requireSubscription={false} />
          <ProtectedRoute path="/subscription" component={SubscriptionPage} requireSubscription={false} />
          <ProtectedRoute path="/subscription/success" component={SubscriptionSuccessPage} requireSubscription={false} />
          <ProtectedRoute path="/subscription/cancel" component={SubscriptionCancelPage} requireSubscription={false} />
          <ProtectedRoute path="/admin" component={AdminDashboard} requireSubscription={false} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/event-entry" component={EventEntry} />
          <Route path="/event-entry/:eventName" component={EventEntry} />
          <Route path="/event/:id/request" component={RequestPage} />
          <Route path="/thank-you" component={ThankYouPage} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
