"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { edukidsWhatsAppUrl, ITE_BADGE, MAIN_NAV, PLATFORM_LINKS, type NavKey } from "@/lib/edukids/content";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cyan";

export function SiteHeader({ current }: { current?: NavKey }) {
  const [open, setOpen] = useState(false);
  const whatsapp = edukidsWhatsAppUrl();

  return (
    <header className="sticky top-0 z-40 border-b border-brand-darkblue/10 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className={`shrink-0 ${focusRing} rounded-md`} aria-label="EDUKIDS - Inicio">
            <img
              src="/assets/logo-edukids.png"
              alt="EDUKIDS"
              width={140}
              height={56}
              className="h-12 w-auto object-contain sm:h-14"
            />
          </Link>

          <nav className="ml-auto hidden items-center gap-1 xl:flex" aria-label="Principal">
            {MAIN_NAV.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                aria-current={current === item.key ? "page" : undefined}
                className={`rounded-full px-3 py-2 text-sm font-medium text-brand-darkblue/80 transition hover:bg-brand-light hover:text-brand-darkblue ${focusRing} ${
                  current === item.key ? "bg-brand-cyan/10 text-brand-darkblue" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2 xl:ml-3">
            <a
              href={PLATFORM_LINKS.isabel}
              target="_blank"
              rel="noopener noreferrer"
              className={`ek-btn inline-flex items-center rounded-full border border-brand-darkblue/20 bg-white px-2.5 py-1.5 text-[11px] font-bold tracking-wide text-brand-darkblue sm:px-3 sm:text-xs ${focusRing}`}
            >
              ISABEL
            </a>
            <Link
              href="/eduguia"
              className={`ek-btn inline-flex items-center rounded-full bg-brand-cyan px-2.5 py-1.5 text-[11px] font-bold tracking-wide text-white sm:px-3 sm:text-xs ${focusRing}`}
            >
              EDUGUIA
            </Link>
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className={`ek-btn inline-flex items-center rounded-full bg-brand-yellow px-2.5 py-1.5 text-[11px] font-bold tracking-wide text-brand-darkblue sm:px-3 sm:text-xs ${focusRing}`}
            >
              Escríbenos
            </a>
            <button
              type="button"
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-darkblue/15 text-brand-darkblue xl:hidden ${focusRing}`}
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setOpen((value) => !value)}
            >
              <span className="sr-only">{open ? "Cerrar menú" : "Abrir menú"}</span>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <p className="text-[11px] leading-snug text-brand-darkblue/70 sm:text-xs">{ITE_BADGE}</p>
      </div>

      {open && (
        <nav id="site-menu" className="border-t border-brand-darkblue/10 bg-white px-4 py-3 xl:hidden" aria-label="Secciones">
          <ul className="mx-auto grid max-w-6xl gap-1 sm:grid-cols-2">
            {MAIN_NAV.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  aria-current={current === item.key ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`block rounded-xl px-3 py-3 text-sm font-semibold text-brand-darkblue hover:bg-brand-light ${focusRing} ${
                    current === item.key ? "bg-brand-cyan/10" : ""
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
