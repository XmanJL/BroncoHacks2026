"use client";

import { useEffect, useRef, useState } from "react";

type HeroSectionProps = {
  title: string;
  description: string;
};

export function HeroSection({ title, description }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [hasEnteredView, setHasEnteredView] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section || hasEnteredView) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setHasEnteredView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry?.isIntersecting) {
          setHasEnteredView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, [hasEnteredView]);

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-hidden rounded-4xl border border-white/20 bg-black/35 p-6 shadow-2xl shadow-black/40 backdrop-blur-md transition-all duration-700 ease-out sm:p-8 lg:p-10 ${
        hasEnteredView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      <div className="absolute inset-0 -z-10 rounded-4xl bg-[linear-gradient(140deg,rgba(0,238,255,0.08),transparent_35%,rgba(255,100,100,0.1),transparent_75%)]" />
      <div className="mx-auto flex max-w-3xl flex-col items-center space-y-5 text-center">
        <span className="inline-flex w-fit items-center rounded-full border border-cyan-200/40 bg-cyan-200/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
          BillyFit&apos;s Planner
        </span>
        <h1 className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
          {description}
        </p>
      </div>
    </section>
  );
}
