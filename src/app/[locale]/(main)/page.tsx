import { HeroSearch } from "@/components/home/hero-search";
import { FeatureCards } from "@/components/home/feature-cards";
import { setRequestLocale } from "next-intl/server";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="space-y-10">
      <HeroSearch />
      <FeatureCards />
    </div>
  );
}

