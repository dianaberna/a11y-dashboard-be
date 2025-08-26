import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb";
import { ChipStatoTest } from "./ChipStatoTest";
import { BadgeStato } from "./BadgeStato";
import { Badge } from "./ui/badge";
import { mockTouchpoints, mockSegnalazioni, Touchpoint, Segnalazione } from "../data/mock-data";
import { Search, ExternalLink, Figma, Copy, CheckCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface DettaglioTouchpointPageProps {
  touchpoint: Touchpoint;
  onBack: () => void;
}

export function DettaglioTouchpointPage({ touchpoint, onBack }: DettaglioTouchpointPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statoFilter, setStatoFilter] = useState<string>('tutti');
  const [tipologiaFilter, setTipologiaFilter] = useState<string>('tutti');
  const [wcagFilter, setWcagFilter] = useState<string>('tutti');
  const [selectedSegnalazione, setSelectedSegnalazione] = useState<Segnalazione | null>(null);

  // Get all segnalazioni for this touchpoint
  const touchpointSegnalazioni = mockSegnalazioni.filter(s => s.touchpointId === touchpoint.id);
  
  // Get unique filter options
  const tipologie = Array.from(new Set(mockSegnalazioni.map(s => s.tipologia)));
  const wcagCriteri = Array.from(new Set(mockSegnalazioni.map(s => s.wcag.split(' ')[0])));

  const filteredSegnalazioni = useMemo(() => {
    return touchpointSegnalazioni.filter(segnalazione => {
      const matchesSearch = 
        segnalazione.descrizioneProblema.toLowerCase().includes(searchTerm.toLowerCase()) ||
        segnalazione.risoluzione.toLowerCase().includes(searchTerm.toLowerCase()) ||
        segnalazione.wcag.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStato = statoFilter === 'tutti' || segnalazione.stato === statoFilter;
      const matchesTipologia = tipologiaFilter === 'tutti' || segnalazione.tipologia === tipologiaFilter;
      const matchesWcag = wcagFilter === 'tutti' || segnalazione.wcag.startsWith(wcagFilter);
      
      return matchesSearch && matchesStato && matchesTipologia && matchesWcag;
    });
  }, [touchpointSegnalazioni, searchTerm, statoFilter, tipologiaFilter, wcagFilter]);

  const handleMarkAsResolved = (segnalazione: Segnalazione) => {
    // In a real app, this would make an API call
    toast.success(`Segnalazione "${segnalazione.id}" contrassegnata come risolta`);
  };

  const handleCopyWcagLink = (wcag: string) => {
    const wcagCode = wcag.split(' ')[0];
    const wcagUrl = `https://www.w3.org/WAI/WCAG22/Understanding/${wcagCode.replace('.', '-')}.html`;
    navigator.clipboard.writeText(wcagUrl);
    toast.success('Link WCAG copiato negli appunti');
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink 
              onClick={onBack}
              className="cursor-pointer flex items-center gap-1 hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Elenco Touchpoint
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{touchpoint.sezione}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold">{touchpoint.sezione}</h1>
          <div className="flex items-center gap-4">
            <ChipStatoTest stato={touchpoint.statoTest} />
            <Badge variant={touchpoint.problemiCount > 0 ? "destructive" : "secondary"}>
              {touchpoint.problemiCount} {touchpoint.problemiCount === 1 ? 'problema' : 'problemi'}
            </Badge>
            {touchpoint.linkFigma && (
              <a
                href={touchpoint.linkFigma}
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Apri frame Figma"
              >
                <Figma className="h-4 w-4" aria-hidden="true" />
                Apri in Figma
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tabs with single touchpoint content */}
      <Tabs defaultValue="segnalazioni" className="space-y-6">
        <TabsList>
          <TabsTrigger value="segnalazioni">
            Segnalazioni ({touchpointSegnalazioni.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="segnalazioni" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Filtri Segnalazioni</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="space-y-2">
                  <label htmlFor="search-segnalazioni" className="text-sm font-medium">
                    Ricerca testuale
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <Input
                      id="search-segnalazioni"
                      placeholder="Cerca..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <label htmlFor="stato-filter" className="text-sm font-medium">
                    Stato
                  </label>
                  <Select value={statoFilter} onValueChange={setStatoFilter}>
                    <SelectTrigger id="stato-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tutti">Tutti</SelectItem>
                      <SelectItem value="non-risolto">Non risolto</SelectItem>
                      <SelectItem value="risolto">Risolto</SelectItem>
                      <SelectItem value="community">Community</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tipologia Filter */}
                <div className="space-y-2">
                  <label htmlFor="tipologia-filter" className="text-sm font-medium">
                    Tipologia
                  </label>
                  <Select value={tipologiaFilter} onValueChange={setTipologiaFilter}>
                    <SelectTrigger id="tipologia-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tutti">Tutti</SelectItem>
                      {tipologie.map(tipologia => (
                        <SelectItem key={tipologia} value={tipologia}>
                          {tipologia}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* WCAG Filter */}
                <div className="space-y-2">
                  <label htmlFor="wcag-filter" className="text-sm font-medium">
                    WCAG 2.2
                  </label>
                  <Select value={wcagFilter} onValueChange={setWcagFilter}>
                    <SelectTrigger id="wcag-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tutti">Tutti</SelectItem>
                      {wcagCriteri.map(criterio => (
                        <SelectItem key={criterio} value={criterio}>
                          {criterio}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Visualizzate {filteredSegnalazioni.length} di {touchpointSegnalazioni.length} segnalazioni
            </p>
          </div>

          {/* Segnalazioni Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Stato</TableHead>
                      <TableHead>Tipologia</TableHead>
                      <TableHead>Descrizione problema rilevato</TableHead>
                      <TableHead>Risoluzione</TableHead>
                      <TableHead>WCAG 2.2</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSegnalazioni.map((segnalazione, index) => (
                      <TableRow 
                        key={segnalazione.id}
                        className="hover:bg-muted/50 focus-within:bg-muted/50"
                        style={{ backgroundColor: index % 2 === 1 ? 'var(--color-muted)/0.3' : 'transparent' }}
                      >
                        <TableCell>
                          <BadgeStato stato={segnalazione.stato} />
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{segnalazione.tipologia}</Badge>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <p className="line-clamp-2 text-sm">
                            {segnalazione.descrizioneProblema}
                          </p>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <p className="line-clamp-2 text-sm">
                            {segnalazione.risoluzione}
                          </p>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-mono">
                            {segnalazione.wcag}
                          </span>
                        </TableCell>
                        <TableCell>
                          {segnalazione.note ? (
                            <p className="line-clamp-1 text-sm text-muted-foreground">
                              {segnalazione.note}
                            </p>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedSegnalazione(segnalazione)}
                                aria-label={`Visualizza dettagli segnalazione`}
                              >
                                Dettagli
                              </Button>
                            </SheetTrigger>
                            <SheetContent className="w-full max-w-2xl">
                              {selectedSegnalazione && (
                                <>
                                  <SheetHeader>
                                    <SheetTitle>Dettaglio Segnalazione</SheetTitle>
                                    <SheetDescription>
                                      {selectedSegnalazione.sezione} - {formatDate(selectedSegnalazione.dataCreazione)}
                                    </SheetDescription>
                                  </SheetHeader>
                                  
                                  <div className="mt-6 space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Stato</label>
                                        <div className="mt-1">
                                          <BadgeStato stato={selectedSegnalazione.stato} />
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Tipologia</label>
                                        <div className="mt-1">
                                          <Badge variant="outline">{selectedSegnalazione.tipologia}</Badge>
                                        </div>
                                      </div>
                                    </div>

                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">
                                        Descrizione problema rilevato
                                      </label>
                                      <p className="mt-1 text-sm">{selectedSegnalazione.descrizioneProblema}</p>
                                    </div>

                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">
                                        Risoluzione
                                      </label>
                                      <p className="mt-1 text-sm">{selectedSegnalazione.risoluzione}</p>
                                    </div>

                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">
                                        WCAG 2.2
                                      </label>
                                      <p className="mt-1 text-sm font-mono">{selectedSegnalazione.wcag}</p>
                                    </div>

                                    {selectedSegnalazione.note && (
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                          Note
                                        </label>
                                        <p className="mt-1 text-sm">{selectedSegnalazione.note}</p>
                                      </div>
                                    )}

                                    <div className="flex flex-col gap-3 pt-4 border-t">
                                      {selectedSegnalazione.stato !== 'risolto' && (
                                        <Button
                                          onClick={() => handleMarkAsResolved(selectedSegnalazione)}
                                          className="w-full"
                                        >
                                          <CheckCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                                          Segna come risolto
                                        </Button>
                                      )}
                                      
                                      {touchpoint.linkFigma && (
                                        <Button
                                          variant="outline"
                                          onClick={() => window.open(touchpoint.linkFigma, '_blank')}
                                          className="w-full"
                                        >
                                          <Figma className="h-4 w-4 mr-2" aria-hidden="true" />
                                          Apri in Figma
                                        </Button>
                                      )}
                                      
                                      <Button
                                        variant="outline"
                                        onClick={() => handleCopyWcagLink(selectedSegnalazione.wcag)}
                                        className="w-full"
                                      >
                                        <Copy className="h-4 w-4 mr-2" aria-hidden="true" />
                                        Copia link WCAG
                                      </Button>
                                    </div>
                                  </div>
                                </>
                              )}
                            </SheetContent>
                          </Sheet>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {filteredSegnalazioni.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Nessuna segnalazione trovata con i filtri selezionati.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}