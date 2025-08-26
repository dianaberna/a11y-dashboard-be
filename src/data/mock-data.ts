// src/data/mock-data.ts
// Compat layer: esporta gli stessi nomi che i componenti si aspettano,
// ma normalizza i campi (spazi → camelCase) e fornisce fallback sicuri.

import touchpointsData from "./touchpoints";
import issuesData from "./issues";
import metricsData from "./metrics";
import chartsData from "./charts";

export type Touchpoint = {
  id: string;
  Sezione: string;
  URL?: string | null;
  "Stato test"?: "non testato" | "testato" | "recheck" | "completato" | null;
  "# Problemi"?: number;
  "Link Frame Figma"?: string | null;
  // alias senza spazi
  section?: string;
  url?: string | null;
  statoTest?: Touchpoint["Stato test"];
  status?: Touchpoint["Stato test"];
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

const norm = (v: unknown) => (v === null || v === undefined ? null : String(v).trim());
const toInt = (v: unknown) => (Number.isFinite(Number(v)) ? Math.trunc(Number(v)) : 0);
const slug = (s: string | null | undefined) =>
  (s || "")
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || Math.random().toString(36).slice(2);

function normalizeTouchpoint(raw: any): Touchpoint {
  const sezione = norm(raw?.["Sezione"]) || norm(raw?.section) || "";
  const url = norm(raw?.["URL"]) ?? raw?.url ?? null;
  const stato = (norm(raw?.["Stato test"]) || norm(raw?.statoTest) || norm(raw?.status)) as Touchpoint["status"];
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
    section: sezione,
    url,
    statoTest: (stato as Touchpoint["Stato test"]) ?? null,
    status: (stato as Touchpoint["Stato test"]) ?? null,
    problemsCount: prob,
    figmaFrameUrl: figma,
  };
}

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
    status: stato,
    section: sezione,
    type: tipologia,
    description: descr,
    solution: ris,
    wcag,
    notes: note,
  };
}

const touchpointsRaw: any[] = Array.isArray(touchpointsData) ? touchpointsData : [];
const issuesRaw: any[] = Array.isArray(issuesData) ? issuesData : [];

export const touchpoints: Touchpoint[] = touchpointsRaw.map(normalizeTouchpoint);
export const issues: Segnalazione[] = issuesRaw.map(normalizeIssue);

// Alias richiesti dai componenti
export const mockTouchpoints = touchpoints;
export const mockSegnalazioni = issues;

// KPI (con fallback)
function computeMetricsFromTP(tps: Touchpoint[]) {
  const count = (st: string) => tps.filter(t => String(t.status ?? "").toLowerCase() === st).length;
  return {
    touchpoint_totali: tps.length,
    non_testato: count("non testato"),
    testato: count("testato"),
    recheck: count("recheck"),
    completato: count("completato"),
  };
}

export type KPIItem = { label: string; value: number };

export function getKPIData(): KPIItem[] {
  const m: any = metricsData || {};
  const fb = computeMetricsFromTP(touchpoints);
  const tot = Number(m.touchpoint_totali ?? fb.touchpoint_totali ?? touchpoints.length);
  const non = Number(m.non_testato ?? fb.non_testato ?? 0);
  const rec = Number(m.recheck ?? fb.recheck ?? 0);
  const com = Number(m.completato ?? fb.completato ?? 0);
  return [
    { label: "Touchpoint totali", value: tot },
    { label: "Non testati", value: non },
    { label: "In recheck", value: rec },
    { label: "Completati", value: com },
  ];
}

// Grafici (con fallback calcolato dalle issues)
export function getSegnalazioniPerSezione(): Array<{ label: string; value: number }> {
  const map: any = (chartsData as any)?.segnalazioni_per_sezione;
  if (map && typeof map === "object") return Object.entries(map).map(([label, v]) => ({ label, value: Number(v) || 0 }));
  const agg = new Map<string, number>();
  for (const it of issues) { const k = it.section || ""; if (!k) continue; agg.set(k, (agg.get(k) || 0) + 1); }
  return Array.from(agg, ([label, value]) => ({ label, value }));
}

export function getSegnalazioniPerTipologia(): Array<{ label: string; value: number }> {
  const map: any = (chartsData as any)?.segnalazioni_per_tipologia;
  if (map && typeof map === "object") return Object.entries(map).map(([label, v]) => ({ label, value: Number(v) || 0 }));
  const agg = new Map<string, number>();
  for (const it of issues) { const k = it.type || ""; if (!k) continue; agg.set(k, (agg.get(k) || 0) + 1); }
  return Array.from(agg, ([label, value]) => ({ label, value }));
}

export function getCriteriWCAGPiuViolati(): Array<{ label: string; value: number }> {
  const map: any = (chartsData as any)?.wcag_piu_violati;
  if (map && typeof map === "object") return Object.entries(map).map(([label, v]) => ({ label, value: Number(v) || 0 }));
  const agg = new Map<string, number>();
  for (const it of issues) { const k = (it.wcag || "").replace(/\s+/g, " ").trim(); if (!k) continue; agg.set(k, (agg.get(k) || 0) + 1); }
  return Array.from(agg, ([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 20);
}

// Debug comodo: puoi chiamarlo una volta in App
export function __debugDataShapes() {
  console.group("[mock-data] shapes");
  console.log("touchpoints[0]:", touchpoints[0]);
  console.log("issues[0]:", issues[0]);
  console.log("KPI:", getKPIData());
  console.log("Sezioni:", getSegnalazioniPerSezione().slice(0, 5));
  console.log("Tipologie:", getSegnalazioniPerTipologia().slice(0, 5));
  console.log("WCAG:", getCriteriWCAGPiuViolati().slice(0, 5));
  console.groupEnd();
}
