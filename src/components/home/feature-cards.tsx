"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { MapPin, CircleDollarSign, ShieldCheck } from "lucide-react";

export function FeatureCards() {
  const t = useTranslations("home");

  const features = [
    {
      title: t("feature1Title"),
      desc: t("feature1Desc"),
      icon: MapPin,
    },
    {
      title: t("feature2Title"),
      desc: t("feature2Desc"),
      icon: CircleDollarSign,
    },
    {
      title: t("feature3Title"),
      desc: t("feature3Desc"),
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
      {features.map((feat, index) => {
        const Icon = feat.icon;
        return (
          <div
            key={index}
            className="rounded-2xl border border-slate-100/80 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow"
          >
            {/* Vibrant Royal Blue Icon Container matching Image 2 */}
            <div className="w-11 h-11 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-sm mb-4">
              <Icon className="w-5 h-5" />
            </div>
            {/* Title matching Image 2 */}
            <h3 className="text-base font-bold text-slate-900 mb-2">
              {feat.title}
            </h3>
            {/* Description matching Image 2 */}
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {feat.desc}
            </p>
          </div>
        );
      })}
    </section>
  );
}
