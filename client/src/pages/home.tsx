import { Link } from "wouter";
import { Button } from "@/components/ui/button";
// Use the proper path aliases for the asset imports
import heroOverlay from "@/assets/herooverlay.png";
import group14Image from "@/assets/Group 14.png";

export default function Home() {

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full z-0">
        <img 
          src={heroOverlay} 
          alt="Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>
      
      {/* Hero Section with Song Request Form - Minimalist Dark Design */}
      <div className="container px-4 max-w-6xl mx-auto py-16 relative z-10">
        <div className="text-center">
          <div className="text-xs text-white/70 uppercase tracking-widest mb-4">Užsakyti dainą</div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-8">
            Užsisakyk sau dainą<br />
            <span className="text-white/90">vienu paspaudimu</span>
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto mb-10 mt-12 text-center">
            <div className="bg-zinc-900/70 rounded-lg p-6">
              <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-black">1</span>
              </div>
              <p className="text-lg text-white/90">Spausk "Prisijungti"</p>
            </div>
            
            <div className="bg-zinc-900/70 rounded-lg p-6">
              <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-black">2</span>
              </div>
              <p className="text-lg text-white/90">Įvesk kodą</p>
            </div>
            
            <div className="bg-zinc-900/70 rounded-lg p-6">
              <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-black">3</span>
              </div>
              <p className="text-lg text-white/90">Užsisakyk dainą</p>
            </div>
          </div>
          
          <Button 
            asChild
            className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-4 px-10 rounded-md text-lg"
          >
            <Link to="/event-entry">Prisijungti dabar</Link>
          </Button>
          
          {/* Group 14 image below the button */}
          <div className="mt-16 max-w-md mx-auto">
            <img 
              src={group14Image} 
              alt="DJ Setup" 
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
