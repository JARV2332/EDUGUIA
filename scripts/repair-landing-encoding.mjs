/**
 * Repara textos con mojibake en tablas landing (UTF-8 guardado como Latin-1).
 * Uso: node --env-file=.env.local scripts/repair-landing-encoding.mjs
 */
import { createClient } from "@supabase/supabase-js";

function fixUtf8Mojibake(value) {
  if (typeof value !== "string" || !value.includes("Ã")) return value;
  try {
    const fixed = Buffer.from(value, "latin1").toString("utf8");
    if (fixed.includes("\uFFFD")) return value;
    return fixed;
  } catch {
    return value;
  }
}

function fixStrings(obj, keys) {
  const patch = {};
  let changed = false;
  for (const key of keys) {
    const next = fixUtf8Mojibake(obj[key] ?? "");
    if (next !== obj[key]) {
      patch[key] = next;
      changed = true;
    }
  }
  return { patch, changed };
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

let totalUpdates = 0;

async function repairTable(table, select, textKeys, idKey = "id") {
  const { data, error } = await supabase.from(table).select(select);
  if (error) {
    console.error(`${table}: lectura falló —`, error.message);
    return;
  }
  for (const row of data ?? []) {
    const { patch, changed } = fixStrings(row, textKeys);
    if (!changed) continue;
    const { error: upErr } = await supabase.from(table).update(patch).eq(idKey, row[idKey]);
    if (upErr) {
      console.error(`${table} ${row[idKey]}:`, upErr.message);
      continue;
    }
    totalUpdates += 1;
    console.log(`${table}: corregido ${row[idKey]}`);
  }
}

async function repairPortafolioImagenes() {
  const { data, error } = await supabase.from("landing_portafolio").select("id, imagenes");
  if (error) {
    console.error("landing_portafolio imagenes:", error.message);
    return;
  }
  for (const row of data ?? []) {
    if (!Array.isArray(row.imagenes)) continue;
    let changed = false;
    const imagenes = row.imagenes.map((item) => {
      if (!item || typeof item !== "object") return item;
      const alt = fixUtf8Mojibake(item.alt ?? "");
      if (alt !== item.alt) changed = true;
      return { ...item, alt };
    });
    if (!changed) continue;
    const { error: upErr } = await supabase.from("landing_portafolio").update({ imagenes }).eq("id", row.id);
    if (upErr) {
      console.error(`landing_portafolio ${row.id} imagenes:`, upErr.message);
      continue;
    }
    totalUpdates += 1;
    console.log(`landing_portafolio: corregidas imágenes ${row.id}`);
  }
}

await repairTable(
  "landing_home",
  "id, hero_tagline, hero_headline, hero_text, hero_btn_text, about_paragraph_1, about_paragraph_2, enfoque_text, metodo_text, stat_1_label, stat_2_label, stat_3_label, stat_4_label",
  [
    "hero_tagline",
    "hero_headline",
    "hero_text",
    "hero_btn_text",
    "about_paragraph_1",
    "about_paragraph_2",
    "enfoque_text",
    "metodo_text",
    "stat_1_label",
    "stat_2_label",
    "stat_3_label",
    "stat_4_label",
  ]
);

await repairTable(
  "landing_contacto",
  "id, footer_text, copyright_text",
  ["footer_text", "copyright_text"]
);

await repairTable("landing_faq", "id, pregunta, respuesta", ["pregunta", "respuesta"]);
await repairTable("landing_galeria", "id, alt_text", ["alt_text"]);
await repairTable(
  "landing_portafolio",
  "id, etiqueta, titulo, descripcion",
  ["etiqueta", "titulo", "descripcion"]
);
await repairTable("landing_testimonios", "id, nombre, rol, texto", ["nombre", "rol", "texto"]);

await repairPortafolioImagenes();

console.log(`Listo. Filas actualizadas: ${totalUpdates}`);
