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
import { Mail, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Account {
  email: string;
  token: string;
}

export function AccountSwitcher() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);

  useEffect(() => {
    setMounted(true);
    const loadAccounts = () => {
      if (typeof window === "undefined") return;

      const accountsCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("mail_tm_accounts="));
      if (accountsCookie) {
        try {
          const accountsData = JSON.parse(
            decodeURIComponent(accountsCookie.split("=")[1])
          );
          setAccounts(accountsData);
        } catch (e) {
          console.error("Error parsing accounts:", e);
        }
      }

      const currentAccountCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("mail_tm_account="));
      if (currentAccountCookie) {
        try {
          const accountData = JSON.parse(
            decodeURIComponent(currentAccountCookie.split("=")[1])
          );
          setCurrentAccount(accountData);
        } catch (e) {
          console.error("Error parsing current account:", e);
        }
      }
    };

    loadAccounts();
  }, []);

  const handleAccountSwitch = (account: Account) => {
    try {
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `mail_tm_account=${JSON.stringify(
        account
      )}; path=/; expires=${expires}; SameSite=Strict; Secure`;
      document.cookie = `mail_tm_token=${account.token}; path=/; expires=${expires}; SameSite=Strict; Secure`;
      window.location.reload();
    } catch (error) {
      console.error("Error switching account:", error);
    }
  };

  if (!mounted) {
    return (
      <Button
        variant="outline"
        className="h-9 w-[200px] justify-between"
        size="sm"
      >
        Loading...
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-9 w-[200px] justify-between bg-background hover:bg-accent"
          size="sm"
        >
          <span className="truncate">
            {currentAccount?.email || "Select Account"}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]" align="start">
        <DropdownMenuLabel>Switch account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {accounts.map((account) => (
          <DropdownMenuItem
            key={account.email}
            onClick={() => handleAccountSwitch(account)}
            className="cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/10"
          >
            <Mail className="mr-2 h-4 w-4 text-purple-600" />
            <span className="truncate">{account.email}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/auth/register"
            className="cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/10"
          >
            <Mail className="mr-2 h-4 w-4 text-purple-600" />
            Add another account
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
