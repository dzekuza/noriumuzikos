import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User, insertUserSchema } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<Omit<User, "password">, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<Omit<User, "password">, Error, RegisterData>;
  updateProfileMutation: UseMutationResult<Omit<User, "password">, Error, UpdateProfileData>;
  changePasswordMutation: UseMutationResult<{ message: string }, Error, ChangePasswordData>;
  updateExtendedProfileMutation: UseMutationResult<Omit<User, "password">, Error, ExtendedProfileData>;
  requestVerificationCodeMutation: UseMutationResult<{ message: string }, Error, void>;
  verifyEmailMutation: UseMutationResult<{ message: string, user: Omit<User, "password"> }, Error, VerifyEmailData>;
};

type LoginData = {
  username: string;
  password: string;
  rememberMe?: boolean;
};

type RegisterData = {
  username: string;
  password: string;
  email: string;
};

type UpdateProfileData = {
  username: string;
};

type ExtendedProfileData = {
  email?: string;
  phoneNumber?: string;
  profilePicture?: string;
};

type VerifyEmailData = {
  code: string;
};

type ChangePasswordData = {
  currentPassword: string;
  newPassword: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn<User | null>({ on401: "returnNull" }),
  });

  const loginMutation = useMutation<Omit<User, "password">, Error, LoginData>({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation<Omit<User, "password">, Error, RegisterData>({
    mutationFn: async (credentials: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: `Welcome, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation<Omit<User, "password">, Error, UpdateProfileData>({
    mutationFn: async (data: UpdateProfileData) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      return await res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/user"], updatedUser);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Profile Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation<{ message: string }, Error, ChangePasswordData>({
    mutationFn: async (data: ChangePasswordData) => {
      const res = await apiRequest("POST", "/api/user/change-password", data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Password Changed",
        description: data.message || "Your password has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Password Change Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateExtendedProfileMutation = useMutation<Omit<User, "password">, Error, ExtendedProfileData>({
    mutationFn: async (data: ExtendedProfileData) => {
      const res = await apiRequest("PATCH", "/api/user/profile/extended", data);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Profilis atnaujintas",
        description: "Jūsų profilis buvo sėkmingai atnaujintas.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Nepavyko atnaujinti profilio",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const requestVerificationCodeMutation = useMutation<{ message: string }, Error, void>({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/user/verify-email/request");
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Patvirtinimo kodas išsiųstas",
        description: data.message || "Patvirtinimo kodas buvo išsiųstas į jūsų el. paštą.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Nepavyko išsiųsti patvirtinimo kodo",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const verifyEmailMutation = useMutation<{ message: string, user: Omit<User, "password"> }, Error, VerifyEmailData>({
    mutationFn: async (data: VerifyEmailData) => {
      const res = await apiRequest("POST", "/api/user/verify-email/verify", data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user"], data.user);
      toast({
        title: "El. paštas patvirtintas",
        description: data.message || "Jūsų el. paštas buvo sėkmingai patvirtintas.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Nepavyko patvirtinti el. pašto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        updateProfileMutation,
        changePasswordMutation,
        updateExtendedProfileMutation,
        requestVerificationCodeMutation,
        verifyEmailMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
