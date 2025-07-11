import { Link, useLocation } from 'wouter';
import { LogOut, User, LayoutDashboard, Settings, Shield } from 'lucide-react';
import logoSvg from '@/assets/noriumuzikos.svg';
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
              <img src={logoSvg} alt="NoriuMuzikos" className="h-8" />
            </Link>
          </div>
          <div className="flex items-center space-x-4">

            
            {user ? (
              <>
                {/* Removed the dashboard button as requested */}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Link href="/dashboard" className="inline-block">
                      <Button variant="ghost" size="sm" className="text-white/80 hover:text-cyan-400 bg-transparent">
                        <User className="h-5 w-5 mr-1" />
                        {user.username}
                      </Button>
                    </Link>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-zinc-900 border border-zinc-800">
                    <Link href="/dashboard">
                      <DropdownMenuItem className="cursor-pointer text-white/80 hover:text-black hover:bg-cyan-400 focus:bg-cyan-400">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Valdymo Skydelis
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/profile">
                      <DropdownMenuItem className="cursor-pointer text-white/80 hover:text-black hover:bg-cyan-400 focus:bg-cyan-400">
                        <Settings className="h-4 w-4 mr-2" />
                        Mano Profilis
                      </DropdownMenuItem>
                    </Link>
                    
                    {/* Admin dashboard link - only for admin user (user ID 1) */}
                    {user.id === 1 && (
                      <Link href="/admin">
                        <DropdownMenuItem className="cursor-pointer text-white/80 hover:text-black hover:bg-cyan-400 focus:bg-cyan-400">
                          <Shield className="h-4 w-4 mr-2" />
                          Admin Skydelis
                        </DropdownMenuItem>
                      </Link>
                    )}
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-white/80 hover:text-black hover:bg-cyan-400 focus:bg-cyan-400">
                      <LogOut className="h-4 w-4 mr-2" />
                      Atsijungti
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/auth">
                <Button variant="ghost" size="sm" className="text-white/80 hover:text-cyan-400 bg-transparent">
                  <User className="h-5 w-5 mr-1" />
                  Prisijungti
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
