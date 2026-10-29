"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Fuel, ShieldCheck, AlertCircle } from "lucide-react";

export function FeatureCards() {
  const t = useTranslations("home");

  const features = [
    {
      title: t("feature1Title"),
      desc: t("feature1Desc"),
      icon: MapPin,
      color: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    },
    {
      title: t("feature2Title"),
      desc: t("feature2Desc"),
      icon: Fuel,
      color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
    },
    {
      title: t("feature3Title"),
      desc: t("feature3Desc"),
      icon: ShieldCheck,
      color: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
    },
  ];

  return (
    <section className="space-y-8 py-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {t("featuresTitle")}
        </h2>
      </div>

      {/* 3 Main Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feat, index) => {
          const Icon = feat.icon;
          return (
            <Card
              key={index}
              className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300"
            >
              <CardContent className="p-7 space-y-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${feat.color}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feat.desc}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Non-Commercial Compliance Banner */}
      <div className="rounded-2xl border border-blue-100 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/30 p-5 sm:p-6 flex flex-col sm:flex-row items-start gap-4">
        <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/80 text-primary-700 dark:text-primary-300 shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            {t("disclaimerTitle")}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {t("disclaimerText")}
          </p>
        </div>
      </div>
    </section>
  );
}
