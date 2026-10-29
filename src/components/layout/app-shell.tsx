"use client";

import * as React from "react";
import { TopBar } from "@/components/layout/top-bar";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F6FA]">
      {/* Top Header Bar matching Image 2 */}
      <TopBar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex w-full">
        {/* Left Sidebar (Desktop fixed, Mobile collapsible) */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Content Area offset by desktop sidebar width (w-60 = 15rem = 240px) */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-60">
          <main className="flex-1 w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Tab Navigation */}
      <MobileNav />
    </div>
  );
}
