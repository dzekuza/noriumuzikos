import { Link } from "wouter";
import { Button } from "@/components/ui/button";
// Import images directly from the assets folder
import heroOverlay from "../assets/herooverlay.png";
import group14Image from "../assets/Group 14.png";
import { Music, QrCode, CreditCard, Calendar, Users, History, BarChart4, Phone, Globe, Lock } from "lucide-react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

export default function Home() {
  // Refs for scroll animations
  const featuresRef = useRef(null);
  const djSectionRef = useRef(null);
  const mobileSectionRef = useRef(null);
  const ctaSectionRef = useRef(null);
  
  // Check if sections are in view
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.3 });
  const djSectionInView = useInView(djSectionRef, { once: true, amount: 0.3 });
  const mobileSectionInView = useInView(mobileSectionRef, { once: true, amount: 0.3 });
  const ctaSectionInView = useInView(ctaSectionRef, { once: true, amount: 0.5 });
  
  // Scroll animations
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.98]);
  
  // Staggered card animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };
  
  // Step card animation variants
  const stepCardVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: (custom: number) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: custom * 0.2,
        type: "spring",
        stiffness: 100
      }
    })
  };
  
  return (
    <div className="flex flex-col items-center justify-center relative">
      {/* Hero Section */}
      <section className="w-full min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Image with scroll animation */}
        <motion.div 
          className="absolute inset-0 w-full h-full z-0"
          style={{ opacity, scale }}
        >
          <img 
            src={heroOverlay} 
            alt="Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/70"></div>
        </motion.div>
        
        <div className="container px-4 max-w-6xl mx-auto py-8 md:py-16 relative z-10">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-xs sm:text-sm text-white/70 uppercase tracking-widest mb-2 md:mb-4"
            >
              Užsakyti dainą
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 md:mb-8"
            >
              <motion.span
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                Užsisakyk sau dainą
              </motion.span>
              <br className="hidden sm:block" />
              <motion.span
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="text-white/90"
              >
                vienu paspaudimu
              </motion.span>
            </motion.h1>
            
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-8 max-w-3xl mx-auto mb-6 sm:mb-10 mt-6 sm:mt-12 text-center"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div 
                className="bg-zinc-900/70 rounded-lg p-4 sm:p-6"
                variants={stepCardVariants}
                custom={0}
              >
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                  <span className="text-xl sm:text-2xl font-bold text-black">1</span>
                </div>
                <p className="text-base sm:text-lg text-white/90">Spausk "Prisijungti"</p>
              </motion.div>
              
              <motion.div 
                className="bg-zinc-900/70 rounded-lg p-4 sm:p-6"
                variants={stepCardVariants}
                custom={1}
              >
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                  <span className="text-xl sm:text-2xl font-bold text-black">2</span>
                </div>
                <p className="text-base sm:text-lg text-white/90">Įvesk kodą</p>
              </motion.div>
              
              <motion.div 
                className="bg-zinc-900/70 rounded-lg p-4 sm:p-6"
                variants={stepCardVariants}
                custom={2}
              >
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                  <span className="text-xl sm:text-2xl font-bold text-black">3</span>
                </div>
                <p className="text-base sm:text-lg text-white/90">Užsisakyk dainą</p>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6 md:mt-8"
            >
              <Button 
                asChild
                className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-3 sm:py-4 px-8 sm:px-10 rounded-md text-base sm:text-lg w-full sm:w-auto"
              >
                <Link to="/event-entry">Prisijungti dabar</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        className="w-full bg-zinc-900 py-20"
        ref={featuresRef}
      >
        <div className="container px-4 max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.7 }}
          >
            <motion.h2 
              className="text-4xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Pagrindinės funkcijos
            </motion.h2>
            <motion.p 
              className="text-lg text-white/70 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={featuresInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Inovatyvi sistema, sukurta palengvinti muzikos užsakymą renginiuose ir vakarėliuose
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
          >
            {/* Feature 1 */}
            <motion.div 
              className="bg-zinc-800 rounded-xl p-6 transition-all hover:bg-zinc-800/80 hover:translate-y-[-4px]"
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <div className="bg-primary/20 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <QrCode className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">QR Kodas</h3>
              <p className="text-white/70">Lengvas prisijungimas prie renginio naudojant QR kodą ar įvedimo kodą</p>
            </motion.div>
            
            {/* Feature 2 */}
            <motion.div 
              className="bg-zinc-800 rounded-xl p-6 transition-all hover:bg-zinc-800/80 hover:translate-y-[-4px]"
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <div className="bg-primary/20 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <Music className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Muzikos užsakymas</h3>
              <p className="text-white/70">Patogus dainų užsakymas ir asmeninių palinkėjimų pridėjimas</p>
            </motion.div>
            
            {/* Feature 3 */}
            <motion.div 
              className="bg-zinc-800 rounded-xl p-6 transition-all hover:bg-zinc-800/80 hover:translate-y-[-4px]"
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <div className="bg-primary/20 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Saugūs mokėjimai</h3>
              <p className="text-white/70">Integruota mokėjimo sistema su pirmu nemokamu užsakymu</p>
            </motion.div>
            
            {/* Feature 4 */}
            <motion.div 
              className="bg-zinc-800 rounded-xl p-6 transition-all hover:bg-zinc-800/80 hover:translate-y-[-4px]"
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <div className="bg-primary/20 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Renginių valdymas</h3>
              <p className="text-white/70">DJ gali kurti ir valdyti renginius su individualiais nustatymais</p>
            </motion.div>
            
            {/* Feature 5 */}
            <motion.div 
              className="bg-zinc-800 rounded-xl p-6 transition-all hover:bg-zinc-800/80 hover:translate-y-[-4px]"
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <div className="bg-primary/20 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <History className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Rekordbox integracija</h3>
              <p className="text-white/70">Realaus laiko integracija su Rekordbox grojamais kūriniais</p>
            </motion.div>
            
            {/* Feature 6 */}
            <motion.div 
              className="bg-zinc-800 rounded-xl p-6 transition-all hover:bg-zinc-800/80 hover:translate-y-[-4px]"
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <div className="bg-primary/20 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <BarChart4 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Statistika</h3>
              <p className="text-white/70">Išsami renginių ir užsakymų statistika DJ valdymo skydelyje</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* DJ Section */}
      <section 
        className="w-full bg-zinc-800 py-20"
        ref={djSectionRef}
      >
        <div className="container px-4 max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              className="lg:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              animate={djSectionInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <motion.div 
                className="text-white/70 uppercase tracking-widest mb-4"
                initial={{ opacity: 0 }}
                animate={djSectionInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                DJ Platforma
              </motion.div>
              
              <motion.h2 
                className="text-4xl font-bold text-white mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={djSectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Viskas, ko reikia DJ
              </motion.h2>
              
              <motion.p 
                className="text-lg text-white/70 mb-8"
                initial={{ opacity: 0 }}
                animate={djSectionInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                NoriuMuzikos siūlo išsamią valdymo sistemą DJ, leidžiančią efektyviai administruoti renginius ir dainų užsakymus
              </motion.p>
              
              <motion.ul 
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate={djSectionInView ? "visible" : "hidden"}
              >
                <motion.li 
                  className="flex items-start"
                  variants={cardVariants}
                >
                  <div className="bg-primary/20 p-2 rounded-lg mr-4 mt-1">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Renginių valdymas</h3>
                    <p className="text-white/70">Kurkite, redaguokite ir valdykite renginius su individualia kainodara</p>
                  </div>
                </motion.li>
                
                <motion.li 
                  className="flex items-start"
                  variants={cardVariants}
                >
                  <div className="bg-primary/20 p-2 rounded-lg mr-4 mt-1">
                    <QrCode className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">QR kodų generavimas</h3>
                    <p className="text-white/70">Automatinis QR kodų generavimas dalinimui su dalyviais</p>
                  </div>
                </motion.li>
                
                <motion.li 
                  className="flex items-start"
                  variants={cardVariants}
                >
                  <div className="bg-primary/20 p-2 rounded-lg mr-4 mt-1">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Užsakymų valdymas</h3>
                    <p className="text-white/70">Patvirtinkite, atmeskite ir valdykite dainų užsakymus realiu laiku</p>
                  </div>
                </motion.li>
              </motion.ul>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={djSectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  asChild
                  className="bg-primary hover:bg-primary/90 text-black font-bold py-3 px-8 rounded-md text-base mt-8"
                >
                  <Link to="/auth">Tapti DJ</Link>
                </Button>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="lg:w-1/2"
              initial={{ opacity: 0, x: 50 }}
              animate={djSectionInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            >
              <motion.div 
                className="bg-zinc-900 rounded-xl p-8 shadow-xl"
                whileHover={{ 
                  boxShadow: "0 0 30px rgba(0, 180, 216, 0.3)",
                  transition: { duration: 0.3 }
                }}
              >
                <img 
                  src={group14Image} 
                  alt="DJ Dashboard" 
                  className="w-full h-auto rounded-lg"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mobile Friendly Section */}
      <section 
        className="w-full bg-zinc-900 py-20"
        ref={mobileSectionRef}
      >
        <div className="container px-4 max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={mobileSectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.7 }}
          >
            <motion.h2 
              className="text-4xl font-bold text-white mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={mobileSectionInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Patogumas visur
            </motion.h2>
            <motion.p 
              className="text-lg text-white/70 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={mobileSectionInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Optimizuota patirtis bet kokiame įrenginyje
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
            variants={containerVariants}
            initial="hidden"
            animate={mobileSectionInView ? "visible" : "hidden"}
          >
            <motion.div 
              className="text-center"
              variants={cardVariants}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
            >
              <motion.div 
                className="bg-primary/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6"
                whileHover={{ 
                  backgroundColor: "rgba(0, 180, 216, 0.4)",
                  transition: { duration: 0.3 }
                }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, 0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
                >
                  <Phone className="h-8 w-8 text-primary" />
                </motion.div>
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">Mobili versija</h3>
              <p className="text-white/70">Tobulai pritaikyta mobiliesiems įrenginiams patirtis</p>
            </motion.div>
            
            <motion.div 
              className="text-center"
              variants={cardVariants}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
            >
              <motion.div 
                className="bg-primary/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6"
                whileHover={{ 
                  backgroundColor: "rgba(0, 180, 216, 0.4)",
                  transition: { duration: 0.3 }
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Globe className="h-8 w-8 text-primary" />
                </motion.div>
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">Lietuvių kalba</h3>
              <p className="text-white/70">Pilna lietuvių kalbos palaikymas vartotojo patirčiai pagerinti</p>
            </motion.div>
            
            <motion.div 
              className="text-center"
              variants={cardVariants}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
            >
              <motion.div 
                className="bg-primary/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6"
                whileHover={{ 
                  backgroundColor: "rgba(0, 180, 216, 0.4)",
                  transition: { duration: 0.3 }
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Lock className="h-8 w-8 text-primary" />
                </motion.div>
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">Saugumas</h3>
              <p className="text-white/70">Saugus autentifikavimas ir duomenų apsauga</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="w-full bg-zinc-800 py-20"
        ref={ctaSectionRef}
      >
        <div className="container px-4 max-w-6xl mx-auto">
          <motion.div 
            className="bg-primary/10 rounded-2xl p-10 text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={ctaSectionInView ? 
              { opacity: 1, y: 0, boxShadow: "0 0 40px rgba(0, 180, 216, 0.2)" } : 
              { opacity: 0, y: 50 }
            }
            transition={{ duration: 0.8, ease: "easeOut" }}
            whileHover={{ 
              boxShadow: "0 0 60px rgba(0, 180, 216, 0.3)",
              transition: { duration: 0.5 }
            }}
          >
            <motion.h2 
              className="text-4xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={ctaSectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Pradėk naudotis jau dabar
            </motion.h2>
            
            <motion.p 
              className="text-lg text-white/70 max-w-2xl mx-auto mb-8"
              initial={{ opacity: 0 }}
              animate={ctaSectionInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Prisijunk prie NoriuMuzikos ir pakylėk savo renginius į kitą lygį
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row justify-center gap-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={ctaSectionInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  asChild
                  className="bg-primary hover:bg-primary/90 text-black font-bold py-3 px-8 rounded-md text-base"
                >
                  <Link to="/event-entry">Užsakyti dainą</Link>
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  asChild
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 font-bold py-3 px-8 rounded-md text-base"
                >
                  <Link to="/auth">DJ Registracija</Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-zinc-900 py-10">
        <motion.div 
          className="container px-4 max-w-6xl mx-auto text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
        >
          <p className="text-white/50">© {new Date().getFullYear()} NoriuMuzikos. Visos teisės saugomos.</p>
        </motion.div>
      </footer>
    </div>
  );
}
