import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { MapPinOff, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-5">
      <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950 text-primary-600 dark:text-primary-400 flex items-center justify-center">
        <MapPinOff className="w-8 h-8" />
      </div>
      <div className="space-y-2 max-w-md">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          404 - Page Not Found
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          The road you are looking for does not exist in Nashik or has been moved.
        </p>
      </div>
      <Link href="/">
        <Button variant="default" className="gap-2">
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </Button>
      </Link>
    </div>
  );
}

