import { useState } from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import { Toaster } from "./components/ui/sonner";
import { OverviewPage } from "./components/OverviewPage";
import { ElencoTouchpointPage } from "./components/ElencoTouchpointPage";
import { DettaglioTouchpointPage } from "./components/DettaglioTouchpointPage";
import { Touchpoint } from "./data/mock-data";
import { BarChart3, List, Home } from "lucide-react";

type Page = 'overview' | 'touchpoints' | 'dettaglio';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('overview');
  const [selectedTouchpoint, setSelectedTouchpoint] = useState<Touchpoint | null>(null);

  const handleTouchpointSelect = (touchpoint: Touchpoint) => {
    setSelectedTouchpoint(touchpoint);
    setCurrentPage('dettaglio');
  };

  const handleBackToTouchpoints = () => {
    setCurrentPage('touchpoints');
    setSelectedTouchpoint(null);
  };

  const navigationItems = [
    {
      id: 'overview' as const,
      label: 'Overview',
      icon: BarChart3,
      ariaLabel: 'Vai alla dashboard overview'
    },
    {
      id: 'touchpoints' as const,
      label: 'Elenco Touchpoint',
      icon: List,
      ariaLabel: 'Vai all\'elenco touchpoint'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center gap-6">
            <div className="flex items-center gap-2">
              <Home className="h-6 w-6" aria-hidden="true" />
              <h1 className="text-lg font-semibold">Dashboard Accessibilità</h1>
            </div>
            
            <nav className="flex gap-1" role="navigation" aria-label="Navigazione principale">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentPage(item.id)}
                    className="flex items-center gap-2"
                    aria-label={item.ariaLabel}
                    aria-current={currentPage === item.id ? "page" : undefined}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8" role="main">
        {currentPage === 'overview' && <OverviewPage />}
        {currentPage === 'touchpoints' && (
          <ElencoTouchpointPage onTouchpointSelect={handleTouchpointSelect} />
        )}
        {currentPage === 'dettaglio' && selectedTouchpoint && (
          <DettaglioTouchpointPage 
            touchpoint={selectedTouchpoint} 
            onBack={handleBackToTouchpoints}
          />
        )}
      </main>

      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
      >
        Salta al contenuto principale
      </a>

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}