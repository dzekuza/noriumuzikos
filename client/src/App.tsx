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
import Header from "./components/layout/header";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <ProtectedRoute path="/dashboard" component={Dashboard} />
          <ProtectedRoute path="/dashboard/:id" component={Dashboard} />
          <Route path="/auth" component={AuthPage} />
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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
