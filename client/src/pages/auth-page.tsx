import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";

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
  const [tab, setTab] = useState<"login" | "register">("login");

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
        message: "Passwords don't match",
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
          <Tabs value={tab} onValueChange={(value) => setTab(value as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
              <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-black">Login</TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-black">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <Card className="bg-zinc-900 border-zinc-800 text-white">
                <CardHeader>
                  <CardTitle className="text-white">Login</CardTitle>
                  <CardDescription className="text-white/70">Enter your credentials to access your DJ dashboard</CardDescription>
                </CardHeader>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-white/70">Username</Label>
                      <Input
                        id="username"
                        className="bg-zinc-800 border-zinc-700 text-white focus:border-primary"
                        {...loginForm.register("username", { required: "Username is required" })}
                      />
                      {loginForm.formState.errors.username && (
                        <p className="text-sm text-red-500">{loginForm.formState.errors.username.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-white/70">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        className="bg-zinc-800 border-zinc-700 text-white focus:border-primary"
                        {...loginForm.register("password", { required: "Password is required" })}
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
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                        </>
                      ) : (
                        "Login"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            <TabsContent value="register">
              <Card className="bg-zinc-900 border-zinc-800 text-white">
                <CardHeader>
                  <CardTitle className="text-white">Create an account</CardTitle>
                  <CardDescription className="text-white/70">Enter your details to create a DJ account</CardDescription>
                </CardHeader>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username" className="text-white/70">Username</Label>
                      <Input
                        id="register-username"
                        className="bg-zinc-800 border-zinc-700 text-white focus:border-primary"
                        {...registerForm.register("username", { required: "Username is required" })}
                      />
                      {registerForm.formState.errors.username && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.username.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-white/70">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        className="bg-zinc-800 border-zinc-700 text-white focus:border-primary"
                        {...registerForm.register("password", { 
                          required: "Password is required",
                          minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters"
                          }
                        })}
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-white/70">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        className="bg-zinc-800 border-zinc-700 text-white focus:border-primary"
                        {...registerForm.register("confirmPassword", { required: "Please confirm your password" })}
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
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account
                        </>
                      ) : (
                        "Register"
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
          <h1 className="text-4xl font-bold mb-6">DJ Song Request System</h1>
          <p className="text-xl mb-8 text-white/70">
            Welcome to your professional DJ dashboard. Manage song requests, view event statistics, and control your performance from one central location.
          </p>
          <div className="bg-zinc-800/50 p-6 rounded-md border border-zinc-700">
            <h2 className="text-2xl font-semibold mb-4">Features</h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="mr-2 text-primary">✓</span>
                <span>Real-time song request management</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary">✓</span>
                <span>Rekordbox integration</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary">✓</span>
                <span>Custom QR codes for events</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary">✓</span>
                <span>Secure Stripe payment processing</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
