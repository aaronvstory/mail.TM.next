"use client";

import { EmailLayout } from "@/components/email-layout";
import { Sidebar } from "@/components/sidebar";

export default function DashboardPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1">
        <EmailLayout />
      </main>
    </div>
  );
}
