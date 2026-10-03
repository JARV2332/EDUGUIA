"use client";

import { useEffect, useRef, useState } from "react";

export function GearCursor() {
  const node = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [hot, setHot] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.querySelector(".ek-site");
    if (!fine || reduce || !root) return;

    setReady(true);
    root.classList.add("ek-has-cursor");

    let frame = 0;
    const move = (event: MouseEvent) => {
      const x = event.clientX;
      const y = event.clientY;
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (node.current) node.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
    };

    const over = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const field = target.closest("input, textarea, select");
      const interactive = target.closest("a, button, summary, [role='tab']");
      setHot(Boolean(interactive) && !field);
      if (node.current) node.current.style.opacity = field ? "0" : "1";
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      if (frame) window.cancelAnimationFrame(frame);
      root.classList.remove("ek-has-cursor");
    };
  }, []);

  if (!ready) return null;

  return (
    <div ref={node} className={`ek-gear ${hot ? "is-hot" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    </div>
  );
}
