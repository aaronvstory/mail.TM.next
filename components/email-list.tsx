"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

interface Email {
  id: string;
  from: {
    address: string;
    name?: string;
  };
  to: Array<{ address: string; name?: string }>;
  subject: string;
  intro: string;
  createdAt: string;
  seen: boolean;
}

interface EmailListProps {
  emails: Email[];
  loading: boolean;
  onEmailClick: (email: Email) => void;
  onRefresh: () => void;
  searchQuery: string;
}

const formatSender = (from: { address: string; name?: string }) => {
  if (from.name && from.name !== from.address) {
    return `${from.name} <${from.address}>`;
  }
  return from.address;
};

export function EmailList({
  emails,
  loading,
  onEmailClick,
  onRefresh,
  searchQuery,
}: EmailListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">Loading emails...</p>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        {searchQuery ? (
          <>
            <h3 className="text-base font-semibold mb-1">No matching emails</h3>
            <p className="text-sm text-muted-foreground">
              Try different search terms
            </p>
          </>
        ) : (
          <>
            <h3 className="text-base font-semibold mb-1">No emails yet</h3>
            <p className="text-sm text-muted-foreground">
              Your temporary email is ready to receive messages
            </p>
          </>
        )}
        <Button
          variant="outline"
          size="sm"
          className="mt-3 min-w-[140px]"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCcw
            className={`h-3 w-3 mr-1 ${loading ? "animate-spin" : ""}`}
          />
          Check for new emails
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full pr-4">
      <div className="space-y-2">
        {emails.map((email) => (
          <Card
            key={email.id}
            onClick={() => onEmailClick(email)}
            className={`
              relative
              cursor-pointer
              transition-colors
              hover:bg-muted/50
              ${!email.seen ? "pl-3 border-l-4 border-l-purple-600" : ""}
            `}
          >
            <CardHeader className="p-3">
              <CardTitle
                className={`text-base ${
                  !email.seen ? "font-bold" : "font-medium"
                }`}
              >
                {email.subject}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                From: {formatSender(email.from)}
              </p>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-sm text-muted-foreground">{email.intro}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(email.createdAt).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
