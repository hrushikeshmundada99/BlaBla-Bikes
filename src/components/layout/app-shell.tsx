"use client";

import * as React from "react";
import { TopBar } from "@/components/layout/top-bar";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Footer } from "@/components/layout/footer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 dark:bg-slate-950">
      {/* Fixed Header */}
      <TopBar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* Main App Container */}
      <div className="flex-1 flex w-full">
        {/* Left Sidebar (Desktop fixed, Mobile overlay) */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Content Area offset by desktop sidebar width */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-12">
            {children}
          </main>
          <Footer />
        </div>
      </div>

      {/* Mobile Bottom Tab Navigation */}
      <MobileNav />
    </div>
  );
}
