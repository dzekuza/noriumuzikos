import { Link, useLocation } from 'wouter';
import { Music } from 'lucide-react';

export default function Header() {
  const [location] = useLocation();
  
  return (
    <nav className="bg-secondary sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Music className="h-6 w-6 text-primary mr-2" />
              <span className="text-xl font-bold text-white">DJ<span className="text-primary">Request</span></span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className={`text-white ${location === '/' ? 'text-accent' : 'hover:text-accent'} text-sm px-3 py-2 rounded-md`}
            >
              Home
            </Link>
            <Link 
              href="/dashboard" 
              className={`text-white ${location === '/dashboard' ? 'text-accent' : 'hover:text-accent'} text-sm px-3 py-2 rounded-md`}
            >
              DJ Dashboard
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
