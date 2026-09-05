"use client";

import { useEffect, useMemo, useState } from "react";
import { Calculator, ExternalLink, FileDown, Plus, Save, Search, Sparkles, Trash2 } from "lucide-react";
import type { DiyProduct, QuoteLine, SavedQuote } from "@/lib/cotizaciones/types";
import { downloadQuotePdf } from "@/lib/cotizaciones/export-pdf";
import { computeQuoteMoney, costoFromItems, formatQ, formatQuoteNumber, ventaDesdeMargen } from "@/lib/cotizaciones/totals";
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

function newId() {
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function AdminCotizacionesPage() {
  const [saved, setSaved] = useState<SavedQuote[]>([]);
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [quoteNumero, setQuoteNumero] = useState<number | null>(null);
  const [prompt, setPrompt] = useState(
    "10 Arduino UNO, 20 LEDs, protoboard, cables jumper y 10 sensores ultrasónicos"
  );
  const [leyenda, setLeyenda] = useState(
    "Kit de robótica para 10 estudiantes: cada uno arma un robot básico y practica programación."
  );
  const [titulo, setTitulo] = useState("Kit de robótica");
  const [cliente, setCliente] = useState("");
  const [notas, setNotas] = useState("");
  const [margenPct, setMargenPct] = useState("25");
  const [precioVenta, setPrecioVenta] = useState("");
  const [items, setItems] = useState<QuoteLine[]>([]);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<DiyProduct[]>([]);
  const [searchUrl, setSearchUrl] = useState<string | null>(null);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [saving, setSaving] = useState(false);
  const [usedAi, setUsedAi] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const totals = useMemo(() => {
    const costo = costoFromItems(items);
    const venta = Number.parseFloat(precioVenta);
    return computeQuoteMoney(costo, Number.isFinite(venta) ? venta : 0);
  }, [items, precioVenta]);

  const loadSaved = async () => {
    const res = await fetch("/api/admin/cotizaciones");
    const data = (await res.json()) as { cotizaciones?: SavedQuote[]; error?: string };
    if (res.ok) setSaved((data.cotizaciones ?? []) as SavedQuote[]);
  };

  useEffect(() => {
    void loadSaved();
  }, []);

  const updateLine = (id: string, patch: Partial<QuoteLine>) => {
    setItems((prev) => prev.map((line) => (line.id === id ? { ...line, ...patch } : line)));
  };

  const applyMargen = (pctRaw: string) => {
    setMargenPct(pctRaw);
    const pct = Number.parseFloat(pctRaw);
    const costo = costoFromItems(items);
    if (Number.isFinite(pct)) setPrecioVenta(ventaDesdeMargen(costo, pct).toFixed(2));
  };

  const handleGenerate = async () => {
    setLoadingGenerate(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/cotizaciones/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          leyenda,
          margenPct: Number.parseFloat(margenPct) || 0,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        titulo?: string;
        cliente?: string;
        leyenda?: string;
        notas?: string;
        items?: QuoteLine[];
        usedAi?: boolean;
        aiError?: string | null;
      };
      if (!res.ok) {
        setError(data.error ?? "No se pudo generar la cotización");
        return;
      }
      setTitulo(data.titulo || "Kit de robótica");
      if (data.cliente) setCliente(data.cliente);
      if (data.leyenda) setLeyenda(data.leyenda);
      if (data.notas) setNotas(data.notas);
      const nextItems = data.items ?? [];
      setItems(nextItems);
      setUsedAi(Boolean(data.usedAi));
      if (data.aiError && !data.usedAi) {
        setMessage(`IA: ${data.aiError}`);
      }
      const costo = costoFromItems(nextItems);
      const pct = Number.parseFloat(margenPct) || 0;
      setPrecioVenta(ventaDesdeMargen(costo, pct).toFixed(2));
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

  const addProduct = (product: DiyProduct) => {
    setItems((prev) => [
      ...prev,
      {
        id: newId(),
        query: searchQ || product.title,
        cantidad: 1,
        product,
        alternatives: searchResults,
      },
    ]);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    const res = await fetch("/api/admin/cotizaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: quoteId,
        titulo,
        cliente,
        leyenda,
        notas,
        precioVenta: totals.precioVenta,
        items,
      }),
    });
    const data = (await res.json()) as { error?: string; cotizacion?: { id: string; numero: number } };
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo guardar");
      return;
    }
    setQuoteId(data.cotizacion?.id ?? null);
    setQuoteNumero(data.cotizacion?.numero ?? null);
    setMessage(`Guardada ${formatQuoteNumber(data.cotizacion?.numero)}`);
    await loadSaved();
  };

  const openSaved = (row: SavedQuote) => {
    setQuoteId(row.id);
    setQuoteNumero(row.numero);
    setTitulo(row.titulo);
    setCliente(row.cliente);
    setLeyenda(row.leyenda ?? "");
    setNotas(row.notas ?? "");
    setItems(Array.isArray(row.items) ? row.items : []);
    setPrecioVenta(String(row.precioVenta ?? (row as unknown as { precio_venta?: number }).precio_venta ?? 0));
    setMargenPct(String(row.margenPct ?? (row as unknown as { margen_pct?: number }).margen_pct ?? 0));
  };

  const resetDraft = () => {
    setQuoteId(null);
    setQuoteNumero(null);
    setItems([]);
    setCliente("");
    setMessage(null);
  };

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Cotizaciones</h1>
          <p className="mt-2 text-muted-foreground">
            Describes el kit, buscamos en Electrónica DIY el costo y tú pones el precio de venta.
          </p>
        </div>
        <Badge variant="secondary">{saved.length} cotizaciones</Badge>
      </header>

      {saved.length > 0 ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Historial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {saved.slice(0, 8).map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => openSaved(row)}
                className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm hover:bg-muted"
              >
                <span>
                  {formatQuoteNumber(row.numero)} · {row.titulo}
                  {row.cliente ? ` — ${row.cliente}` : ""}
                </span>
                <span className="text-muted-foreground">
                  {formatQ(Number((row as unknown as { precio_venta?: number }).precio_venta ?? row.precioVenta ?? 0))}
                </span>
              </button>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,22rem)_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Armar kit
              </CardTitle>
              <CardDescription>Leyenda comercial + lista de materiales. La IA busca precios en DIY.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Leyenda del kit</Label>
                <Textarea rows={3} value={leyenda} onChange={(e) => setLeyenda(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Materiales / cantidades</Label>
                <Textarea rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Input value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Colegio…" />
                </div>
                <div className="space-y-2">
                  <Label>Margen %</Label>
                  <Input type="number" min={0} step="1" value={margenPct} onChange={(e) => applyMargen(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
              </div>
              <Button className="w-full" onClick={() => void handleGenerate()} disabled={loadingGenerate}>
                <Calculator className="mr-2 h-4 w-4" />
                {loadingGenerate ? "Buscando en DIY…" : "Generar con precios DIY"}
              </Button>
              {usedAi === true ? (
                <p className="text-xs text-emerald-700">Armado con IA (Groq) + precios de Electrónica DIY.</p>
              ) : usedAi === false && items.length > 0 ? (
                <p className="text-xs text-amber-700">Se usó el modo local porque Groq no respondió.</p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Buscar pieza
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form className="flex gap-2" onSubmit={(e) => void handleSearch(e)}>
                <Input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="LED, Arduino UNO…" />
                <Button type="submit" variant="secondary" disabled={loadingSearch}>
                  {loadingSearch ? "…" : "Buscar"}
                </Button>
              </form>
              {searchUrl ? (
                <a href={searchUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm underline">
                  Ver en Electrónica DIY <ExternalLink className="h-3 w-3" />
                </a>
              ) : null}
              <div className="max-h-72 space-y-2 overflow-auto">
                {searchResults.map((product) => (
                  <div key={`${product.id}`} className="flex items-start justify-between gap-2 rounded-lg border p-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{product.title}</p>
                      <p className="text-sm text-muted-foreground">{formatQ(product.price)}</p>
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

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>{formatQuoteNumber(quoteNumero)} · {titulo || "Cotización"}</CardTitle>
                <CardDescription>{cliente ? `Para: ${cliente}` : "Sin cliente"}</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={resetDraft}>Nueva</Button>
                <Button variant="outline" onClick={() => void handleSave()} disabled={saving || items.length === 0}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Guardando…" : "Guardar"}
                </Button>
                <Button
                  variant="outline"
                  disabled={items.length === 0}
                  onClick={() =>
                    downloadQuotePdf({
                      numero: quoteNumero,
                      titulo,
                      cliente,
                      leyenda,
                      notas,
                      items,
                      precioVenta: totals.precioVenta,
                    })
                  }
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

            {leyenda ? <p className="rounded-lg bg-muted p-3 text-sm">{leyenda}</p> : null}

            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">Genera el kit o agrega productos.</p>
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
                            <a href={line.product.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs underline">
                              Ver producto <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <Badge variant="outline" className="mt-1">No encontrado</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            className="w-20"
                            type="number"
                            min={1}
                            value={line.cantidad}
                            onChange={(e) => {
                              updateLine(line.id, { cantidad: Math.max(1, Number.parseInt(e.target.value, 10) || 1) });
                            }}
                          />
                          <Button size="icon" variant="ghost" onClick={() => setItems((prev) => prev.filter((item) => item.id !== line.id))}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {line.alternatives.length > 1 ? (
                        <div className="mt-3">
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

            <div className="space-y-3 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span>Costo DIY (compra)</span>
                <span>{formatQ(totals.costo)}</span>
              </div>
              <div className="space-y-2">
                <Label>Precio que das al cliente (Q)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={precioVenta}
                  onChange={(e) => setPrecioVenta(e.target.value)}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span>Ganancia</span>
                <span className={totals.ganancia >= 0 ? "text-emerald-700" : "text-destructive"}>
                  {formatQ(totals.ganancia)} ({totals.margenPct.toFixed(1)}%)
                </span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span>Total al cliente</span>
                <span>{formatQ(totals.precioVenta)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea rows={3} value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Validez, envío, armado…" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
