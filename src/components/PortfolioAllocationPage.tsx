'use client'

import React from "react";
import { useState } from "react";
import { Page } from "../types";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TrendingUp,
} from "lucide-react";
import { LabelList, Pie, PieChart, Cell, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie"
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useLanguage } from "../contexts/LanguageContext";
import { CurrencyInput } from "./CurrencyInput";
import { IndexAPIFactory, IndexType } from "./api";
import {LanguageDropdown} from "./LanguageDropdown"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from "./ui/chart";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { StockPickerDialog } from "./StockPickerDialog";
import { stringify } from "querystring";

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

interface PortfolioRow {
  id: number;
  stock: string;
  price: string;
  weight: string;
  lotSize: string;
  lots: string;
  sum: string;
}

export function PortfolioAllocationPage({ onNavigate }: HomePageProps) {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { t, currentLanguage, changeLanguage } = useLanguage();
  const hideNumberArrows =
    "[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none";
  const [investment, setInvestment] = useState("");
  const [rows, setRows] = useState<PortfolioRow[]>([
    { id: 1, stock: "", price: "", weight: "", lotSize: "", lots: "", sum: "" },
  ]);
  const [stockPickerOpen, setStockPickerOpen] = useState(false);
  const [currentEditingRowId, setCurrentEditingRowId] = useState<number | null>(
    null,
  );
  const [allocationSummary, setAllocationSummary] = useState<{
    totalBudget: number;
    totalInvested: number;
    remaining: number;
    utilization: number;
  } | null>(null);

  const portfolioTotals = React.useMemo(() => {
    const totalStocks = rows.filter((row) => row.stock.trim() !== "").length;
    const totalWeight = rows.reduce((sum, row) => {
      const weight = parseFloat(row.weight) || 0;
      return sum + weight;
    }, 0);

    const totalSum = rows.reduce((sum, row) => {
      const rowSum = parseFloat(row.sum) || 0;
      return sum + rowSum;
    }, 0);

    // Format weight to handle floating point issues
    const formattedWeight =
      Math.abs(totalWeight - 100) < 0.1 ? "100" : totalWeight.toFixed(2);

    return {
      stocks: totalStocks,
      weight: formattedWeight,
      weightRaw: totalWeight,
      sum: totalSum,
    };
  }, [rows]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof PortfolioRow;
    direction: "asc" | "desc";
  } | null>(null);

  // Sort the rows when sortConfig changes
  const sortedRows = React.useMemo(() => {
    if (!sortConfig) return rows;

    return [...rows].sort((a, b) => {
      let aVal: string | number = a[sortConfig.key];
      let bVal: string | number = b[sortConfig.key];

      // Convert to numbers for numeric columns
      if (
        sortConfig.key === "price" ||
        sortConfig.key === "weight" ||
        sortConfig.key === "lotSize" ||
        sortConfig.key === "lots" ||
        sortConfig.key === "sum"
      ) {
        aVal = parseFloat(aVal as string) || 0;
        bVal = parseFloat(bVal as string) || 0;
      } else {
        // For text columns, ensure they're treated as strings
        aVal = aVal as string;
        bVal = bVal as string;
      }

      // Handle empty values
      if (aVal === "" && bVal !== "")
        return sortConfig.direction === "asc" ? -1 : 1;
      if (bVal === "" && aVal !== "")
        return sortConfig.direction === "asc" ? 1 : -1;
      if (aVal === "" && bVal === "") return 0;

      // Compare values
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, sortConfig]);

  // Handle sort when user clicks column header
  const handleSort = (key: keyof PortfolioRow) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: "asc" };
      }
      if (current.direction === "asc") {
        return { key, direction: "desc" };
      }
      return null; // Click again to remove sorting
    });
  };

  const getSortIndicator = (key: keyof PortfolioRow) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400 opacity-60" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  const clearAllocationResults = () => {
    setRows((prevRows) =>
      prevRows.map((row) => ({
        ...row,
        lots: "",
        sum: "",
      })),
    );
    setAllocationSummary(null);
    setValidationErrors([]);
  };

  const addRow = () => {
    setValidationErrors([]);
    setRows((prevRows) => {
      // First clear allocation results from all existing rows
      const clearedRows = prevRows.map((row) => ({
        ...row,
        lots: "",
        sum: "",
      }));

      // Then add the new row
      const newRow: PortfolioRow = {
        id: Date.now(),
        stock: "",
        price: "",
        weight: "",
        lotSize: "",
        lots: "",
        sum: "",
      };

      return [...clearedRows, newRow];
    });

    // Also clear the allocation summary
    setAllocationSummary(null);
  };

  const deleteRow = (id: number) => {
    if (rows.length > 1) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const updateRow = (id: number, field: keyof PortfolioRow, value: any) => {
    // Clear allocation results when any row data changes
    setValidationErrors([]);
    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value };
          return updatedRow;
        }
        return row;
      }),
    );
  };

const PortfolioPieChart = () => {
    const [activeIndex, setActiveIndex] = React.useState<number | undefined>(undefined);

    const chartData = React.useMemo(() => {
      // Get valid rows with weights, sorted by weight (descending)
      const validRows = rows
        .filter(row => row.stock.trim() !== "" && row.weight && parseFloat(row.weight) > 0)
        .sort((a, b) => parseFloat(b.weight) - parseFloat(a.weight));

      if (validRows.length === 0) {
        return [];
      }

      // Take top 8 stocks, group the rest as "Other"
      const topStocks = validRows.slice(0, 8);
      const otherStocks = validRows.slice(8);
      
      const otherWeight = otherStocks.reduce((sum, row) => sum + parseFloat(row.weight), 0);

      const blueShades = [
        "hsl(210, 90%, 20%)",  // Very dark blue
        "hsl(210, 85%, 30%)",  // Dark blue
        "hsl(210, 80%, 40%)",  // Medium dark blue
        "hsl(210, 75%, 50%)",  // Blue
        "hsl(210, 70%, 60%)",  // Medium blue
        "hsl(210, 65%, 70%)",  // Light blue
        "hsl(210, 60%, 80%)",  // Very light blue
        "hsl(210, 55%, 85%)",  // Pale blue
        "hsl(210, 50%, 90%)",  // Very pale blue for "Other"
      ];

      const chartItems = topStocks.map((row, index) => ({
        name: row.stock,
        value: parseFloat(row.weight),
        fill: blueShades[index],
      }));

      // Add "Other" category if there are remaining stocks
      if (otherWeight > 0) {
        chartItems.push({
          name: t("common.other"),
          value: otherWeight,
          fill: blueShades[8],
        });
      }

      return chartItems;
    }, [rows]);

    // Calculate total for percentage calculations
    const totalWeight = React.useMemo(() => {
      return chartData.reduce((sum, item) => sum + item.value, 0);
    }, [chartData]);

    // Format number like CurrencyInput
    const formatNumber = (value: number, decimalScale: number = 1) => {
      const fixedValue = value.toFixed(decimalScale);
      if (currentLanguage === 'ru') {
        return fixedValue.replace('.', ',');
      }
      return fixedValue;
    };

    // Generate chart config with percentages in labels
    const chartConfig = React.useMemo(() => {
      const config: ChartConfig = {
        value: {
          label: "Weight",
        },
      };

      chartData.forEach((item) => {
        config[item.name] = {
          label: item.name,
          color: item.fill,
        };
      });

      return config;
    }, [chartData]);

    const onPieEnter = (_: any, index: number) => {
      setActiveIndex(index);
    };

    const onPieLeave = () => {
      setActiveIndex(undefined);
    };

    if (chartData.length === 0) {
      return (
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardDescription>{t("portfolioAllocation.portfolioDistributionByWeight")}</CardDescription>
          </CardHeader>
        </Card>
      );
    }

    const totalStocks = rows.filter(row => row.stock.trim() !== "").length;

    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardDescription>{t("portfolioAllocation.portfolioDistributionByWeight")}, %</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[350px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent 
                    hideLabel 
                    formatAsPercentage
                    totalValue={totalWeight}
                    decimalScale={1}
                    language={currentLanguage}
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={35}
                strokeWidth={5}
                activeIndex={activeIndex}
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                activeShape={({
                  outerRadius = 0,
                  ...props
                }: PieSectorDataItem) => (
                  <Sector {...props} outerRadius={outerRadius + 5} />
                )}
              />
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center *:text-xs" // Added *:text-xs here
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 leading-none font-medium">
            <TrendingUp className="h-4 w-4" />
            {t("portfolioAllocation.totalStocks")}: {totalStocks}
          </div>
        </CardFooter>
      </Card>
    );
  };

  const updateRowPrice = async (
    id: number,
    field: keyof PortfolioRow,
    ticker: string,
  ) => {
    try {
      clearAllocationResults();
      const rowToUpdate = rows.find((row) => row.id === id);
      if (!rowToUpdate) return;

      const api = IndexAPIFactory.getAPI(IndexType.MOEX);
      const price = await api.fetchLastPrice(ticker);
      let newPrice = rowToUpdate.price;
      if (price !== null) {
        newPrice = price.toString();
      }

      setRows((prevRows) =>
        prevRows.map((row) => {
          if (row.id === id) {
            return { ...row, [field]: newPrice };
          }
          return row;
        }),
      );
    } catch (err) {
      console.info(`Couldn't find the last price for the stock`, err);
    }
  };

  const copyIndexIMOEX = async () => {
    try {
      const api = IndexAPIFactory.getAPI(IndexType.MOEX);
      const components = await api.fetchIndexComponents();

      setRows([]);
      setAllocationSummary(null);
      setValidationErrors([]);

      const sortedArray = components.sort((a, b) => b.weight - a.weight);
      const tickers = sortedArray.map((component) => component.ticker);
      const stocks = await api.searchStocks(undefined, tickers);
      const stockMap = new Map(stocks.map((stock) => [stock.ticker, stock]));

      const newRows = sortedArray.map((element, index) => {
        const stock = stockMap.get(element.ticker);
        return {
          id: index + 1,
          stock: element.ticker,
          price: "",
          weight: element.weight.toString(),
          lotSize: stock?.lotSize?.toString() || "",
          lots: "",
          sum: "",
        };
      });

      // Set rows first
      setRows(newRows);

      // Fetch prices immediately using the newRows array (not from state)
      for (const row of newRows) {
        await updateRowPriceDirect(row.id, "price", row.stock);
      }
    } catch (err) {
      console.error("Error fetching IMOEX index:", err);
    }
  };

  // Helper function that doesn't depend on current state
  const updateRowPriceDirect = async (
    id: number,
    field: keyof PortfolioRow,
    ticker: string,
  ) => {
    try {
      const api = IndexAPIFactory.getAPI(IndexType.MOEX);
      const price = await api.fetchLastPrice(ticker);

      if (price !== null) {
        setRows((prevRows) =>
          prevRows.map((row) => {
            if (row.id === id) {
              return { ...row, [field]: price.toString() };
            }
            return row;
          }),
        );
      }
    } catch (err) {
      console.info(`Couldn't find the last price for stock ${ticker}`, err);
    }
  };

  const calculateAllocation = () => {
    const totalInvestment = parseFloat(investment);
    const errors: string[] = [];

    // Convert all string values to numbers for validation
    const rowsWithNumbers = rows.map((row) => ({
      ...row,
      priceNum: row.price ? parseFloat(row.price) : NaN,
      weightNum: row.weight ? parseFloat(row.weight) : NaN,
      lotSizeNum: row.lotSize ? parseFloat(row.lotSize) : NaN,
    }));

    // Checks:
    const incompleteRows = rowsWithNumbers.filter(
      (row) =>
        !row.stock ||
        isNaN(row.priceNum) ||
        row.priceNum <= 0 ||
        isNaN(row.weightNum) ||
        row.weightNum <= 0 ||
        isNaN(row.lotSizeNum) ||
        row.lotSizeNum <= 0,
    );

    if (isNaN(totalInvestment)) {
      errors.push(t("validation.investmentRequired"));
    }

    if (incompleteRows.length > 0) {
      errors.push(t("validation.incompleteFields"));
    }

    let weightSum = 0;
    for (let row of rowsWithNumbers) {
      // Round each addition to 4 decimal places
      weightSum = Math.round((weightSum + row.weightNum) * 100) / 100;
    }
    if (weightSum > 100.09) {
      errors.push(t("validation.weightExceeds"));
    }
    // If there are errors, show them and stop calculation
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Clear any previous errors
    setValidationErrors([]);

    const n = rows.length;
    if (n === 0) return;

    // Filter out rows with incomplete data (should be none after validation)
    const validRows = rowsWithNumbers.filter(
      (row) =>
        !isNaN(row.weightNum) &&
        !isNaN(row.priceNum) &&
        !isNaN(row.lotSizeNum) &&
        row.weightNum > 0,
    );

    if (validRows.length === 0) return;

    // Extract arrays for the algorithm - now using the pre-converted numbers
    const weights = validRows.map((row) => row.weightNum);
    const prices = validRows.map((row) => row.priceNum);
    const lotSizes = validRows.map((row) => row.lotSizeNum);
    const rowIds = validRows.map((row) => row.id);

    // Normalize weights to sum to 1
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const normalizedWeights = weights.map((w) => w / totalWeight);

    const targetAmounts: number[] = [];
    const continuousLots: number[] = [];

    // Calculate target amounts and continuous lots
    for (let i = 0; i < validRows.length; i++) {
      targetAmounts.push(totalInvestment * normalizedWeights[i]);
      continuousLots.push(targetAmounts[i] / (prices[i] * lotSizes[i]));
    }

    // Initial floor allocation
    const N: number[] = [];
    for (let i = 0; i < validRows.length; i++) {
      N.push(Math.floor(continuousLots[i]));
    }

    // Calculate current total after floor allocation
    let currentTotal = 0;
    for (let i = 0; i < validRows.length; i++) {
      currentTotal += N[i] * lotSizes[i] * prices[i];
    }

    let remainingBudget = totalInvestment - currentTotal;

    // Calculate priorities for greedy allocation
    const priorities: { index: number; deviation: number; cost: number }[] = [];
    for (let i = 0; i < validRows.length; i++) {
      const currentAmount = N[i] * lotSizes[i] * prices[i];
      const currentWeight = currentTotal > 0 ? currentAmount / currentTotal : 0;
      const deviation = normalizedWeights[i] - currentWeight;
      const cost = lotSizes[i] * prices[i];
      priorities.push({
        index: i,
        deviation: deviation,
        cost: cost,
      });
    }

    // Greedy allocation - sort by deviation (most underweight first)
    priorities.sort((a, b) => b.deviation - a.deviation);

    // Allocate remaining budget to most underweight assets
    for (const priority of priorities) {
      const i = priority.index;
      if (remainingBudget >= priority.cost) {
        N[i] += 1;
        remainingBudget -= priority.cost;
      }
    }

    // Create a map of results by row ID
    const results = new Map();
    for (let i = 0; i < validRows.length; i++) {
      const lots = N[i];
      const sum = prices[i] * lotSizes[i] * lots;
      results.set(rowIds[i], {
        lots: lots.toString(),
        sum: sum.toFixed(2),
      });
    }

    const totalInvested = Array.from(results.values()).reduce(
      (sum, result) => sum + parseFloat(result.sum),
      0,
    );
    const remaining = totalInvestment - totalInvested;
    const utilization = (totalInvested / totalInvestment) * 100;

    setAllocationSummary({
      totalBudget: totalInvestment,
      totalInvested,
      remaining,
      utilization,
    });

    // Update all rows with calculated values
    setRows((prevRows) =>
      prevRows.map((row) => {
        if (results.has(row.id)) {
          const { lots, sum } = results.get(row.id);
          return {
            ...row,
            lots: lots,
            sum: sum,
          };
        }
        // For invalid rows, clear the calculated values
        return {
          ...row,
          lots: "",
          sum: "",
        };
      }),
    );
  };

  const openStockPicker = (rowId: number) => {
    setCurrentEditingRowId(rowId);
    setStockPickerOpen(true);
  };

  const handleSelectStock = (stock: any) => {
    if (currentEditingRowId !== null) {
      updateRow(currentEditingRowId, "stock", stock.ticker);
      updateRow(currentEditingRowId, "lotSize", stock.lotSize);
      updateRowPrice(currentEditingRowId, "price", stock.ticker);
    }
  };

  const distributeEvenly = () => {
    setRows((prevRows) => {
      if (prevRows.length === 0) return prevRows;

      const weights = Array(prevRows.length).fill(0);
      const baseWeight = 100 / prevRows.length;

      // Set all weights to the base value rounded to 2 decimals
      for (let i = 0; i < prevRows.length; i++) {
        weights[i] = Math.floor(baseWeight * 100) / 100;
      }

      // Calculate the difference and add it to the last element
      const currentTotal = weights.reduce((sum, weight) => sum + weight, 0);
      const difference = 100 - currentTotal;
      weights[weights.length - 1] += difference;

      return prevRows.map((row, index) => ({
        ...row,
        weight: weights[index].toFixed(2),
      }));
    });
  };


  return (
    <>
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-2 md:px-6 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <Button
                variant="ghost"
                onClick={() => onNavigate("home")}
                className="h-9 w-9 md:h-10 md:w-10 p-0"
              >
                <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              <h1 className="text-lg md:text-2xl">
                {t("portfolioAllocation.header")}
              </h1>
            </div>
            {/* Add the language dropdown here */}
            <LanguageDropdown />
          </div>
        </div>
      </header>
      <main className="container mx-auto px-2 md:px-6 py-4 md:py-8">
        <div className="bg-white md:rounded-lg md:border md:border-gray-200 p-3 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 md:gap-4">
            <div className="flex-1 max-w-md">
              <Label htmlFor="investment" className="text-sm md:text-base">
                {t("portfolioAllocation.investmentLabel")}
              </Label>
              <CurrencyInput
                value={investment}
                onValueChange={(value) => setInvestment(value || "")}
                placeholder={t("common.enterAmount")}
                className={
                  "text-sm md:text-base flex p-2 h-10 md:h-10 w-full rounded-md border border-1S border-gray-300 mt-2 " +
                  hideNumberArrows
                }
              />
            </div>
            <Button
              onClick={calculateAllocation}
              className="h-10 text-sm md:text-base md:h-11 px-3 md:px-8 border-2 border-gray-600  "
            >
              {t("common.calculate")}
            </Button>
          </div>
        </div>

        {validationErrors.length > 0 && (
          <div className="bg-rose-50/30 md:rounded-lg md:border md:border-rose-200 p-3 md:p-6 mb-4 md:mb-6">
            <h3 className="text-sm md:text-base font-medium text-rose-800 mb-2">
              {t("common.warning")}
            </h3>
            <div className="text-sm md:text-base text-rose-700">
              <ul className="list-none space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {allocationSummary && (
          <div className="bg-white md:rounded-lg md:border md:border-gray-200 p-3 md:p-6 mb-4 md:mb-6">
            <h3 className="text-sm md:text-base font-semibold mb-4 text-gray-800">
              {t("allocationSummary.header")}
            </h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableBody>
                  <TableRow className="hover:bg-transparent">
                    <TableCell className="py-3 px-4 text-sm text-gray-500 border-r border-gray-200 w-[250px]">
                      {t("allocationSummary.totalBudget")}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-gray-900 text-start">
                      <CurrencyInput
                        value={allocationSummary.totalBudget.toString()}
                        onValueChange={() => {}}
                        placeholder=""
                        readOnly={true}
                        decimalsLimit={0}
                        decimalScale={2}
                        className="bg-white"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-transparent">
                    <TableCell className="py-3 px-4 text-sm text-gray-500 border-r border-gray-200 w-[140px]">
                      {t("allocationSummary.totalInvested")}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-gray-900">
                      <CurrencyInput
                        value={allocationSummary.totalInvested.toString()}
                        onValueChange={() => {}}
                        placeholder=""
                        readOnly={true}
                        decimalsLimit={0}
                        decimalScale={2}
                        className="bg-white"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-transparent">
                    <TableCell className="py-3 px-4 text-sm text-gray-500 border-r border-gray-200 w-[140px]">
                      {t("allocationSummary.remaining")}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-gray-900">
                      <CurrencyInput
                        value={allocationSummary.remaining.toString()}
                        onValueChange={() => {}}
                        placeholder=""
                        readOnly={true}
                        decimalsLimit={0}
                        decimalScale={2}
                        className="bg-white"
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div className="bg-white md:rounded-lg pt-3 md:p-0 mt-3 mb-4 md:mb-6">
              <PortfolioPieChart />
            </div>
          </div>
        )}
        <div className="bg-white md:rounded-lg md:border md:border-gray-200 p-3 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 md:mb-4">
            <h2 className="text-sm md:text-base font-semibold">
              {t("portfolioAllocation.portfolioHeader")}
            </h2>
          </div>
          <div className="md:border md:rounded-lg mb-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-auto px-0.5 md:px-4 py-2 md:py-3 text-sm bg-white">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("stock")}
                      className="p-0 hover:bg-transparent"
                    >
                      {t("portfolioAllocation.stockHeader")}
                      {getSortIndicator("stock")}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[120px] md:w-auto px-0.5 md:px-4 py-2 md:py-3 text-sm bg-white">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("price")}
                      className="p-0 hover:bg-transparent"
                    >
                      {t("portfolioAllocation.priceHeader")}
                      {getSortIndicator("price")}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[85px] md:w-[85px] px-0.5 md:px-4 py-2 md:py-3 text-sm bg-white">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("weight")}
                      className="p-0 hover:bg-transparent"
                    >
                      {t("portfolioAllocation.weightHeader")}
                      {getSortIndicator("weight")}
                    </Button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell md:w-[80px] bg-white">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("lotSize")}
                      className="p-0 hover:bg-transparent"
                    >
                      {t("portfolioAllocation.lotSizeHeader")}
                      {getSortIndicator("lotSize")}
                    </Button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell md:w-[100px] bg-white text-right">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("lots")}
                      className="p-0 hover:bg-transparent text-right w-full justify-end"
                    >
                      {t("portfolioAllocation.lotsHeader")}
                      {getSortIndicator("lots")}
                    </Button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell md:w-[100px] bg-white text-right">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("sum")}
                      className="p-0 hover:bg-transparent text-right w-full justify-end"
                    >
                      {t("portfolioAllocation.sumHeader")}
                      {getSortIndicator("sum")}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[40px] md:w-[50px] px-0.5 md:px-4 bg-white"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="">
                {sortedRows.map((row) => (
                  <React.Fragment key={row.id}>
                    <TableRow className="hover:bg-transparent">
                      <TableCell className="px-0.5 md:px-4 py-1.5 md:py-4">
                        <div className="flex gap-0.5 md:gap-2">
                          <Input
                            value={row.stock}
                            onChange={(e) =>
                              updateRow(row.id, "stock", e.target.value)
                            }
                            placeholder=""
                            className="bg-white border-gray-200 h-8 md:h-10 text-sm md:text-sm px-1.5 md:px-3 shadow-none"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openStockPicker(row.id)}
                            className="h-8 w-8 md:h-10 md:w-10 p-0 shrink-0 border-0 md:border"
                          >
                            <Edit className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="px-0.5 md:px-4 py-1.5 md:py-4">
                        <CurrencyInput
                          value={row.price || ""}
                          onValueChange={(value) =>
                            updateRow(row.id, "price", value || undefined)
                          }
                          placeholder=""
                          className={
                            "bg-white border rounded-md border-gray-200 w-full h-8 md:h-10 text-sm md:text-sm px-2 md:px-3" +
                            hideNumberArrows
                          }
                        />
                      </TableCell>
                      <TableCell className="px-0.5 md:px-4 py-1.5 md:py-4">
                        <CurrencyInput
                          value={row.weight}
                          onValueChange={(value) => {
                            const numericValue = value ? parseFloat(value) : 0;
                            if (value === "" || numericValue <= 100) {
                              updateRow(row.id, "weight", value || "");
                            }
                          }}
                          placeholder=""
                          className="bg-white border rounded-md border-gray-200 w-full h-8 md:h-10 text-sm md:text-sm px-2 md:px-3"
                        />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <CurrencyInput
                          value={row.lotSize}
                          onValueChange={() => {}}
                          placeholder=""
                          readOnly={true}
                          decimalsLimit={0}
                          decimalScale={0}
                          className="bg-white border rounded-md border-gray-200 w-full h-8 md:h-10 text-sm md:text-sm px-2 md:px-3"
                        />
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-right">
                        <CurrencyInput
                          value={row.lots}
                          onValueChange={() => {}}
                          placeholder=""
                          readOnly={true}
                          decimalsLimit={0}
                          decimalScale={0}
                          className="bg-white text-sm md:text-sm border-0 text-right"
                        />
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-right">
                        <CurrencyInput
                          value={row.sum}
                          onValueChange={() => {}}
                          placeholder=""
                          readOnly={true}
                          className="bg-white border-0 text-sm md:text-sm text-right"
                        />
                      </TableCell>
                      <TableCell className="px-0.5 md:px-4 py-1.5 md:py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteRow(row.id)}
                          disabled={rows.length === 1}
                          className="h-8 w-8 md:h-10 md:w-10 p-0 shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>

                    {/* Mobile-only results row for this specific stock */}
                    <TableRow
                      key={`${row.id}-mobile`}
                      className="md:hidden hover:bg-transparent border-t-0"
                    >
                      <TableCell colSpan={7} className="px-1 pt-1 pb-2">
                        <div className="text-xs md:text-sm text-gray-500 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span>{t("portfolioAllocation.lotsHeader")}:</span>
                            <CurrencyInput
                              value={row.lots}
                              onValueChange={() => {}}
                              readOnly={true}
                              decimalsLimit={0}
                              decimalScale={0}
                              className="text-gray-700 bg-transparent border-0 p-0 text-xs md:text-sm h-auto"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span>{t("portfolioAllocation.sumHeader")}:</span>
                            <CurrencyInput
                              value={row.sum}
                              onValueChange={() => {}}
                              readOnly={true}
                              className="text-gray-700 bg-transparent border-0 text-xs md:text-sm h-auto"
                            />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
                <TableRow className="bg-gray-50 font-semibold border-t-0 border-gray-300">
                  {/* Desktop view */}
                  <TableCell className="px-0.5 md:px-4 py-1.5 md:py-4 hidden md:table-cell">
                    <div className="text-sm md:text-sm px-1.5 md:px-3">
                      {t("portfolioAllocation.totalStocks")}:{" "}
                      {portfolioTotals.stocks}
                    </div>
                  </TableCell>
                  <TableCell className="px-0.5 md:px-4 py-2 md:py-4 hidden md:table-cell">
                    {/* Empty for price column */}
                  </TableCell>
                  <TableCell className="px-0.5 md:px-4 py-1.5 md:py-4 hidden md:table-cell">
                    <div className="text-sm md:text-sm px-2 md:px-3">
                      <CurrencyInput
                        value={portfolioTotals.weight.toString()}
                        onValueChange={() => {}}
                        placeholder=""
                        suffix="%"
                        readOnly={true}
                        className="bg-transparent border-0 text-sm md:text-sm font-semibold"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell px-2 md:px-4 py-2 md:py-4">
                    {/* Empty for lotSize column */}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right px-2 md:px-4 py-2 md:py-4">
                    {/* Empty for lots column */}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right">
                    <CurrencyInput
                      value={portfolioTotals.sum.toString()}
                      onValueChange={() => {}}
                      placeholder=""
                      readOnly={true}
                      className="bg-transparent border-0 text-sm md:text-sm text-right font-semibold"
                    />
                  </TableCell>
                  <TableCell className="px-0.5 md:px-4 py-2 md:py-4 hidden md:table-cell">
                    {/* Empty for actions column */}
                  </TableCell>

                  {/* Mobile view */}
                  <TableCell className="px-0 py-2 md:hidden" colSpan={7}>
                    <div className="text-xs md:text-sm text-gray-700 font-semibold space-y-1 pl-2">
                      <div className="items-center gap-">
                        <span className="min-w-[80px]">
                          {t("portfolioAllocation.totalStocks")}:
                        </span>
                        <span className="pl-2">{portfolioTotals.stocks}</span>
                      </div>
                      <div className="items-center gap-1">
                        <span className="min-w-[80px]">
                          {t("portfolioAllocation.totalWeight")}:
                        </span>
                        <span className="pl-2">{portfolioTotals.weight}%</span>
                      </div>
                      <div className="items-center gap-2">
                        <span className="min-w-[80px]">
                          {t("portfolioAllocation.totalSum")}:
                        </span>
                        <CurrencyInput
                          value={portfolioTotals.sum.toString()}
                          onValueChange={() => {}}
                          readOnly={true}
                          className="pl-2 text-gray-700 bg-transparent border-0 text-xs md:text-sm h-auto font-semibold"
                        />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-sm md:text-base flex items-center gap-2 flex-wrap">
              <Button
                onClick={addRow}
                variant="outline"
                size="sm"
                className="h-9"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("portfolioAllocation.addRow")}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 h-9"
                  >
                    {t("portfolioAllocation.additionalCommands")}
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={distributeEvenly}>
                    {t("portfolioAllocation.distributeWeightsEvenly")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={copyIndexIMOEX}>
                    {t("portfolioAllocation.copyIndexIMOEX")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </main>

      <StockPickerDialog
        open={stockPickerOpen}
        onOpenChange={setStockPickerOpen}
        onSelectStock={handleSelectStock}
      />
    </>
  );
}
