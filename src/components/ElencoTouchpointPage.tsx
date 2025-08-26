import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { ChipStatoTest } from "./ChipStatoTest";
import { mockTouchpoints, Touchpoint } from "../data/mock-data";
import { Search, Download, ExternalLink, Figma, SortAsc, SortDesc } from "lucide-react";

type SortField = 'sezione' | 'problemiCount';
type SortDirection = 'asc' | 'desc';

export function ElencoTouchpointPage({ onTouchpointSelect }: { onTouchpointSelect: (touchpoint: Touchpoint) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statoFilter, setStatoFilter] = useState<string>('tutti');
  const [sortField, setSortField] = useState<SortField>('sezione');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const filteredAndSortedTouchpoints = useMemo(() => {
    let filtered = mockTouchpoints.filter(touchpoint => {
      const matchesSearch = touchpoint.sezione.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           touchpoint.url.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStato = statoFilter === 'tutti' || touchpoint.statoTest === statoFilter;
      return matchesSearch && matchesStato;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'sezione') {
        comparison = a.sezione.localeCompare(b.sezione);
      } else if (sortField === 'problemiCount') {
        comparison = a.problemiCount - b.problemiCount;
      }
      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [searchTerm, statoFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Sezione', 'URL/Link', 'Stato test', 'Numero Problemi', 'Link Frame Figma'];
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedTouchpoints.map(touchpoint => [
        `"${touchpoint.sezione}"`,
        `"${touchpoint.url}"`,
        `"${touchpoint.statoTest}"`,
        touchpoint.problemiCount,
        `"${touchpoint.linkFigma || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'touchpoints.csv';
    link.click();
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <SortAsc className="inline h-4 w-4 ml-1" aria-hidden="true" /> : 
      <SortDesc className="inline h-4 w-4 ml-1" aria-hidden="true" />;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold">Elenco Touchpoint</h1>
        <p className="text-muted-foreground mt-1">
          Gestisci e monitora tutti i touchpoint del sito
        </p>
      </div>

      {/* Toolbar */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Filtri e Ricerca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
            {/* Search */}
            <div className="flex-1 space-y-2">
              <label htmlFor="search-touchpoints" className="text-sm font-medium">
                Cerca touchpoint
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="search-touchpoints"
                  placeholder="Cerca per sezione o URL..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2 min-w-[200px]">
              <label htmlFor="stato-filter" className="text-sm font-medium">
                Stato test
              </label>
              <Select value={statoFilter} onValueChange={setStatoFilter}>
                <SelectTrigger id="stato-filter">
                  <SelectValue placeholder="Filtra per stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tutti">Tutti gli stati</SelectItem>
                  <SelectItem value="non-testato">Non testato</SelectItem>
                  <SelectItem value="testato">Testato</SelectItem>
                  <SelectItem value="recheck">In recheck</SelectItem>
                  <SelectItem value="completato">Completato</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Export Button */}
            <Button 
              onClick={handleExportCSV}
              variant="outline"
              className="min-w-[120px]"
            >
              <Download className="h-4 w-4 mr-2" aria-hidden="true" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Visualizzati {filteredAndSortedTouchpoints.length} di {mockTouchpoints.length} touchpoint
        </p>
      </div>

      {/* Touchpoints Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button
                      onClick={() => handleSort('sezione')}
                      className="font-medium hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm p-1 -m-1"
                      aria-label={`Ordina per sezione ${sortField === 'sezione' ? (sortDirection === 'asc' ? 'decrescente' : 'crescente') : 'crescente'}`}
                    >
                      Sezione
                      <SortIcon field="sezione" />
                    </button>
                  </TableHead>
                  <TableHead>URL/Link</TableHead>
                  <TableHead>Stato test</TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('problemiCount')}
                      className="font-medium hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm p-1 -m-1"
                      aria-label={`Ordina per numero problemi ${sortField === 'problemiCount' ? (sortDirection === 'asc' ? 'decrescente' : 'crescente') : 'crescente'}`}
                    >
                      # Problemi
                      <SortIcon field="problemiCount" />
                    </button>
                  </TableHead>
                  <TableHead>Link Frame Figma</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedTouchpoints.map((touchpoint, index) => (
                  <TableRow 
                    key={touchpoint.id}
                    className="hover:bg-muted/50 focus-within:bg-muted/50"
                    style={{ backgroundColor: index % 2 === 1 ? 'var(--color-muted)/0.3' : 'transparent' }}
                  >
                    <TableCell className="font-medium">
                      {touchpoint.sezione}
                    </TableCell>
                    <TableCell>
                      <a 
                        href={touchpoint.url}
                        className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Apri URL ${touchpoint.url} in una nuova scheda`}
                      >
                        {touchpoint.url}
                        <ExternalLink className="inline h-3 w-3 ml-1" aria-hidden="true" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <ChipStatoTest stato={touchpoint.statoTest} />
                    </TableCell>
                    <TableCell>
                      <Badge variant={touchpoint.problemiCount > 0 ? "destructive" : "secondary"}>
                        {touchpoint.problemiCount}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {touchpoint.linkFigma ? (
                        <a
                          href={touchpoint.linkFigma}
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Apri frame Figma per ${touchpoint.sezione}`}
                        >
                          <Figma className="h-4 w-4 mr-1" aria-hidden="true" />
                          Figma
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-sm">Non disponibile</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onTouchpointSelect(touchpoint)}
                        aria-label={`Visualizza dettagli per ${touchpoint.sezione}`}
                      >
                        Dettagli
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredAndSortedTouchpoints.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nessun touchpoint trovato con i filtri selezionati.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}