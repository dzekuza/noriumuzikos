import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Eye, 
  EyeOff, 
  User, 
  KeyRound, 
  Save, 
  Mail, 
  Phone, 
  Camera, 
  BadgeCheck, 
  RefreshCcw 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Form validation schemas
const profileSchema = z.object({
  username: z.string().min(3, "Vartotojo vardas turi būti bent 3 simbolių ilgio")
});

const extendedProfileSchema = z.object({
  email: z.string().email("Įveskite galiojantį el. pašto adresą").optional().or(z.literal("")),
  phoneNumber: z.string().optional().or(z.literal("")),
  profilePicture: z.string().optional().or(z.literal(""))
});

const verifyEmailSchema = z.object({
  code: z.string().length(6, "Kodas turi būti 6 skaitmenų")
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Įveskite dabartinį slaptažodį"),
  newPassword: z.string().min(6, "Slaptažodis turi būti bent 6 simbolių ilgio"),
  confirmPassword: z.string().min(1, "Pakartokite naują slaptažodį")
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Slaptažodžiai nesutampa",
  path: ["confirmPassword"]
});

// Form value types
type ProfileFormValues = z.infer<typeof profileSchema>;
type ExtendedProfileFormValues = z.infer<typeof extendedProfileSchema>;
type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ProfileSettings() {
  const { 
    user, 
    updateProfileMutation, 
    changePasswordMutation,
    updateExtendedProfileMutation,
    requestVerificationCodeMutation,
    verifyEmailMutation
  } = useAuth();
  const { toast } = useToast();
  
  // Password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Verification state
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationInProgress, setVerificationInProgress] = useState(false);
  
  // Profile image state
  const [imagePreview, setImagePreview] = useState<string | null>(user?.profilePicture || null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Basic profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
    },
  });

  // Extended profile form
  const extendedProfileForm = useForm<ExtendedProfileFormValues>({
    resolver: zodResolver(extendedProfileSchema),
    defaultValues: {
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      profilePicture: user?.profilePicture || "",
    },
  });
  
  // Email verification form
  const verifyEmailForm = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      code: "",
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onProfileSubmit = (data: ProfileFormValues) => {
    if (data.username === user?.username) {
      toast({
        title: "Nėra pakeitimų",
        description: "Jūsų vartotojo vardas jau yra toks",
        variant: "default",
      });
      return;
    }
    
    updateProfileMutation.mutate(data);
  };
  
  const onExtendedProfileSubmit = (data: ExtendedProfileFormValues) => {
    // Check if there are any changes
    if (
      data.email === user?.email &&
      data.phoneNumber === user?.phoneNumber &&
      data.profilePicture === user?.profilePicture
    ) {
      toast({
        title: "Nėra pakeitimų",
        description: "Nebuvo atlikta jokių pakeitimų",
        variant: "default",
      });
      return;
    }
    
    updateExtendedProfileMutation.mutate(data);
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Netinkamas failo formatas",
        description: "Prašome įkelti JPEG, PNG, GIF arba WEBP formato paveikslėlį",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Per didelis failas",
        description: "Paveikslėlio dydis negali viršyti 2MB",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setUploadingImage(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('image', file);
      
      // Upload image
      const res = await fetch('/api/user/upload-avatar', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await res.json();
      
      // Update preview and form value
      setImagePreview(data.imageUrl);
      extendedProfileForm.setValue('profilePicture', data.imageUrl);
      
      toast({
        title: "Paveikslėlis įkeltas",
        description: "Profilio nuotrauka buvo sėkmingai įkelta",
      });
    } catch (error) {
      toast({
        title: "Nepavyko įkelti paveikslėlio",
        description: error instanceof Error ? error.message : "Įvyko nežinoma klaida",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };
  
  const handleVerificationRequest = () => {
    const email = extendedProfileForm.getValues('email');
    
    if (!email) {
      toast({
        title: "Nėra el. pašto",
        description: "Prašome pirma įvesti el. pašto adresą",
        variant: "destructive",
      });
      return;
    }
    
    // Send verification request
    requestVerificationCodeMutation.mutate(undefined, {
      onSuccess: () => {
        setVerificationSent(true);
        setVerificationInProgress(true);
      }
    });
  };
  
  const onVerifyEmailSubmit = (data: VerifyEmailFormValues) => {
    verifyEmailMutation.mutate(data, {
      onSuccess: () => {
        setVerificationInProgress(false);
        setVerificationSent(false);
      }
    });
  };

  const onPasswordSubmit = (data: PasswordFormValues) => {
    // Validation is now handled by Zod schema
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
      <TabsList className="grid w-full grid-cols-3 mb-4">
        <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-black">
          <User className="mr-2 h-4 w-4" /> Profilis
        </TabsTrigger>
        <TabsTrigger value="extended" className="data-[state=active]:bg-primary data-[state=active]:text-black">
          <Mail className="mr-2 h-4 w-4" /> Kontaktai
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
              <div className="flex items-center justify-center mb-4">
                <Avatar className="h-24 w-24">
                  {imagePreview ? (
                    <AvatarImage src={imagePreview} alt={user?.username || "Profile picture"} />
                  ) : (
                    <AvatarFallback className="bg-zinc-800 text-primary text-xl">
                      {user?.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white/70">Vartotojo vardas</Label>
                <Input
                  id="username"
                  className="bg-zinc-800 border-zinc-700 text-white focus:border-primary"
                  {...profileForm.register("username")}
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
      
      <TabsContent value="extended">
        <Card className="bg-zinc-900 border-zinc-800 text-white">
          <CardHeader>
            <CardTitle className="text-white">Kontaktinė informacija</CardTitle>
            <CardDescription className="text-white/70">
              Atnaujinkite savo kontaktinę informaciją ir nuotrauką
            </CardDescription>
          </CardHeader>
          <form onSubmit={extendedProfileForm.handleSubmit(onExtendedProfileSubmit)}>
            <CardContent className="space-y-4">
              {/* Profile Picture Section */}
              <div className="space-y-2">
                <Label className="text-white/70">Profilio nuotrauka</Label>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    {imagePreview ? (
                      <AvatarImage src={imagePreview} alt={user?.username || "Profile"} />
                    ) : (
                      <AvatarFallback className="bg-zinc-800 text-primary">
                        {user?.username?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <Label 
                      htmlFor="profileImage" 
                      className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-md flex items-center"
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      {uploadingImage ? "Įkeliama..." : "Įkelti nuotrauką"}
                    </Label>
                    <input
                      id="profileImage"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                    <p className="text-xs text-white/60 mt-1">JPG, PNG arba GIF (max. 2MB)</p>
                  </div>
                </div>
              </div>
              
              {/* Email Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email" className="text-white/70">El. paštas</Label>
                  {user?.isEmailVerified && (
                    <Badge className="bg-green-700 text-white">
                      <BadgeCheck className="h-3 w-3 mr-1" /> Patvirtintas
                    </Badge>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    className="bg-zinc-800 border-zinc-700 text-white focus:border-primary pr-10"
                    {...extendedProfileForm.register("email")}
                    disabled={user?.isEmailVerified}
                  />
                  {!user?.isEmailVerified && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 text-xs py-0 px-2 bg-primary/20 hover:bg-primary/30 text-primary"
                      onClick={handleVerificationRequest}
                      disabled={requestVerificationCodeMutation.isPending || verificationSent}
                    >
                      {requestVerificationCodeMutation.isPending ? (
                        <RefreshCcw className="h-3 w-3 animate-spin" />
                      ) : verificationSent ? (
                        "Išsiųsta"
                      ) : (
                        "Patvirtinti"
                      )}
                    </Button>
                  )}
                </div>
                {extendedProfileForm.formState.errors.email && (
                  <p className="text-sm text-red-500">{extendedProfileForm.formState.errors.email.message}</p>
                )}
              </div>
              
              {/* Verification Code Section - Only show when verification is in progress */}
              {verificationInProgress && (
                <div className="space-y-2 bg-zinc-800 p-3 rounded-md">
                  <Label htmlFor="verificationCode" className="text-white/70">
                    Patvirtinimo kodas
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      id="verificationCode"
                      className="bg-zinc-700 border-zinc-600 text-white focus:border-primary"
                      {...verifyEmailForm.register("code")}
                      placeholder="123456"
                      maxLength={6}
                    />
                    <Button
                      type="button"
                      className="bg-primary text-black hover:bg-primary/90"
                      onClick={verifyEmailForm.handleSubmit(onVerifyEmailSubmit)}
                      disabled={verifyEmailMutation.isPending}
                    >
                      {verifyEmailMutation.isPending ? (
                        <RefreshCcw className="h-4 w-4 animate-spin" />
                      ) : (
                        "Patvirtinti"
                      )}
                    </Button>
                  </div>
                  {verifyEmailForm.formState.errors.code && (
                    <p className="text-sm text-red-500">{verifyEmailForm.formState.errors.code.message}</p>
                  )}
                  <p className="text-xs text-white/60">
                    6 skaitmenų kodas buvo išsiųstas į jūsų el. paštą. Jis galioja 15 minučių.
                  </p>
                </div>
              )}
              
              {/* Phone Number Section */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-white/70">Telefono numeris</Label>
                <Input
                  id="phoneNumber"
                  className="bg-zinc-800 border-zinc-700 text-white focus:border-primary"
                  {...extendedProfileForm.register("phoneNumber")}
                  placeholder="+370 "
                />
                {extendedProfileForm.formState.errors.phoneNumber && (
                  <p className="text-sm text-red-500">{extendedProfileForm.formState.errors.phoneNumber.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-3" 
                disabled={updateExtendedProfileMutation.isPending}
              >
                {updateExtendedProfileMutation.isPending ? (
                  <>Atnaujinama...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> Išsaugoti kontaktus</>
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