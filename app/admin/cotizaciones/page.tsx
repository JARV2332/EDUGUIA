"use client";

import { useMemo, useState } from "react";
import { Calculator, ExternalLink, Plus, Printer, Search, Sparkles, Trash2 } from "lucide-react";
import type { DiyProduct, QuoteLine } from "@/lib/cotizaciones/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function formatQ(value: number) {
  return `Q${value.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function newId() {
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function AdminCotizacionesPage() {
  const [prompt, setPrompt] = useState(
    "Kit de robótica para 10 estudiantes: 10 Arduino UNO, 20 LEDs, protoboard, cables jumper y 10 sensores ultrasónicos"
  );
  const [titulo, setTitulo] = useState("Paquete de robótica");
  const [cliente, setCliente] = useState("");
  const [notas, setNotas] = useState("");
  const [margenPct, setMargenPct] = useState("15");
  const [items, setItems] = useState<QuoteLine[]>([]);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<DiyProduct[]>([]);
  const [searchUrl, setSearchUrl] = useState<string | null>(null);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [usedAi, setUsedAi] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totals = useMemo(() => {
    const costo = items.reduce((sum, line) => sum + (line.product?.price ?? 0) * line.cantidad, 0);
    const margen = Number.parseFloat(margenPct);
    const pct = Number.isFinite(margen) ? margen : 0;
    const extra = costo * (pct / 100);
    return { costo, extra, total: costo + extra, pct };
  }, [items, margenPct]);

  const updateLine = (id: string, patch: Partial<QuoteLine>) => {
    setItems((prev) => prev.map((line) => (line.id === id ? { ...line, ...patch } : line)));
  };

  const handleGenerate = async () => {
    setLoadingGenerate(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/cotizaciones/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, margenPct: Number.parseFloat(margenPct) || 0 }),
      });
      const data = (await res.json()) as {
        error?: string;
        titulo?: string;
        cliente?: string;
        notas?: string;
        items?: QuoteLine[];
        usedAi?: boolean;
      };
      if (!res.ok) {
        setError(data.error ?? "No se pudo generar la cotización");
        return;
      }
      setTitulo(data.titulo || "Paquete de robótica");
      if (data.cliente) setCliente(data.cliente);
      if (data.notas) setNotas(data.notas);
      setItems(data.items ?? []);
      setUsedAi(Boolean(data.usedAi));
    } catch {
      setError("Error de red al generar la cotización");
    } finally {
      setLoadingGenerate(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = searchQ.trim();
    if (q.length < 2) return;
    setLoadingSearch(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/cotizaciones/search?q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as { error?: string; products?: DiyProduct[]; searchUrl?: string };
      if (!res.ok) {
        setError(data.error ?? "No se pudo buscar");
        setSearchResults([]);
        return;
      }
      setSearchResults(data.products ?? []);
      setSearchUrl(data.searchUrl ?? null);
    } catch {
      setError("Error de red al buscar en Electrónica DIY");
    } finally {
      setLoadingSearch(false);
    }
  };

  const addProduct = (product: DiyProduct, cantidad = 1) => {
    setItems((prev) => [
      ...prev,
      {
        id: newId(),
        query: searchQ || product.title,
        cantidad,
        product,
        alternatives: searchResults,
      },
    ]);
  };

  return (
    <div className="p-6 lg:p-8 print:p-0">
      <header className="mb-8 print:hidden">
        <h1 className="text-3xl font-bold">Cotizaciones</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Describe el paquete y la IA arma la lista. Luego buscamos cada pieza en{" "}
          <a
            href="https://www.electronicadiy.com/es"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Electrónica DIY
          </a>{" "}
          con su mismo buscador (precios en quetzales).
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,22rem)_1fr] print:block">
        <div className="space-y-6 print:hidden">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Generar con IA
              </CardTitle>
              <CardDescription>
                Ejemplo: 10 Arduino UNO, 20 LEDs, protoboard y jumpers para un taller.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea rows={6} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Cliente / colegio</Label>
                  <Input value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Colegio…" />
                </div>
                <div className="space-y-2">
                  <Label>Margen %</Label>
                  <Input
                    type="number"
                    min={0}
                    step="1"
                    value={margenPct}
                    onChange={(e) => setMargenPct(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
              </div>
              <Button className="w-full" onClick={() => void handleGenerate()} disabled={loadingGenerate}>
                <Calculator className="mr-2 h-4 w-4" />
                {loadingGenerate ? "Buscando precios…" : "Generar cotización"}
              </Button>
              {usedAi === false && items.length > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Se armó con reglas locales (sin Groq). Agrega GROQ_API_KEY en .env.local para la IA.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Buscar en la tienda
              </CardTitle>
              <CardDescription>Concatena la búsqueda como en su web: Arduino* uno**</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form className="flex gap-2" onSubmit={(e) => void handleSearch(e)}>
                <Input
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="LED, Arduino UNO, protoboard…"
                />
                <Button type="submit" variant="secondary" disabled={loadingSearch}>
                  {loadingSearch ? "…" : "Buscar"}
                </Button>
              </form>
              {searchUrl ? (
                <a href={searchUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm underline">
                  Ver en Electrónica DIY <ExternalLink className="h-3 w-3" />
                </a>
              ) : null}
              <div className="max-h-80 space-y-2 overflow-auto">
                {searchResults.map((product) => (
                  <div key={`${product.id}`} className="flex items-start justify-between gap-2 rounded-lg border p-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{product.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatQ(product.price)}
                        {!product.available ? " · agotado" : ""}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => addProduct(product)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="print:border-0 print:shadow-none">
          <CardHeader className="print:px-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>{titulo || "Cotización"}</CardTitle>
                <CardDescription>
                  {cliente ? `Para: ${cliente}` : "Sin cliente"} · Precios de Electrónica DIY
                </CardDescription>
              </div>
              <div className="flex gap-2 print:hidden">
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimir
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 print:px-0">
            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aún no hay líneas. Genera con IA o agrega productos.</p>
            ) : (
              <div className="space-y-3">
                {items.map((line) => {
                  const unit = line.product?.price ?? 0;
                  return (
                    <div key={line.id} className="rounded-xl border p-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{line.product?.title ?? `Sin match: ${line.query}`}</p>
                          <p className="text-xs text-muted-foreground">Búsqueda: {line.query}</p>
                          {line.product ? (
                            <a
                              href={line.product.url}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1 inline-flex items-center gap-1 text-xs underline"
                            >
                              Ver producto <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <Badge variant="outline" className="mt-1">
                              No encontrado
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 print:hidden">
                          <Input
                            className="w-20"
                            type="number"
                            min={1}
                            value={line.cantidad}
                            onChange={(e) =>
                              updateLine(line.id, { cantidad: Math.max(1, Number.parseInt(e.target.value, 10) || 1) })
                            }
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setItems((prev) => prev.filter((item) => item.id !== line.id))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {line.alternatives.length > 1 ? (
                        <div className="mt-3 print:hidden">
                          <Select
                            value={line.product ? String(line.product.id) : ""}
                            onValueChange={(value) => {
                              const next = line.alternatives.find((alt) => String(alt.id) === value);
                              if (next) updateLine(line.id, { product: next });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Elegir otro resultado" />
                            </SelectTrigger>
                            <SelectContent>
                              {line.alternatives.map((alt) => (
                                <SelectItem key={String(alt.id)} value={String(alt.id)}>
                                  {alt.title} · {formatQ(alt.price)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : null}
                      <div className="mt-2 flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {line.cantidad} × {formatQ(unit)}
                        </span>
                        <span className="font-medium">{formatQ(unit * line.cantidad)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <span>Costo tienda</span>
                <span>{formatQ(totals.costo)}</span>
              </div>
              <div className="flex justify-between">
                <span>Margen ({totals.pct}%)</span>
                <span>{formatQ(totals.extra)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatQ(totals.total)}</span>
              </div>
            </div>

            <div className="space-y-2 print:hidden">
              <Label>Notas</Label>
              <Textarea
                rows={3}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Validez, envío, IVA, armado del kit…"
              />
            </div>
            {notas ? <p className="hidden text-sm print:block">{notas}</p> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
