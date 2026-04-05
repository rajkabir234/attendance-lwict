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
    <section className="app-section overflow-hidden fade-in">
      <div className="flex items-center justify-between gap-4 px-6 py-5">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-muted">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          {rightSlot ? <div>{rightSlot}</div> : null}

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="btn-base btn-outline h-10 w-10 rounded-full p-0"
            aria-label={isOpen ? "Collapse section" : "Expand section"}
            aria-expanded={isOpen}
          >
            <span className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>
              ˅
            </span>
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="border-t border-subtle px-6 py-6 slide-up">{children}</div>
      ) : null}
    </section>
  );
}