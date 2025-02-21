"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import {
  Inbox,
  Send,
  Trash2,
  RefreshCcw,
  ArrowLeft,
  Search,
  DownloadCloud,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getMessage } from "@/lib/mail-tm/client";
import AccountSwitcher from "./account-switcher";
import { toast } from "sonner";

interface Email {
  id: string;
  from: {
    address: string;
    name?: string;
  };
  to: Array<{
    address: string;
    name?: string;
  }>;
  subject: string;
  intro: string;
  text?: string;
  html?: string;
  createdAt: string;
  seen: boolean;
}

export interface EmailLayoutHandle {
  fetchEmails: () => Promise<void>;
}

const formatSender = (from: { address: string; name?: string }) => {
  if (from.name && from.name !== from.address) {
    return `${from.name} <${from.address}>`;
  }
  return from.address;
};

export const EmailLayout = forwardRef<EmailLayoutHandle, {}>((props, ref) => {
  const [currentEmail, setCurrentEmail] = useState<Email | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEmails, setFilteredEmails] = useState<Email[]>([]);
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);

  useEffect(() => {
    // Get current account from cookie
    const accountCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("mail_tm_account="));
    if (accountCookie) {
      try {
        const accountData = JSON.parse(
          decodeURIComponent(accountCookie.split("=")[1])
        );
        setCurrentAccount(accountData.email);
      } catch (e) {
        console.error("Error parsing account data:", e);
      }
    }
  }, []);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("mail_tm_token="))
        ?.split("=")[1];

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("https://api.mail.tm/messages", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch emails");
      }

      const data = await response.json();
      const fetchedEmails = data["hydra:member"];
      setEmails(fetchedEmails);
      filterEmails(fetchedEmails, searchQuery);
    } catch (error) {
      console.error("Failed to fetch emails:", error);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    fetchEmails,
  }));

  useEffect(() => {
    fetchEmails();
    const interval = setInterval(fetchEmails, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleEmailClick = async (email: Email) => {
    try {
      const fullEmail = await getMessage(email.id);
      setCurrentEmail(fullEmail);
    } catch (error) {
      console.error("Failed to fetch email content:", error);
    }
  };

  const filterEmails = (emailsToFilter: Email[], query: string) => {
    if (!query.trim()) {
      setFilteredEmails(emailsToFilter);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = emailsToFilter.filter((email) => {
      const searchableText = [
        email.subject,
        email.intro,
        formatSender(email.from),
        ...email.to.map(formatSender),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(lowercaseQuery);
    });

    setFilteredEmails(filtered);
  };

  useEffect(() => {
    filterEmails(emails, searchQuery);
  }, [searchQuery, emails]);

  if (currentEmail) {
    return (
      <div className="flex-1 p-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => setCurrentEmail(null)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inbox
        </Button>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">{currentEmail.subject}</h1>
            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              <p>From: {formatSender(currentEmail.from)}</p>
              <p>To: {currentEmail.to.map(formatSender).join(", ")}</p>
              <p>
                {new Date(currentEmail.createdAt).toLocaleString(undefined, {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>
          <Separator />
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {currentEmail.html ? (
              <div
                dangerouslySetInnerHTML={{ __html: currentEmail.html }}
                className="email-content"
              />
            ) : (
              <pre className="whitespace-pre-wrap font-sans">
                {currentEmail.text || currentEmail.intro}
              </pre>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <AccountSwitcher
          accounts={[{ label: "Current Account", email: currentAccount || "" }]}
          currentEmail={currentAccount}
        />
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8"
            />
            {searchQuery && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {filteredEmails.length} results
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEmails}
            disabled={loading}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4">
        <Tabs defaultValue="inbox" className="h-full">
          <TabsList>
            <TabsTrigger value="inbox">
              <Inbox className="h-4 w-4 mr-2" />
              Inbox
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inbox" className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center h-[400px]">
                <p className="text-sm text-muted-foreground">
                  Loading emails...
                </p>
              </div>
            ) : filteredEmails.length === 0 && searchQuery ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <h3 className="text-base font-semibold mb-1">
                  No matching emails
                </h3>
                <p className="text-sm text-muted-foreground">
                  Try different search terms
                </p>
              </div>
            ) : emails.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <h3 className="text-base font-semibold mb-1">No emails yet</h3>
                <p className="text-sm text-muted-foreground">
                  Your inbox is empty. Emails will appear here when you receive
                  them.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchEmails}
                  className="mt-4"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Check for new emails
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-220px)]">
                <div className="space-y-4">
                  {(searchQuery ? filteredEmails : emails).map((email) => (
                    <Card
                      key={email.id}
                      className={`cursor-pointer hover:bg-muted/50 ${
                        !email.seen ? "border-l-4 border-l-primary" : ""
                      }`}
                      onClick={() => handleEmailClick(email)}
                    >
                      <CardHeader>
                        <CardTitle
                          className={`text-base ${
                            !email.seen ? "font-bold" : ""
                          }`}
                        >
                          {email.subject}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          From: {formatSender(email.from)}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{email.intro}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(email.createdAt).toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
});
