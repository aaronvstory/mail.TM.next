"use client";

import * as React from "react";
import {
  CaretSortIcon,
  CheckIcon,
  PlusCircledIcon,
} from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AuthForm } from "./auth/auth-form";
import { useState } from "react";
import { toast } from "sonner";

interface Account {
  label: string;
  email: string;
}

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

interface AccountSwitcherProps extends PopoverTriggerProps {
  accounts: Account[];
  currentEmail?: string | null;
  onEmailChange?: (email: string | null) => void;
}

export default function AccountSwitcher({
  className,
  accounts,
  currentEmail,
  onEmailChange,
}: AccountSwitcherProps) {
  const [open, setOpen] = React.useState(false);
  const [showDialog, setShowDialog] = React.useState(false);
  const [dialogMode, setDialogMode] = useState<"login" | "register">("login");

  const handleAddAccount = (mode: "login" | "register") => {
    setDialogMode(mode);
    setShowDialog(true);
    setOpen(false);
  };

  const handleAuthSuccess = () => {
    setShowDialog(false);
    toast.success(
      dialogMode === "login"
        ? "Successfully signed in"
        : "Account created successfully"
    );
  };

  return (
    <>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              aria-label="Select an account"
              className={cn("w-[200px] justify-between", className)}
            >
              <Avatar className="mr-2 h-5 w-5">
                <AvatarImage
                  src={`https://avatar.vercel.sh/${currentEmail}.png`}
                  alt={currentEmail ?? ""}
                />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
              {currentEmail ?? "Select account"}
              <CaretSortIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandList>
                <CommandInput placeholder="Search accounts..." />
                <CommandEmpty>No accounts found.</CommandEmpty>
                {accounts.length > 0 && (
                  <CommandGroup heading="Accounts">
                    {accounts.map((account) => (
                      <CommandItem
                        key={account.email}
                        onSelect={() => {
                          onEmailChange?.(account.email);
                          setOpen(false);
                        }}
                        className="text-sm"
                      >
                        <Avatar className="mr-2 h-5 w-5">
                          <AvatarImage
                            src={`https://avatar.vercel.sh/${account.email}.png`}
                            alt={account.email}
                          />
                          <AvatarFallback>SC</AvatarFallback>
                        </Avatar>
                        {account.email}
                        {currentEmail === account.email && (
                          <CheckIcon className="ml-auto h-4 w-4" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
              <CommandSeparator />
              <CommandList>
                <CommandGroup heading="Add Account">
                  <CommandItem
                    onSelect={() => handleAddAccount("login")}
                    className="cursor-pointer"
                  >
                    <PlusCircledIcon className="mr-2 h-5 w-5" />
                    Sign In with Existing Account
                  </CommandItem>
                  <CommandItem
                    onSelect={() => handleAddAccount("register")}
                    className="cursor-pointer"
                  >
                    <PlusCircledIcon className="mr-2 h-5 w-5" />
                    Create New Account
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "login" ? "Sign In" : "Create Account"}
            </DialogTitle>
          </DialogHeader>
          <AuthForm type={dialogMode} onSuccess={handleAuthSuccess} />
        </DialogContent>
      </Dialog>
    </>
  );
}
