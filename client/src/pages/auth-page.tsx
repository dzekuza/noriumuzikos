import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Loader2, Eye, EyeOff } from "lucide-react";

type LoginFormValues = {
  username: string;
  password: string;
  rememberMe?: boolean;
};

export default function AuthPage() {
  const { user, loginMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [savedUsername, setSavedUsername] = useState("");
  
  // Load saved username from localStorage when component mounts
  useEffect(() => {
    const remembered = localStorage.getItem("rememberedUser");
    if (remembered) {
      setSavedUsername(remembered);
    }
  }, []);

  const loginForm = useForm<LoginFormValues>({
    defaultValues: {
      username: savedUsername,
      password: "",
      rememberMe: !!savedUsername,
    },
  });

  // Update form defaults when savedUsername changes
  useEffect(() => {
    if (savedUsername) {
      loginForm.setValue("username", savedUsername);
      loginForm.setValue("rememberMe", true);
    }
  }, [savedUsername, loginForm]);

  const onLoginSubmit = (data: LoginFormValues) => {
    // Handle the remember me functionality
    if (data.rememberMe) {
      localStorage.setItem("rememberedUser", data.username);
    } else {
      localStorage.removeItem("rememberedUser");
    }
    
    loginMutation.mutate({
      username: data.username,
      password: data.password,
      rememberMe: !!data.rememberMe
    });
  };

  // Redirect to dashboard if the user is already logged in
  if (user) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="flex min-h-screen bg-black">
      {/* Left side with form */}
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md p-8">
          <Card className="bg-zinc-900 border-zinc-800 text-white">
            <CardHeader>
              <CardTitle className="text-white">Prisijungimas</CardTitle>
              <CardDescription className="text-white/70">Įveskite prisijungimo duomenis, kad patektumėte į DJ valdymo skydelį</CardDescription>
            </CardHeader>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white/70">Vartotojo vardas</Label>
                  <Input
                    id="username"
                    className="bg-zinc-800 border-zinc-700 text-white focus:border-primary"
                    {...loginForm.register("username", { required: "Būtina įvesti vartotojo vardą" })}
                  />
                  {loginForm.formState.errors.username && (
                    <p className="text-sm text-red-500">{loginForm.formState.errors.username.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/70">Slaptažodis</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="bg-zinc-800 border-zinc-700 text-white focus:border-primary pr-10"
                      {...loginForm.register("password", { required: "Būtina įvesti slaptažodį" })}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/70 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-red-500">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox 
                    id="rememberMe" 
                    className="border-zinc-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    {...loginForm.register("rememberMe")} 
                  />
                  <Label 
                    htmlFor="rememberMe" 
                    className="text-sm text-white/70 cursor-pointer"
                  >
                    Prisiminti mane
                  </Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-3" 
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Palaukite...
                    </>
                  ) : (
                    "Prisijungti"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>

      {/* Right side with info */}
      <div className="hidden md:flex flex-1 bg-zinc-900 p-10 text-white flex-col justify-center border-l border-zinc-800">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-6">DJ Dainų Užsakymo Sistema</h1>
          <p className="text-xl mb-8 text-white/70">
            Sveiki atvykę į profesionalų DJ valdymo skydelį. Valdykite dainų užsakymus, peržiūrėkite renginio statistiką ir valdykite savo pasirodymą iš vienos centrinės vietos.
          </p>
          <div className="bg-zinc-800/50 p-6 rounded-md border border-zinc-700">
            <h2 className="text-2xl font-semibold mb-4">Funkcijos</h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="mr-2 text-primary">✓</span>
                <span>Realaus laiko dainų užsakymų valdymas</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary">✓</span>
                <span>Rekordbox integracija</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary">✓</span>
                <span>Asmeniniai QR kodai renginiams</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary">✓</span>
                <span>Saugus Stripe mokėjimų apdorojimas</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
