import { ExternalLink, FileText, Video } from "lucide-react";

export type ToolkitResourceLink = {
  label: string;
  href: string;
  type: "pdf" | "video" | "web";
};

export type ToolkitResourceSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  links?: ToolkitResourceLink[];
};

export type ToolkitResource = {
  id: string;
  titleEs: string;
  titleEn: string;
  descriptionEs: string;
  descriptionEn: string;
  sections: ToolkitResourceSection[];
};

export type ToolkitExternalResource = {
  id: string;
  titleKey: string;
  descKey: string;
  href: string;
  type: "pdf" | "video" | "web";
};

export const TOOLKIT_QUICK_RESOURCES: ToolkitResource[] = [
  {
    id: "breathing",
    titleEs: "Ejercicio de respiración profunda",
    titleEn: "Deep breathing exercise",
    descriptionEs: "Técnica 4-7-8 para calmar el sistema nervioso",
    descriptionEn: "4-7-8 technique to calm the nervous system",
    sections: [
      {
        heading: "Pasos (4-7-8)",
        bullets: [
          "Inhala por la nariz contando hasta 4.",
          "Sostén la respiración contando hasta 7.",
          "Exhala lentamente por la boca contando hasta 8.",
          "Repite 3 a 4 ciclos. Hazlo sentado y en un lugar tranquilo.",
        ],
      },
      {
        heading: "Recursos",
        links: [
          {
            label: "Video: respiración diafragmática (UNICEF)",
            href: "https://www.youtube.com/watch?v=kgA9R8C3QY4",
            type: "video",
          },
          {
            label: "Guía bienestar infantil (UNICEF)",
            href: "https://www.unicef.org/parenting/mental-health",
            type: "web",
          },
        ],
      },
    ],
  },
  {
    id: "quiet-space",
    titleEs: "Protocolo de espacio tranquilo",
    titleEn: "Quiet space protocol",
    descriptionEs: "Pasos para crear un ambiente calmado en el aula o en casa",
    descriptionEn: "Steps to create a calm environment in class or at home",
    sections: [
      {
        heading: "En el aula",
        bullets: [
          "Designa un rincón visible con poca estimulación (luz tenue, pocos objetos).",
          "Establece una señal acordada para ir al espacio (tarjeta, gesto).",
          "Permite 3–5 minutos; el docente observa sin presionar conversación.",
          "Registra qué funcionó para la próxima vez.",
        ],
      },
      {
        heading: "En casa",
        bullets: [
          "Elige un lugar fijo (sillón, cojines en un rincón).",
          "Ten a mano: audífonos, pelota antiestrés, manta ligera.",
          "Evita pantallas durante la pausa; prioriza respiración o música suave.",
        ],
      },
      {
        heading: "Recursos",
        links: [
          {
            label: "Educación inclusiva — UNICEF Guatemala",
            href: "https://www.unicef.org/guatemala/educacion",
            type: "web",
          },
          {
            label: "DUA — CAST (en inglés)",
            href: "https://udlguidelines.cast.org/",
            type: "web",
          },
        ],
      },
    ],
  },
  {
    id: "emergency",
    titleEs: "Contactos de emergencia",
    titleEn: "Emergency contacts",
    descriptionEs: "Números útiles en Guatemala y apoyo escolar",
    descriptionEn: "Useful numbers in Guatemala and school support",
    sections: [
      {
        heading: "Emergencias Guatemala",
        bullets: [
          "Bomberos: 122 / 123",
          "Policía Nacional Civil: 110",
          "Cruz Roja: 125",
          "Ministerio de Educación (MINEDUC): consultas generales vía web oficial",
        ],
      },
      {
        heading: "Apoyo EduKids / EDUGUIA",
        bullets: [
          "WhatsApp EduKids: +502 5988 6915",
          "Correo: info@edukidsgt.com",
          "Coordina con el orientador o dirección de tu centro educativo para derivaciones especializadas.",
        ],
        links: [
          {
            label: "Escribir por WhatsApp",
            href: "https://wa.me/50259886915?text=Hola%2C%20necesito%20orientaci%C3%B3n%20sobre%20apoyo%20educativo.",
            type: "web",
          },
        ],
      },
    ],
  },
  {
    id: "timeout",
    titleEs: "Guías de tiempo fuera",
    titleEn: "Time-out guidelines",
    descriptionEs: "Descanso estructurado (no castigo)",
    descriptionEn: "Structured break (not punishment)",
    sections: [
      {
        heading: "Principios",
        paragraphs: [
          "El tiempo fuera es una pausa para regular emociones, no un castigo. Debe ser breve, predecible y en un espacio seguro.",
        ],
        bullets: [
          "Explica antes qué significa la pausa y cuánto dura (2–5 min).",
          "Usa un temporizador visual si es posible.",
          "Al terminar, retoma la actividad con una instrucción clara y positiva.",
          "Documenta patrones (hora, antecedente) para ajustar apoyos.",
        ],
      },
      {
        heading: "Recursos",
        links: [
          {
            label: "Apoyos conductuales positivos (PDF, OSEP)",
            href: "https://www.challengingbehavior.org/wp-content/uploads/2015/03/Brief-PBS-Overview.pdf",
            type: "pdf",
          },
        ],
      },
    ],
  },
];

export const TOOLKIT_EXTERNAL_RESOURCES: ToolkitExternalResource[] = [
  {
    id: "visual",
    titleKey: "toolkit.visualSupports",
    descKey: "toolkit.visualDesc",
    href: "https://www.autism.org.uk/advice-and-guidance/topics/communication/visual-supports",
    type: "web",
  },
  {
    id: "social",
    titleKey: "toolkit.socialStories",
    descKey: "toolkit.socialDesc",
    href: "https://carolgraysocialstories.com/social-stories/",
    type: "web",
  },
  {
    id: "sensory",
    titleKey: "toolkit.sensoryTools",
    descKey: "toolkit.sensoryDesc",
    href: "https://www.understood.org/en/articles/sensory-processing-issues-what-you-need-to-know",
    type: "web",
  },
  {
    id: "aac",
    titleKey: "toolkit.communicationBoards",
    descKey: "toolkit.communicationDesc",
    href: "https://www.afirm.fpg.unc.edu/afirm-module/augmentative-alternative-communication-aac",
    type: "web",
  },
  {
    id: "scratch",
    titleKey: "toolkit.scratchTitle",
    descKey: "toolkit.scratchDesc",
    href: "https://scratch.mit.edu/",
    type: "web",
  },
  {
    id: "inclusion-gt",
    titleKey: "toolkit.inclusionGtTitle",
    descKey: "toolkit.inclusionGtDesc",
    href: "https://www.unicef.org/guatemala/educacion",
    type: "web",
  },
];

export function linkIcon(type: ToolkitResourceLink["type"]) {
  if (type === "video") return Video;
  if (type === "pdf") return FileText;
  return ExternalLink;
}
