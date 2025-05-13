import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import ProfileSettings from "@/components/profile-settings";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Redirect if not logged in
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  return (
    <div className="min-h-screen bg-black pb-12">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button asChild variant="outline" className="bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700">
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" /> Grįžti į valdymo skydelį
            </Link>
          </Button>
        </div>
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Profilio nustatymai</h1>
          <p className="text-white/70 mt-2">Atnaujinkite savo prisijungimo duomenis</p>
        </div>
        
        <ProfileSettings />
      </div>
    </div>
  );
}