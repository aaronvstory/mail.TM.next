"use client";

import { Mail, LogOut, ArrowUpFromLine, ArrowDownToLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { logout } from "@/lib/mail-tm/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function Sidebar({ onRefresh }: { onRefresh?: () => void }) {
  const router = useRouter();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [currentAccount, setCurrentAccount] = useState<any>(null);

  useEffect(() => {
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
  }, []);

  const handleAccountSwitch = (accountEmail: string) => {
    const selectedAccount = accounts.find((acc) => acc.email === accountEmail);
    if (selectedAccount) {
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `mail_tm_account=${JSON.stringify(
        selectedAccount
      )}; path=/; expires=${expires}; SameSite=Strict; Secure`;
      document.cookie = `mail_tm_token=${selectedAccount.token}; path=/; expires=${expires}; SameSite=Strict; Secure`;
      window.location.reload();
    }
  };

  const handleLogout = async () => {
    await logout();
    document.cookie =
      "mail_tm_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie =
      "mail_tm_account=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    toast.success("Logged out successfully");
    router.push("/auth/login");
  };

  const handleExportAccounts = () => {
    const accounts = document.cookie
      .split("; ")
      .find((row) => row.startsWith("mail_tm_accounts="));
    if (accounts) {
      const now = new Date();
      const dateStr = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const fileName = `mail-tm-accounts_${dateStr}.json`;
      const accountsData = decodeURIComponent(accounts.split("=")[1]);
      const blob = new Blob([accountsData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Accounts exported successfully");
    } else {
      toast.error("No accounts to export");
    }
  };

  const handleImportAccounts = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          const accounts = JSON.parse(text);
          const expires = new Date(
            Date.now() + 24 * 60 * 60 * 1000
          ).toUTCString();
          document.cookie = `mail_tm_accounts=${JSON.stringify(
            accounts
          )}; path=/; expires=${expires}; SameSite=Strict; Secure`;
          toast.success("Accounts imported successfully");
          window.location.reload();
        } catch (e) {
          toast.error("Failed to import accounts");
          console.error("Import error:", e);
        }
      }
    };
    input.click();
  };

  return (
    <div className="flex flex-col h-full w-[240px] border-r bg-muted/10">
      <div className="p-4">
        <Logo />
      </div>
      <Separator />
      <ScrollArea className="flex-1 py-2">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Accounts
          </h2>
          <div className="space-y-1">
            {accounts.map((account) => (
              <Button
                key={account.email}
                variant={
                  currentAccount?.email === account.email
                    ? "secondary"
                    : "ghost"
                }
                className="w-full justify-start font-normal"
                onClick={() => handleAccountSwitch(account.email)}
              >
                <Mail className="mr-2 h-4 w-4" />
                {account.email}
              </Button>
            ))}
            <Link href="/auth/register" className="block mt-2">
              <Button
                variant="ghost"
                className="w-full justify-start font-normal"
              >
                <Mail className="mr-2 h-4 w-4" />
                Add Account
              </Button>
            </Link>
          </div>
        </div>
      </ScrollArea>
      <Separator />
      <div className="p-4 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleExportAccounts}
        >
          <ArrowUpFromLine className="mr-2 h-4 w-4" />
          Export Accounts
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleImportAccounts}
        >
          <ArrowDownToLine className="mr-2 h-4 w-4" />
          Import Accounts
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
