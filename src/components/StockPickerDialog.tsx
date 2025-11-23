import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Search, Loader2, RefreshCw } from "lucide-react";
import { IndexAPIFactory, IndexType } from './api';

interface Stock {
  ticker: string;
  name: string;
  listingLevel?: number;
  lotSize?: number;
}

interface TradeData {
  data: lastTrade[];
}

interface lastTrade {
  price: number;
}

interface StockPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectStock: (stock: Stock) => void;
}

export function StockPickerDialog({ open, onOpenChange, onSelectStock }: StockPickerDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch stocks when dialog opens
  useEffect(() => {
    if (open) {
      fetchStocks();
    }
  }, [open]);

  const fetchStocks = async () => {
    setLoading(true);
    setError(null);
    try {
      const api = IndexAPIFactory.getAPI(IndexType.MOEX);
      const allStocks = await api.searchStocks(""); // Empty query returns all stocks
      
      // Keep the filter to remove invalid entries
      const transformedStocks = allStocks.filter((stock: Stock) => stock.ticker && stock.name);
      
      setStocks(transformedStocks);
      
    } catch (err) {
      console.error('Error fetching stocks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stocks');
    } finally {
      setLoading(false);
    }
  };

  const filteredStocks = stocks.filter(
    (stock) =>
      stock.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChooseStock = () => {
    if (selectedStock) {
      // Pass the complete stock object with all data
      onSelectStock(selectedStock);
      onOpenChange(false);
      setSelectedStock(null);
      setSearchQuery("");
    }
  };

  const handleRetry = () => {
    fetchStocks();
  };

    useEffect(() => {
    setSelectedStock(null);
  }, [searchQuery]);

  return (
        <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Stock</DialogTitle>
          <DialogDescription>Search and select a stock from the list below</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by ticker or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="border rounded-lg overflow-hidden h-[400px] flex flex-col">
          <div className="overflow-auto flex-1">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStocks.map((stock) => (
                  <TableRow
                    key={stock.ticker}
                    className={`cursor-pointer ${
                      selectedStock?.ticker === stock.ticker ? "bg-blue-50" : ""
                    }`}
                    onClick={() => setSelectedStock(stock)}
                  >
                    <TableCell>{stock.ticker}</TableCell>
                    <TableCell>{stock.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleChooseStock} disabled={!selectedStock}>
            Choose Stock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}