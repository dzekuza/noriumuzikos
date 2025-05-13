import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, User, KeyRound, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

type ProfileFormValues = {
  username: string;
};

type PasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ProfileSettings() {
  const { user, updateProfileMutation, changePasswordMutation } = useAuth();
  const { toast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    defaultValues: {
      username: user?.username || "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onProfileSubmit = (data: ProfileFormValues) => {
    if (data.username === user?.username) {
      toast({
        title: "No changes",
        description: "Your username is already set to this value",
        variant: "default",
      });
      return;
    }
    
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordFormValues) => {
    if (data.newPassword !== data.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirm password must match",
        variant: "destructive",
      });
      return;
    }
    
    if (data.newPassword === data.currentPassword) {
      toast({
        title: "Same password",
        description: "New password must be different from current password",
        variant: "destructive",
      });
      return;
    }
    
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
    
    // Reset the form after submission
    passwordForm.reset({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <Tabs defaultValue="profile" className="w-full max-w-md mx-auto">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-black">
          <User className="mr-2 h-4 w-4" /> Profilis
        </TabsTrigger>
        <TabsTrigger value="password" className="data-[state=active]:bg-primary data-[state=active]:text-black">
          <KeyRound className="mr-2 h-4 w-4" /> Slaptažodis
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="profile">
        <Card className="bg-zinc-900 border-zinc-800 text-white">
          <CardHeader>
            <CardTitle className="text-white">Profilio nustatymai</CardTitle>
            <CardDescription className="text-white/70">
              Atnaujinkite savo profilį ir vartotojo vardą
            </CardDescription>
          </CardHeader>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white/70">Vartotojo vardas</Label>
                <Input
                  id="username"
                  className="bg-zinc-800 border-zinc-700 text-white focus:border-primary"
                  {...profileForm.register("username", { required: "Įveskite vartotojo vardą" })}
                />
                {profileForm.formState.errors.username && (
                  <p className="text-sm text-red-500">{profileForm.formState.errors.username.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-3" 
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? (
                  <>Atnaujinama...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> Išsaugoti pakeitimus</>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
      
      <TabsContent value="password">
        <Card className="bg-zinc-900 border-zinc-800 text-white">
          <CardHeader>
            <CardTitle className="text-white">Slaptažodžio keitimas</CardTitle>
            <CardDescription className="text-white/70">
              Atnaujinkite savo prisijungimo slaptažodį
            </CardDescription>
          </CardHeader>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-white/70">Dabartinis slaptažodis</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    className="bg-zinc-800 border-zinc-700 text-white focus:border-primary pr-10"
                    {...passwordForm.register("currentPassword", { required: "Įveskite dabartinį slaptažodį" })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/70 hover:text-white"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-sm text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-white/70">Naujas slaptažodis</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    className="bg-zinc-800 border-zinc-700 text-white focus:border-primary pr-10"
                    {...passwordForm.register("newPassword", { 
                      required: "Įveskite naują slaptažodį",
                      minLength: { value: 6, message: "Slaptažodis turi būti bent 6 simbolių ilgio" }
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/70 hover:text-white"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-sm text-red-500">{passwordForm.formState.errors.newPassword.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white/70">Pakartokite naują slaptažodį</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className="bg-zinc-800 border-zinc-700 text-white focus:border-primary pr-10"
                    {...passwordForm.register("confirmPassword", { 
                      required: "Pakartokite naują slaptažodį",
                      validate: value => value === passwordForm.watch("newPassword") || "Slaptažodžiai nesutampa"
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/70 hover:text-white"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-3" 
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending ? (
                  <>Atnaujinama...</>
                ) : (
                  <><KeyRound className="mr-2 h-4 w-4" /> Pakeisti slaptažodį</>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
    </Tabs>
  );
}