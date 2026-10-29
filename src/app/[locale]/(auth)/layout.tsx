import { TopBar } from "@/components/layout/top-bar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F3F6FA]">
      <TopBar />
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
