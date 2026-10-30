import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPinOff, Home } from "lucide-react";

export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-slate-50">
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#1853DB] flex items-center justify-center">
            <MapPinOff className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-md">
            <h1 className="text-3xl font-extrabold text-slate-900">
              404 - Page Not Found
            </h1>
            <p className="text-sm text-slate-500">
              The page you are looking for does not exist or has been moved.
            </p>
          </div>
          <Link href="/en">
            <Button variant="default" className="gap-2 bg-[#1853DB] hover:bg-blue-700 text-white">
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>
      </body>
    </html>
  );
}

