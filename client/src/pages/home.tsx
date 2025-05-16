import { Link } from "wouter";
import { Button } from "@/components/ui/button";
// Import images directly from the assets folder
import heroOverlay from "../assets/herooverlay.png";
import group14Image from "../assets/Group 14.png";
import { Music, QrCode, CreditCard, Calendar, Users, History, BarChart4, Phone, Globe, Lock } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center relative">
      {/* Hero Section */}
      <section className="w-full min-h-screen flex flex-col items-center justify-center relative">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full z-0">
          <img 
            src={heroOverlay} 
            alt="Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        
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
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-zinc-900 py-20">
        <div className="container px-4 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Pagrindinės funkcijos</h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">Inovatyvi sistema, sukurta palengvinti muzikos užsakymą renginiuose ir vakarėliuose</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-zinc-800 rounded-xl p-6 transition-all hover:bg-zinc-800/80 hover:translate-y-[-4px]">
              <div className="bg-primary/20 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <QrCode className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">QR Kodas</h3>
              <p className="text-white/70">Lengvas prisijungimas prie renginio naudojant QR kodą ar įvedimo kodą</p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-zinc-800 rounded-xl p-6 transition-all hover:bg-zinc-800/80 hover:translate-y-[-4px]">
              <div className="bg-primary/20 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <Music className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Muzikos užsakymas</h3>
              <p className="text-white/70">Patogus dainų užsakymas ir asmeninių palinkėjimų pridėjimas</p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-zinc-800 rounded-xl p-6 transition-all hover:bg-zinc-800/80 hover:translate-y-[-4px]">
              <div className="bg-primary/20 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Saugūs mokėjimai</h3>
              <p className="text-white/70">Integruota mokėjimo sistema su pirmu nemokamu užsakymu</p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-zinc-800 rounded-xl p-6 transition-all hover:bg-zinc-800/80 hover:translate-y-[-4px]">
              <div className="bg-primary/20 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Renginių valdymas</h3>
              <p className="text-white/70">DJ gali kurti ir valdyti renginius su individualiais nustatymais</p>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-zinc-800 rounded-xl p-6 transition-all hover:bg-zinc-800/80 hover:translate-y-[-4px]">
              <div className="bg-primary/20 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <History className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Rekordbox integracija</h3>
              <p className="text-white/70">Realaus laiko integracija su Rekordbox grojamais kūriniais</p>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-zinc-800 rounded-xl p-6 transition-all hover:bg-zinc-800/80 hover:translate-y-[-4px]">
              <div className="bg-primary/20 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <BarChart4 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Statistika</h3>
              <p className="text-white/70">Išsami renginių ir užsakymų statistika DJ valdymo skydelyje</p>
            </div>
          </div>
        </div>
      </section>

      {/* DJ Section */}
      <section className="w-full bg-zinc-800 py-20">
        <div className="container px-4 max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <div className="text-white/70 uppercase tracking-widest mb-4">DJ Platforma</div>
              <h2 className="text-4xl font-bold text-white mb-6">Viskas, ko reikia DJ</h2>
              <p className="text-lg text-white/70 mb-8">
                NoriuMuzikos siūlo išsamią valdymo sistemą DJ, leidžiančią efektyviai administruoti renginius ir dainų užsakymus
              </p>
              
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-primary/20 p-2 rounded-lg mr-4 mt-1">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Renginių valdymas</h3>
                    <p className="text-white/70">Kurkite, redaguokite ir valdykite renginius su individualia kainodara</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="bg-primary/20 p-2 rounded-lg mr-4 mt-1">
                    <QrCode className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">QR kodų generavimas</h3>
                    <p className="text-white/70">Automatinis QR kodų generavimas dalinimui su dalyviais</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="bg-primary/20 p-2 rounded-lg mr-4 mt-1">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Užsakymų valdymas</h3>
                    <p className="text-white/70">Patvirtinkite, atmeskite ir valdykite dainų užsakymus realiu laiku</p>
                  </div>
                </li>
              </ul>
              
              <Button 
                asChild
                className="bg-primary hover:bg-primary/90 text-black font-bold py-3 px-8 rounded-md text-base mt-8"
              >
                <Link to="/auth">Tapti DJ</Link>
              </Button>
            </div>
            
            <div className="lg:w-1/2">
              <div className="bg-zinc-900 rounded-xl p-8 shadow-xl">
                <img 
                  src={group14Image} 
                  alt="DJ Dashboard" 
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Friendly Section */}
      <section className="w-full bg-zinc-900 py-20">
        <div className="container px-4 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Patogumas visur</h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">Optimizuota patirtis bet kokiame įrenginyje</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="bg-primary/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Phone className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Mobili versija</h3>
              <p className="text-white/70">Tobulai pritaikyta mobiliesiems įrenginiams patirtis</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Lietuvių kalba</h3>
              <p className="text-white/70">Pilna lietuvių kalbos palaikymas vartotojo patirčiai pagerinti</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Saugumas</h3>
              <p className="text-white/70">Saugus autentifikavimas ir duomenų apsauga</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-zinc-800 py-20">
        <div className="container px-4 max-w-6xl mx-auto">
          <div className="bg-primary/10 rounded-2xl p-10 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Pradėk naudotis jau dabar</h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
              Prisijunk prie NoriuMuzikos ir pakylėk savo renginius į kitą lygį
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                asChild
                className="bg-primary hover:bg-primary/90 text-black font-bold py-3 px-8 rounded-md text-base"
              >
                <Link to="/event-entry">Užsakyti dainą</Link>
              </Button>
              
              <Button 
                asChild
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 font-bold py-3 px-8 rounded-md text-base"
              >
                <Link to="/auth">DJ Registracija</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-zinc-900 py-10">
        <div className="container px-4 max-w-6xl mx-auto text-center">
          <p className="text-white/50">© {new Date().getFullYear()} NoriuMuzikos. Visos teisės saugomos.</p>
        </div>
      </footer>
    </div>
  );
}
