import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type LoginFormValues = {
  username: string;
  password: string;
};

type RegisterFormValues = {
  username: string;
  password: string;
  confirmPassword: string;
};

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [tab, setTab] = useState<string>("login");

  const loginForm = useForm<LoginFormValues>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    if (data.password !== data.confirmPassword) {
      registerForm.setError("confirmPassword", {
        type: "manual",
        message: "Slaptažodžiai nesutampa",
      });
      return;
    }

    registerMutation.mutate({
      username: data.username,
      password: data.password,
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
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-primary data-[state=active]:text-black"
              >
                Prisijungti
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                className="data-[state=active]:bg-primary data-[state=active]:text-black"
              >
                Registruotis
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
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
                      <Input
                        id="password"
                        type="password"
                        className="bg-zinc-800 border-zinc-700 text-white focus:border-primary"
                        {...loginForm.register("password", { required: "Būtina įvesti slaptažodį" })}
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-red-500">{loginForm.formState.errors.password.message}</p>
                      )}
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
            </TabsContent>
            
            <TabsContent value="register">
              <Card className="bg-zinc-900 border-zinc-800 text-white">
                <CardHeader>
                  <CardTitle className="text-white">Registracija</CardTitle>
                  <CardDescription className="text-white/70">Sukurkite naują paskyrą, kad pradėtumėte naudotis sistema</CardDescription>
                </CardHeader>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-username" className="text-white/70">Vartotojo vardas</Label>
                      <Input
                        id="reg-username"
                        className="bg-zinc-800 border-zinc-700 text-white focus:border-primary"
                        {...registerForm.register("username", { required: "Būtina įvesti vartotojo vardą" })}
                      />
                      {registerForm.formState.errors.username && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.username.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password" className="text-white/70">Slaptažodis</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        className="bg-zinc-800 border-zinc-700 text-white focus:border-primary"
                        {...registerForm.register("password", { required: "Būtina įvesti slaptažodį" })}
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-confirm-password" className="text-white/70">Pakartokite slaptažodį</Label>
                      <Input
                        id="reg-confirm-password"
                        type="password"
                        className="bg-zinc-800 border-zinc-700 text-white focus:border-primary"
                        {...registerForm.register("confirmPassword", { required: "Būtina pakartoti slaptažodį" })}
                      />
                      {registerForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-3" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Palaukite...
                        </>
                      ) : (
                        "Registruotis"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
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
