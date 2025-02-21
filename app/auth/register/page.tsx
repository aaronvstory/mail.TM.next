"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const metadata = {
  title: "Create Temporary Email",
  description: "Create a disposable email address for temporary use",
};

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://api.mail.tm/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: generateEmail(),
          password: generatePassword(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create account");
      }

      const account = await response.json();

      // Login with the new account
      const loginResponse = await fetch("https://api.mail.tm/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: account.address,
          password: account.password,
        }),
      });

      if (!loginResponse.ok) {
        throw new Error("Failed to login to new account");
      }

      const { token } = await loginResponse.json();

      // Save the account and token
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();

      // Get existing accounts
      const existingAccountsCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("mail_tm_accounts="));

      let accounts = [];
      if (existingAccountsCookie) {
        try {
          accounts = JSON.parse(
            decodeURIComponent(existingAccountsCookie.split("=")[1])
          );
        } catch (e) {
          console.error("Error parsing existing accounts:", e);
        }
      }

      // Add new account to the list
      accounts.push({
        email: account.address,
        token,
        password: account.password,
      });

      // Save updated accounts list
      document.cookie = `mail_tm_accounts=${JSON.stringify(
        accounts
      )}; path=/; expires=${expires}; SameSite=Strict; Secure`;

      // Set as current account
      document.cookie = `mail_tm_account=${JSON.stringify({
        email: account.address,
        token,
        password: account.password,
      })}; path=/; expires=${expires}; SameSite=Strict; Secure`;

      document.cookie = `mail_tm_token=${token}; path=/; expires=${expires}; SameSite=Strict; Secure`;

      toast.success("Account created successfully");
      router.push("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const generateEmail = () => {
    const username = Math.random().toString(36).substring(2, 10);
    return `${username}@koxmail.me`;
  };

  const generatePassword = () => {
    return Math.random().toString(36).substring(2, 10);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="absolute left-4 top-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="mx-auto">
            <Logo />
          </div>
        </div>
        <Button className="w-full" onClick={handleRegister} disabled={loading}>
          {loading ? "Creating Account..." : "Create New Account"}
        </Button>
        <p className="text-sm text-center text-muted-foreground">
          A random email will be generated for you
        </p>
      </div>
    </div>
  );
}
