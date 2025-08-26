// types.ts
export type Touchpoint = {
  id: string;
  Sezione: string;
  URL?: string | null;
  "Stato test"?: "non testato" | "testato" | "recheck" | "completato" | null;
  "# Problemi"?: number;
  "Link Frame Figma"?: string | null;
};

export type Issue = {
  id: number;
  Stato?: string | null; // es. "non risolto", "risolto"
  Sezione?: string | null;
  Tipologia?: string | null;
  "Descrizione problema rilevato"?: string | null;
  Risoluzione?: string | null;
  "WCAG 2.2"?: string | null;
  Note?: string | null;
  _sheet?: string;       // foglio di origine
};

export type Metrics = {
  touchpoint_totali?: number;
  non_testato?: number;
  testato?: number;
  recheck?: number;
  completato?: number;
};

export type Charts = {
  segnalazioni_per_sezione?: Record<string, number>;
  segnalazioni_per_tipologia?: Record<string, number>;
  wcag_piu_violati?: Record<string, number>;
};

// data.ts
export async function loadData() {
  const [tpRes, issRes, metRes, chRes] = await Promise.all([
    fetch("/data/touchpoints.json"),
    fetch("/data/issues.json"),
    fetch("/data/metrics.json"),
    fetch("/data/charts.json"),
  ]);
  if (!tpRes.ok || !issRes.ok || !metRes.ok || !chRes.ok) {
    throw new Error("Errore nel caricamento dei dati JSON");
  }
  const [touchpoints, issues, metrics, charts] = await Promise.all([
    tpRes.json(), issRes.json(), metRes.json(), chRes.json()
  ]);
  return { touchpoints, issues, metrics, charts } as {
    touchpoints: Touchpoint[]; issues: Issue[]; metrics: Metrics; charts: Charts
  };
}
