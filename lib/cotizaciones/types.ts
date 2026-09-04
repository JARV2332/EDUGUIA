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
  titulo: string;
  cliente: string;
  notas: string;
  margenPct: number;
  items: QuoteLine[];
};
