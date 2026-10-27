export type DiyProduct = {
  id: number | string;
  title: string;
  handle: string;
  price: number;
  compareAt: number | null;
  image: string | null;
  available: boolean;
  url: string;
  searchUrl: string;
};

export type QuoteNeed = {
  query: string;
  cantidad: number;
  notas?: string;
};

export type QuoteLine = {
  id: string;
  query: string;
  cantidad: number;
  notas?: string;
  product: DiyProduct | null;
  alternatives: DiyProduct[];
};

export type QuoteDraft = {
  id?: string;
  numero?: number | null;
  titulo: string;
  cliente: string;
  leyenda: string;
  descripcion: string;
  incluye: string;
  validez: string;
  notas: string;
  margenPct: number;
  precioVenta: number;
  items: QuoteLine[];
};

export type SavedQuote = QuoteDraft & {
  id: string;
  numero: number;
  costo: number;
  ganancia: number;
  estado: string;
  created_at: string;
};
