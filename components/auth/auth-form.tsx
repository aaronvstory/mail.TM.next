"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  createMailTmAccount,
  loginMailTm,
  getAvailableDomains,
} from "@/lib/mail-tm/client";
import { supabase } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { DialogClose } from "@/components/ui/dialog";

interface AuthFormProps {
  type: "login" | "register";
  onSuccess?: () => void;
}

export function AuthForm({ type, onSuccess }: AuthFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [availableDomain, setAvailableDomain] = useState<string>("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (type === "register") {
      const fetchDomain = async () => {
        try {
          const domains = await getAvailableDomains();
          if (domains && domains.length > 0) {
            setAvailableDomain(domains[0].domain);
          }
        } catch (error) {
          console.error("Failed to fetch domains:", error);
          setError("Failed to fetch available domains. Please try again.");
          toast.error("Failed to fetch available domains");
        }
      };
      fetchDomain();
    }
  }, [type]);

  useEffect(() => {
    if (error) {
      setError("");
    }
  }, [username, password]);

  const handleGitHubAuth = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("GitHub auth error:", error);
      toast.error("Failed to authenticate with GitHub");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (type === "register") {
        if (!availableDomain) {
          throw new Error("No domain available for registration");
        }
        await createMailTmAccount(username, password, availableDomain);
        toast.success("Account created successfully! Please sign in.");
        onSuccess?.();
      } else {
        const loginData = await loginMailTm(username, password);
        if (loginData.token) {
          const expires = new Date(
            Date.now() + 24 * 60 * 60 * 1000
          ).toUTCString();
          document.cookie = `mail_tm_token=${loginData.token}; path=/; expires=${expires}`;
          document.cookie = `mail_tm_account=${JSON.stringify({
            id: loginData.account.id,
            email: username.includes("@") ? username : `${username}@mail.tm`,
          })}; path=/; expires=${expires}`;

          toast.success("Signed in successfully!");
          onSuccess?.();
          router.refresh();
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      const errorMessage =
        error?.message ||
        (type === "register"
          ? "Failed to create account"
          : "Invalid email or password");

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full border-none shadow-none">
      <CardContent>
        <div className="space-y-4">
          <Button
            variant="outline"
            type="button"
            className="w-full"
            onClick={handleGitHubAuth}
            disabled={isLoading}
          >
            <Github className="mr-2 h-4 w-4" />
            {isLoading ? "Signing in..." : "Sign in with GitHub"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 dark:text-red-400 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">
                {type === "login" ? "Email" : "Username"}
              </Label>
              <Input
                id="username"
                placeholder={
                  type === "login" ? "email@example.com" : "username"
                }
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                aria-invalid={!!error}
                aria-describedby={error ? "auth-error" : undefined}
              />
              {type === "register" && availableDomain && (
                <p className="text-sm text-muted-foreground">
                  {`Your email will be: ${username}@${availableDomain}`}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-invalid={!!error}
                aria-describedby={error ? "auth-error" : undefined}
              />
            </div>
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? type === "login"
                    ? "Signing in..."
                    : "Creating account..."
                  : type === "login"
                  ? "Sign in"
                  : "Create account"}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
