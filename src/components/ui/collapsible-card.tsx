"use client";

import { ReactNode, useState } from "react";

type CollapsibleCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  rightSlot?: ReactNode;
};

export default function CollapsibleCard({
  title,
  subtitle,
  children,
  defaultOpen = true,
  rightSlot,
}: CollapsibleCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 px-6 py-5">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          {rightSlot ? <div>{rightSlot}</div> : null}

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-lg text-slate-700 transition hover:bg-slate-100"
            aria-label={isOpen ? "Collapse section" : "Expand section"}
            aria-expanded={isOpen}
          >
            <span className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>
              ˅
            </span>
          </button>
        </div>
      </div>

      {isOpen ? <div className="border-t border-slate-200 px-6 py-6">{children}</div> : null}
    </section>
  );
}