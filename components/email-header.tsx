"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AccountSwitcher } from "./account-switcher";
import { Search, RefreshCcw, ArrowUpFromLine } from "lucide-react";
import { Input } from "@/components/ui/input";

export function EmailHeader({
  loading,
  onRefresh,
  onExport,
  searchQuery,
  onSearchChange,
  resultCount,
}: {
  loading: boolean;
  onRefresh: () => void;
  onExport: (format: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  resultCount?: number;
}) {
  return (
    <div className="w-full border-b border-border bg-background sticky top-0 z-10">
      <div className="mx-auto max-w-[1400px] w-full">
        <div className="grid grid-cols-[200px_1fr_220px] items-center gap-4 p-4">
          <div className="w-[200px] flex-shrink-0">
            <AccountSwitcher />
          </div>
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 h-9"
            />
            {searchQuery && resultCount !== undefined && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {resultCount} results
              </span>
            )}
          </div>
          <div className="flex items-center justify-end gap-2 w-[220px] flex-shrink-0">
            <Button
              variant="outline"
              className="h-9 w-[105px] flex-shrink-0"
              onClick={onRefresh}
              disabled={loading}
            >
              <div className="w-full flex items-center justify-center">
                <RefreshCcw
                  className={`h-4 w-4 mr-2 flex-shrink-0 ${
                    loading ? "animate-spin" : ""
                  }`}
                />
                <span className="flex-shrink-0">Refresh</span>
              </div>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-9 w-[105px] flex-shrink-0"
                >
                  <div className="w-full flex items-center justify-center">
                    <ArrowUpFromLine className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="flex-shrink-0">Export</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem onClick={() => onExport("html")}>
                  Export as HTML
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport("json")}>
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport("pdf")}>
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport("markdown")}>
                  Export as Markdown
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
