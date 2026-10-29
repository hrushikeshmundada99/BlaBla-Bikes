import Link from "next/link";

export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center p-6 text-center font-sans">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">404 - Page Not Found</h1>
          <p className="text-gray-600">The requested page could not be found.</p>
          <Link
            href="/en"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl font-medium"
          >
            Go to Home
          </Link>
        </div>
      </body>
    </html>
  );
}
