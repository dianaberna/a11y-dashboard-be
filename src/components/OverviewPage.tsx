import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { KPICard } from "./KPICard";
import { 
  getKPIData, 
  getSegnalazioniPerSezione, 
  getSegnalazioniPerTipologia, 
  getCriteriWCAGPiuViolati
} from "../data/mock-data";
import { LayoutGrid, XCircle, RotateCcw, CheckCircle, BarChart3 } from "lucide-react";

export function OverviewPage() {
  const kpiData = getKPIData();
  const segnalazioniSezione = getSegnalazioniPerSezione();
  const segnalazioniTipologia = getSegnalazioniPerTipologia();
  const criteriWCAG = getCriteriWCAGPiuViolati();

  // Calculate max values for progress bars
  const maxSegnalazioniSezione = Math.max(...segnalazioniSezione.map(s => s.segnalazioni));
  const maxSegnalazioniTipologia = Math.max(...segnalazioniTipologia.map(s => s.segnalazioni));
  const maxViolazioni = Math.max(...criteriWCAG.map(c => c.violazioni));

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Dashboard Accessibilità</h1>
          <p className="text-muted-foreground mt-2">
            Panoramica generale dei test di accessibilità WCAG 2.2
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <section aria-labelledby="kpi-section">
        <h2 id="kpi-section" className="sr-only">Indicatori chiave di prestazione</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Touchpoint totali"
            value={kpiData.totali}
            icon={LayoutGrid}
            variant="info"
          />
          <KPICard
            title="Non testati"
            value={kpiData.nonTestati}
            icon={XCircle}
            variant="warning"
          />
          <KPICard
            title="In recheck"
            value={kpiData.inRecheck}
            icon={RotateCcw}
            variant="warning"
          />
          <KPICard
            title="Completati"
            value={kpiData.completati}
            icon={CheckCircle}
            variant="success"
          />
        </div>
      </section>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Segnalazioni per Sezione */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5" aria-hidden="true" />
              Segnalazioni per sezione
            </CardTitle>
            <CardDescription>
              Distribuzione delle segnalazioni per area del sito
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {segnalazioniSezione
              .sort((a, b) => b.segnalazioni - a.segnalazioni)
              .map((item, index) => (
              <div key={item.sezione} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="min-w-[20px] h-5 text-xs">
                      {index + 1}
                    </Badge>
                    <span className="font-medium text-sm">{item.sezione}</span>
                  </div>
                  <Badge variant="outline" className="text-sm font-semibold">
                    {item.segnalazioni}
                  </Badge>
                </div>
                <Progress 
                  value={(item.segnalazioni / maxSegnalazioniSezione) * 100} 
                  className="h-2"
                  aria-label={`${item.sezione}: ${item.segnalazioni} segnalazioni`}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Segnalazioni per Tipologia */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5" aria-hidden="true" />
              Segnalazioni per tipologia
            </CardTitle>
            <CardDescription>
              Classificazione delle segnalazioni per tipo di problema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {segnalazioniTipologia
              .sort((a, b) => b.segnalazioni - a.segnalazioni)
              .map((item, index) => (
              <div key={item.tipologia} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="min-w-[20px] h-5 text-xs">
                      {index + 1}
                    </Badge>
                    <span className="font-medium text-sm">{item.tipologia}</span>
                  </div>
                  <Badge variant="outline" className="text-sm font-semibold">
                    {item.segnalazioni}
                  </Badge>
                </div>
                <Progress 
                  value={(item.segnalazioni / maxSegnalazioniTipologia) * 100} 
                  className="h-2"
                  aria-label={`${item.tipologia}: ${item.segnalazioni} segnalazioni`}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Criteri WCAG più violati */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5" aria-hidden="true" />
              Criteri WCAG più violati
            </CardTitle>
            <CardDescription>
              Top criteri WCAG 2.2 con più violazioni
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {criteriWCAG.slice(0, 6).map((item, index) => (
              <div key={item.criterio} className="flex items-center justify-between py-2 border-b border-border/50 last:border-b-0">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="min-w-[24px] h-6 text-xs font-mono">
                    {index + 1}
                  </Badge>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm font-mono">{item.criterio}</span>
                    <span className="text-xs text-muted-foreground">Criterio WCAG</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 bg-muted rounded-full h-2">
                    <div 
                      className="bg-destructive h-2 rounded-full transition-all"
                      style={{ width: `${(item.violazioni / maxViolazioni) * 100}%` }}
                      aria-label={`${item.violazioni} violazioni`}
                    />
                  </div>
                  <Badge variant="destructive" className="text-xs min-w-[28px] font-semibold">
                    {item.violazioni}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}