// src/data/mock-data.ts
// Compat layer robusto: espone gli stessi nomi usati dai componenti
// + aggiunge alias camelCase senza spazi, così non esplode nulla.

import touchpointsData from "./touchpoints";
import issuesData from "./issues";
import metricsData from "./metrics";
import chartsData from "./charts";

// === Tipi (esportiamo anche questi, così non cambi nei componenti)
export type Touchpoint = {
  id: string;
  Sezione: string;
  URL?: string | null;
  "Stato test"?: "non testato" | "testato" | "recheck" | "completato" | null;
  "# Problemi"?: number;
  "Link Frame Figma"?: string | null;

  // alias comodi (senza spazi/camelCase)
  section?: string;
  url?: string | null;
  statoTest?: "non testato" | "testato" | "recheck" | "completato" | null;
  status?: "non testato" | "testato" | "recheck" | "completato" | null;
  problemsCount?: number;
  figmaFrameUrl?: string | null;
};

export type Segnalazione = {
  id: number;
  Stato?: string | null;
  Sezione?: string | null;
  Tipologia?: string | null;
  "Descrizione problema rilevato"?: string | null;
  Risoluzione?: string | null;
  "WCAG 2.2"?: string | null;
  Note?: string | null;
  _sheet?: string;

  // alias
  status?: string | null;
  section?: string | null;
  type?: string | null;
  description?: string | null;
  solution?: string | null;
  wcag?: string | null;
  notes?: string | null;
};

// ==== Normalize helpers ====
const norm = (v: unknown) => (v === null || v === undefined ? null : String(v).trim());
const toInt = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
};
const slug = (s: string | null | undefined) =>
  (s || "")
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || Math.random().toString(36).slice(2);

// Touchpoint: aggiunge alias e valori di fallback
function normalizeTouchpoint(raw: any): Touchpoint {
  const sezione = norm(raw?.["Sezione"]) || norm(raw?.section) || "";
  const url = norm(raw?.["URL"]) ?? raw?.url ?? null;
  const stato =
    (norm(raw?.["Stato test"]) ||
      norm(raw?.statoTest) ||
      norm(raw?.status)) as Touchpoint["status"];
  const prob = toInt(raw?.["# Problemi"] ?? raw?.problemsCount);
  const figma = norm(raw?.["Link Frame Figma"]) ?? raw?.figmaFrameUrl ?? null;
  const id = String(raw?.id || slug(sezione));

  return {
    id,
    Sezione: sezione,
    URL: url,
    "Stato test": (stato as Touchpoint["Stato test"]) ?? null,
    "# Problemi": prob,
    "Link Frame Figma": figma,
    // alias
    section: sezione,
    url,
    statoTest: (stato as Touchpoint["Stato test"]) ?? null,
    status: (stato as Touchpoint["Stato test"]) ?? null,
    problemsCount: prob,
    figmaFrameUrl: figma,
  };
}

// Segnalazione: aggiunge alias coerenti
function normalizeIssue(raw: any): Segnalazione {
  const stato = norm(raw?.["Stato"]) ?? norm(raw?.status);
  const sezione = norm(raw?.["Sezione"]) ?? norm(raw?.section);
  const tipologia = norm(raw?.["Tipologia"]) ?? norm(raw?.type);
  const descr = norm(raw?.["Descrizione problema rilevato"]) ?? norm(raw?.description);
  const ris = norm(raw?.["Risoluzione"]) ?? norm(raw?.solution);
  const wcag = norm(raw?.["WCAG 2.2"]) ?? norm(raw?.wcag);
  const note = norm(raw?.["Note"]) ?? norm(raw?.notes);
  const id = toInt(raw?.id) || (raw?._id as number) || 0;

  return {
    id,
    Stato: stato,
    Sezione: sezione,
    Tipologia: tipologia,
    "Descrizione problema rilevato": descr,
    "Risoluzione": ris,
    "WCAG 2.2": wcag,
    Note: note,
    _sheet: norm(raw?._sheet) || undefined,
    // alias
    status: stato,
    section: sezione,
    type: tipologia,
    description: descr,
    solution: ris,
    wcag,
    notes: note,
  };
}

// Applicare normalizzazione ai dataset caricati dai moduli .ts
const touchpointsRaw: any[] = Array.isArray(touchpointsData) ? touchpointsData : [];
const issuesRaw: any[] = Array.isArray(issuesData) ? issuesData : [];

export const touchpoints: Touchpoint[] = touchpointsRaw.map(normalizeTouchpoint);
export const issues: Segnalazione[] = issuesRaw.map(normalizeIssue);

// Alias richiesti dai componenti esistenti:
export const mockTouchpoints = touchpoints;
export const mockSegnalazioni = issues;

// === KPI & Charts ===

// Se `metrics.ts` manca di qualcosa, calcolo dai touchpoint
function computeMetricsFromTP(tps: Touchpoint[]) {
  const counter = (st: string) =>
    tps.filter((t) => String(t.status ?? "").toLowerCase() === st).length;
  return {
    touchpoint_totali: tps.length,
    non_testato: counter("non testato"),
    testato: counter("testato"),
    recheck: counter("recheck"),
    completato: counter("completato"),
  };
}

export type KPIItem = { label: string; value: number };

export function getKPIData(): KPIItem[] {
  const m = metricsData && typeof metricsData === "object" ? metricsData : {};
  const fallback = computeMetricsFromTP(touchpoints);
  const tot = Number((m as any).touchpoint_totali ?? fallback.touchpoint_totali ?? touchpoints.length);
  const nonTestati = Number((m as any).non_testato ?? fallback.non_testato ?? 0);
  const recheck = Number((m as any).recheck ?? fallback.recheck ?? 0);
  const completati = Number((m as any).completato ?? fallback.completato ?? 0);
  return [
    { label: "Touchpoint totali", value: tot },
    { label: "Non testati", value: nonTestati },
    { label: "In recheck", value: recheck },
    { label: "Completati", value: completati },
  ];
}

export function getSegnalazioniPerSezione(): Array<{ label: string; value: number }> {
  const map = (chartsData as any)?.segnalazioni_per_sezione;
  if (map && typeof map === "object") {
    return Object.entries(map).map(([label, v]) => ({ label, value: Number(v) || 0 }));
  }
  // fallback: calcolo al volo dalle segnalazioni
  const agg = new Map<string, number>();
  for (const it of issues) {
    const key = it.section || "";
    if (!key) continue;
    agg.set(key, (agg.get(key) || 0) + 1);
  }
  return Array.from(agg, ([label, value]) => ({ label, value }));
}

export function getSegnalazioniPerTipologia(): Array<{ label: string; value: number }> {
  const map = (chartsData as any)?.segnalazioni_per_tipologia;
  if (map && typeof map === "object") {
    return Object.entries(map).map(([label, v]) => ({ label, value: Number(v) || 0 }));
  }
  const agg = new Map<string, number>();
  for (const it of issues) {
    const key = it.type || "";
    if (!key) continue;
    agg.set(key, (agg.get(key) || 0) + 1);
  }
  return Array.from(agg, ([label, value]) => ({ label, value }));
}

export function getCriteriWCAGPiuViolati(): Array<{ label: string; value: number }> {
  const map = (chartsData as any)?.wcag_piu_violati;
  if (map && typeof map === "object") {
    return Object.entries(map).map(([label, v]) => ({ label, value: Number(v) || 0 }));
  }
  const agg = new Map<string, number>();
  for (const it of issues) {
    const key = (it.wcag || "").replace(/\s+/g, " ").trim();
    if (!key) continue;
    agg.set(key, (agg.get(key) || 0) + 1);
  }
  return Array.from(agg, ([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 20);
}

// === Debug opzionale: chiama una volta da App per vedere le shape in console
export function __debugDataShapes() {
  // Evita di stampare liste infinite: mostra un esempio
  console.group("[mock-data] shapes");
  console.log("touchpoints[0]:", touchpoints[0]);
  console.log("issues[0]:", issues[0]);
  console.log("KPI:", getKPIData());
  console.log("Sezioni:", getSegnalazioniPerSezione().slice(0, 5));
  console.log("Tipologie:", getSegnalazioniPerTipologia().slice(0, 5));
  console.log("WCAG:", getCriteriWCAGPiuViolati().slice(0, 5));
  console.groupEnd();
}
