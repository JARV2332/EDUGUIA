"use client";

import { useState, type ReactNode } from "react";

export function FlipCard({
  front,
  back,
  label,
}: {
  front: ReactNode;
  back: ReactNode;
  label: string;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      type="button"
      className={`ek-flip ${flipped ? "is-flipped" : ""}`}
      aria-pressed={flipped}
      aria-label={`${label}. ${flipped ? "Ver el frente" : "Ver herramientas y proyectos"}`}
      onClick={() => setFlipped((value) => !value)}
    >
      <span className="ek-flip__inner">
        <span className="ek-flip__face ek-flip__front">{front}</span>
        <span className="ek-flip__face ek-flip__back">{back}</span>
      </span>
    </button>
  );
}
