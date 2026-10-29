import { setRequestLocale } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";

export default async function ChatListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Coordination Chat</h1>
        <p className="text-sm text-slate-500">
          Coordinate pickup points and timing with accepted riders and co-passengers.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
        <EmptyState
          icon="search"
          title="No active chat threads"
          description="When you book or offer a ride across Nashik, a dedicated coordination chat thread will appear here."
        />
      </div>
    </div>
  );
}
