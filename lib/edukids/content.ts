import { ISABEL_APP_URL } from "@/lib/constants/isabel";
import { WHATSAPP_EDUKIDS_NUMERO } from "@/lib/landing/whatsapp";

export const ITE_BADGE =
  "EDUKIDS — Un programa de I.T.E. (Instituto de Tecnología & Educación)";

export const CONTACT_EMAIL = "info@edukidsgt.com";

export const FACEBOOK_URL = "https://www.facebook.com/edukidsguatemala/";
export const INSTAGRAM_URL = "https://www.instagram.com/edukids_gt/";

const WHATSAPP_MESSAGE =
  "Hola, quiero información sobre los programas de EDUKIDS (robótica, programación e IA).";

export function edukidsWhatsAppUrl(baseUrl?: string | null): string {
  const fallback = `https://wa.me/${WHATSAPP_EDUKIDS_NUMERO}`;
  const root = (baseUrl?.split("?")[0] || fallback).replace(/\/$/, "");
  return `${root}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
}

export const PLATFORM_LINKS = {
  isabel: ISABEL_APP_URL,
  eduguia: "/eduguia",
  ite: "/#que-es-edukids",
  contacto: "/comunicate-con-nosotros/",
  servicios: "/servicios/",
  galeria: "/galeria/",
  portafolio: "/portafolio/",
  faq: "/preguntas-frecuentes/",
} as const;

export type NavKey = "inicio" | "servicios" | "galeria" | "portafolio" | "faq" | "contacto";

export const MAIN_NAV: { key: NavKey; href: string; label: string }[] = [
  { key: "inicio", href: "/", label: "Inicio" },
  { key: "servicios", href: "/servicios/", label: "Servicios" },
  { key: "galeria", href: "/galeria/", label: "Galería" },
  { key: "portafolio", href: "/portafolio/", label: "Portafolio" },
  { key: "faq", href: "/preguntas-frecuentes/", label: "FAQ" },
  { key: "contacto", href: "/comunicate-con-nosotros/", label: "Contacto" },
];

export const STENAM_PILLARS = [
  {
    letter: "S",
    name: "Science",
    title: "Ciencia",
    summary: "Indagación y método científico.",
    detail:
      "Observar, preguntar, experimentar y concluir. Cada proyecto empieza con una hipótesis que los estudiantes ponen a prueba con evidencia.",
    tools: ["Bitácora", "Hipótesis", "Experimentos"],
    projects: "Ferias de ciencia y pruebas que se documentan con evidencia.",
  },
  {
    letter: "T",
    name: "Technology",
    title: "Tecnología",
    summary: "Programación, desarrollo web e IA.",
    detail:
      "De bloques visuales a Python, Next.js y Cursor. La tecnología se usa para construir productos, no solo para consumirlos.",
    tools: ["Scratch", "Python", "Next.js", "Cursor"],
    projects: "Juegos, sitios web y asistentes con instrucciones propias.",
  },
  {
    letter: "E",
    name: "Engineering",
    title: "Ingeniería",
    summary: "Electrónica, circuitos y robótica.",
    detail:
      "Diseñar, cablear y calibrar. Arduino, sensores y actuadores convierten una idea en un sistema que se mueve y responde.",
    tools: ["Arduino", "ESP8266", "Sensores", "Motores"],
    projects: "Robots que avanzan, esquivan y responden a una orden.",
  },
  {
    letter: "N",
    name: "Nature & Sustainability",
    title: "Naturaleza",
    summary: "Tecnología aplicada al medio ambiente y proyectos verdes.",
    detail:
      "Monitoreo ambiental, eficiencia y prototipos que cuidan el entorno. La ingeniería también resuelve problemas del planeta.",
    tools: ["Sensores ambientales", "Datos", "Prototipos verdes"],
    projects: "Estaciones que miden luz, humedad o calidad del aire.",
  },
  {
    letter: "A",
    name: "Arts & Design",
    title: "Arte y diseño",
    summary: "Diseños 3D y creatividad digital.",
    detail:
      "Forma, color y narrativa. Modelado tridimensional, identidad visual y experiencias que comunican una idea con claridad.",
    tools: ["Modelado 3D", "Impresión Ender", "Diseño"],
    projects: "Piezas, carcasas y personajes listos para fabricar.",
  },
  {
    letter: "M",
    name: "Mathematics",
    title: "Matemáticas",
    summary: "Algoritmos, pensamiento lógico y geometría en Minecraft.",
    detail:
      "Patrones, coordenadas y lógica. Las matemáticas se vuelven visibles cuando construyen mundos, miden y programan reglas.",
    tools: ["Minecraft Education", "Coordenadas", "Algoritmos"],
    projects: "Mundos medidos, recorridos y reglas que se pueden programar.",
  },
] as const;

export const LEARNING_AREAS = [
  {
    id: "coding",
    icon: "code" as const,
    title: "Coding",
    subtitle: "Programación y algoritmos",
    tools: ["Scratch", "Python", "Next.js", "Minecraft Education"],
    projects: "Videojuegos, páginas y mundos con lógica propia.",
  },
  {
    id: "circuits",
    icon: "zap" as const,
    title: "Circuits",
    subtitle: "Electrónica e ingeniería",
    tools: ["Arduino", "ESP8266", "Motores L298N", "Sensores"],
    projects: "Vehículos, alarmas y circuitos que reaccionan al entorno.",
  },
  {
    id: "maker",
    icon: "maker" as const,
    title: "Maker",
    subtitle: "Diseño 3D y fabricación",
    tools: ["Modelado 3D", "Impresión 3D Ender", "Prototipado"],
    projects: "Piezas a medida, carcasas y mecanismos imprimibles.",
  },
  {
    id: "ai",
    icon: "bot" as const,
    title: "AI + IoT & Smart Systems",
    subtitle: "Inteligencia artificial y sistemas conectados",
    tools: ["Cursor IDE", "Prompt engineering", "Automatización", "Servidores web"],
    projects: "Asistentes, tableros y sistemas que conectan sensores con la web.",
  },
  {
    id: "science",
    icon: "science" as const,
    title: "Science & EcoTech",
    subtitle: "Ciencia y tecnología verde",
    tools: ["Experimentos", "Monitoreo ambiental", "Datos"],
    projects: "Mediciones de luz, humedad y prototipos de tecnología verde.",
  },
] as const;

export const AUDIENCES = [
  {
    id: "exploradores",
    emoji: "👶",
    title: "Niños",
    range: "7 a 10 años",
    lead: "Minecraft Education, lógica y electrónica básica.",
    points: [
      "Juego con reglas: coordenadas, secuencias y causa-efecto.",
      "Primeros circuitos y robots que se arman con las manos.",
      "Proyectos cortos para sostener la curiosidad sin perder el juego.",
    ],
  },
  {
    id: "innovadores",
    emoji: "🚀",
    title: "Jóvenes",
    range: "11 a 17+ años",
    lead: "Programación con Cursor, robótica de competencia e IA.",
    points: [
      "De un prototipo escolar a un proyecto presentable.",
      "Código, sensores y modelos de IA en el mismo reto.",
      "Preparación para ferias, hackathons y equipos de robótica.",
    ],
  },
  {
    id: "colegios",
    emoji: "🏫",
    title: "Colegios e instituciones",
    range: "I.T.E.",
    lead: "Mallas curriculares, laboratorios STEAM y capacitación docente.",
    points: [
      "Ruta STENAM alineada al calendario del centro educativo.",
      "Acompañamiento para montar o activar el laboratorio.",
      "Formación docente para sostener la metodología en el aula.",
    ],
  },
  {
    id: "empresas",
    emoji: "🏢",
    title: "Empresas y adultos",
    range: "7 a 99 años",
    lead: "Workshops de IA y dinámicas de innovación.",
    points: [
      "Sesiones prácticas de inteligencia artificial aplicada al trabajo.",
      "Dinámicas de equipo que construyen, no solo escuchan.",
      "Alfabetización digital para quien quiere crear con tecnología.",
    ],
  },
] as const;

export type StoryCategory = "premios" | "proyectos" | "alianzas";

export type StoryItem = {
  id: string;
  category: StoryCategory;
  title: string;
  text: string;
  image: string;
  imageAlt: string;
};

export const STORY_FILTERS: { id: StoryCategory | "todos"; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "premios", label: "Premios & Competencias" },
  { id: "proyectos", label: "Proyectos de Alumnos" },
  { id: "alianzas", label: "Eventos Institucionales" },
];

/** Fotos reales del archivo EDUKIDS. Sin premios inventados. */
export const CURATED_STORIES: StoryItem[] = [
  {
    id: "prototipos",
    category: "proyectos",
    title: "Prototipos sobre la mesa",
    text: "Alumnos arman chasis, ejes y estructuras mientras documentan el reto.",
    image: "/wp-content/uploads/2021/09/imagen-2_optimized.png",
    imageAlt: "Grupo de estudiantes armando un prototipo con ruedas en un taller de EDUKIDS",
  },
  {
    id: "circuitos",
    category: "proyectos",
    title: "Circuitos y materiales",
    text: "Sesión de electrónica: papel, componentes y pruebas en equipo.",
    image: "/wp-content/uploads/2020/03/WhatsApp-Image-2019-12-02-at-12.44.15-AM.jpeg",
    imageAlt: "Estudiantes trabajando con materiales de un taller de circuitos",
  },
  {
    id: "exploradores-taller",
    category: "proyectos",
    title: "Exploradores construyendo",
    text: "Los más pequeños resuelven retos de forma, equilibrio y colaboración.",
    image: "/wp-content/uploads/2020/03/WhatsApp-Image-2019-12-02-at-12.44.20-AM.jpeg",
    imageAlt: "Niños y una docente en un taller práctico de EDUKIDS",
  },
  {
    id: "primeros-retos",
    category: "proyectos",
    title: "Primeros mecanismos",
    text: "Engranes, piezas y la pregunta de siempre: ¿cómo lo hago mover?",
    image: "/wp-content/uploads/2021/09/imagen-3_optimized.png",
    imageAlt: "Niña explorando un mecanismo armado con piezas de construcción",
  },
  {
    id: "taller-2019",
    category: "premios",
    title: "Taller de robótica en comunidad",
    text: "Así se vivió el encuentro de robótica del 18 de noviembre de 2019.",
    image: "/wp-content/uploads/2020/03/WhatsApp-Image-2019-12-02-at-12.44.13-AM.jpeg",
    imageAlt: "Pieza gráfica del taller de robótica EDUKIDS del 18 de noviembre de 2019",
  },
  {
    id: "feria-maker",
    category: "premios",
    title: "Listos para mostrar el proyecto",
    text: "Los prototipos del aula se preparan para ferias de tecnología e innovación.",
    image: "/wp-content/uploads/2020/03/WhatsApp-Image-2019-12-02-at-12.44.21-AM.jpeg",
    imageAlt: "Niños armando engranajes y ruedas en un taller de EDUKIDS",
  },
  {
    id: "familias",
    category: "alianzas",
    title: "Familias en el laboratorio",
    text: "Jornadas abiertas donde madres, padres y estudiantes construyen juntos.",
    image: "/wp-content/uploads/2021/09/imagen-1_optimized-3.png",
    imageAlt: "Familias reunidas en una jornada comunitaria de EDUKIDS",
  },
  {
    id: "plataforma",
    category: "alianzas",
    title: "Plataforma educativa EduKids",
    text: "El programa de I.T.E. conecta aula, seguimiento y herramientas digitales.",
    image: "/wp-content/uploads/2020/04/WhatsApp-Image-2020-04-03-at-6.01.50-PM.jpeg",
    imageAlt: "Pieza de la plataforma educativa EduKids en computadora, tablet y teléfono",
  },
];
