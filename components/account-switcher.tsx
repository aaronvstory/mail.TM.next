"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

export function AccountSwitcher() {
  const router = useRouter();

  const handleAccountSwitch = (accountEmail: string) => {
    const accounts = document.cookie
      .split("; ")
      .find((row) => row.startsWith("mail_tm_accounts="));
    if (accounts) {
      try {
        const accountsData = JSON.parse(
          decodeURIComponent(accounts.split("=")[1])
        );
        const selectedAccount = accountsData.find(
          (acc: any) => acc.email === accountEmail
        );
        if (selectedAccount) {
          // Set the active account
          const expires = new Date(
            Date.now() + 24 * 60 * 60 * 1000
          ).toUTCString();
          document.cookie = `mail_tm_account=${JSON.stringify(
            selectedAccount
          )}; path=/; expires=${expires}; SameSite=Strict; Secure`;
          document.cookie = `mail_tm_token=${selectedAccount.token}; path=/; expires=${expires}; SameSite=Strict; Secure`;
          window.location.reload();
        }
      } catch (e) {
        console.error("Error switching account:", e);
        toast.error("Failed to switch account");
      }
    }
  };

  const getStoredAccounts = () => {
    const accounts = document.cookie
      .split("; ")
      .find((row) => row.startsWith("mail_tm_accounts="));
    if (accounts) {
      try {
        return JSON.parse(decodeURIComponent(accounts.split("=")[1]));
      } catch (e) {
        console.error("Error parsing accounts:", e);
        return [];
      }
    }
    return [];
  };

  const getCurrentAccount = () => {
    const account = document.cookie
      .split("; ")
      .find((row) => row.startsWith("mail_tm_account="));
    if (account) {
      try {
        return JSON.parse(decodeURIComponent(account.split("=")[1]));
      } catch (e) {
        console.error("Error parsing current account:", e);
        return null;
      }
    }
    return null;
  };

  const accounts = getStoredAccounts();
  const currentAccount = getCurrentAccount();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-9 w-[200px] justify-between">
          {currentAccount?.email || "Select Account"}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]" align="start">
        <DropdownMenuLabel>Switch account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {accounts.map((account: any) => (
          <DropdownMenuItem
            key={account.email}
            onClick={() => handleAccountSwitch(account.email)}
          >
            {account.email}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/auth/register")}>
          Add another account
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
