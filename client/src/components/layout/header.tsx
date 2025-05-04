import { Link, useLocation } from 'wouter';
import { Music, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <nav className="bg-black border-b border-zinc-800 sticky top-0 z-50">
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
              className={`text-white/80 ${location === '/' ? 'text-primary' : 'hover:text-primary'} text-sm px-3 py-2 rounded-md`}
            >
              Home
            </Link>
            
            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-white/80 hover:text-primary bg-transparent">
                      <User className="h-5 w-5 mr-1" />
                      {user.username}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-zinc-900 border border-zinc-800">
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-white/80 hover:text-primary hover:bg-zinc-800 focus:bg-zinc-800">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/auth">
                <Button variant="outline" size="sm" className="text-white border-zinc-700 hover:bg-primary hover:border-primary hover:text-black bg-transparent">
                  Login / Register
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
