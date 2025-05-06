import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

// Profile tab - Change username
function ProfileTab() {
  const { user, updateProfileMutation } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      username: user?.username || "",
    },
  });

  const onSubmit = (data: { username: string }) => {
    updateProfileMutation.mutate(data, {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Vartotojo vardas</Label>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <Input
                id="username"
                {...register("username", { required: "Vartotojo vardas privalomas" })}
              />
            ) : (
              <div className="flex-1 px-3 py-2 border rounded-md bg-muted">
                {user?.username}
              </div>
            )}
          </div>
          {errors.username && (
            <p className="text-sm text-destructive">{errors.username.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          {isEditing ? (
            <>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                disabled={updateProfileMutation.isPending}
              >
                Atšaukti
              </Button>
              <Button 
                type="submit" 
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? "Išsaugoma..." : "Išsaugoti"}
              </Button>
            </>
          ) : (
            <Button 
              type="button" 
              onClick={() => setIsEditing(true)}
            >
              Redaguoti
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

// Security tab - Change password
function SecurityTab() {
  const { changePasswordMutation } = useAuth();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    if (data.newPassword !== data.confirmPassword) {
      toast({
        title: "Klaida",
        description: "Nauji slaptažodžiai nesutampa",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          reset();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Dabartinis slaptažodis</Label>
          <Input
            id="currentPassword"
            type="password"
            {...register("currentPassword", { required: "Dabartinis slaptažodis privalomas" })}
          />
          {errors.currentPassword && (
            <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">Naujas slaptažodis</Label>
          <Input
            id="newPassword"
            type="password"
            {...register("newPassword", { required: "Naujas slaptažodis privalomas" })}
          />
          {errors.newPassword && (
            <p className="text-sm text-destructive">{errors.newPassword.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Patvirtinkite naują slaptažodį</Label>
          <Input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword", { required: "Slaptažodžio patvirtinimas privalomas" })}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending ? "Keičiama..." : "Keisti slaptažodį"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Jūs neprisijungęs</CardTitle>
            <CardDescription>Jūs turite prisijungti, kad galėtumėte redaguoti savo profilį</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Mano profilis</CardTitle>
            <CardDescription>Redaguokite savo profilį ir valdykite saugumo nustatymus</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Profilio nustatymai</TabsTrigger>
                <TabsTrigger value="security">Saugumo nustatymai</TabsTrigger>
              </TabsList>
              <TabsContent value="profile" className="py-4">
                <ProfileTab />
              </TabsContent>
              <TabsContent value="security" className="py-4">
                <SecurityTab />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <p className="text-xs text-muted-foreground">Pastaba: Keisdami vartotojo vardą, turėsite prisijungti iš naujo, naudodami naują vartotojo vardą.</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
