import { useState, useEffect } from "react";
import { Page } from "../types";
import { ArrowLeft, Plus, Trash2, Calculator, Edit } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { CurrencyInput } from "./CurrencyInput";
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageDropdown } from "./LanguageDropdown"
import { Checkbox } from "./ui/checkbox"

import * as React from "react"
import { ChevronsUpDown } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface IndexCalculatorPageProps {
  onNavigate: (page: Page) => void;
}

export function IndexCalculatorPage({ onNavigate }: IndexCalculatorPageProps) {
  const hideNumberArrows =
    "[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none";
  const { t } = useLanguage();
  const [initialInvestment, setInitialInvestment] = useState("");
  const [duration, setDuration] = useState("");
  const [durationUnit, setDurationUnit] = useState<"years" | "months">("years");
  const [interestRate, setInterestRate] = useState("");
  const [reinvest, setReinvest] = useState(true);
  const [additionalInvestment, setAdditionalInvestment] = useState("");
  const [additionalInvestmentFrequency, setAdditionalInvestmentFrequency] = useState<"each year" | "each month">("each year");
  const [isManualMode, setIsManualMode] = useState(false);
  const [additionalInvestmentGrowthRate, setAdditionalInvestmentGrowthRate] = useState("");
  const [additionalInvestments, setAdditionalInvestments] = useState<{ amount: string }[]>([]);

  // Initialize investments when duration changes
  useEffect(() => {
    if (isManualMode) return;
    
    calculateInvestmentsWithIndexation();
  }, [duration, additionalInvestment, additionalInvestmentGrowthRate, isManualMode, durationUnit, additionalInvestmentFrequency]);

  const handleManualAmountChange = (index: number, value: string) => {
    const newInvestments = [...additionalInvestments];
    newInvestments[index].amount = value;
    setAdditionalInvestments(newInvestments);
  };

  const calculateInvestmentsWithIndexation = () => {
    if (parseInt(duration) <= 0 || isManualMode) return;
    
    const growthRate = parseFloat(additionalInvestmentGrowthRate) / 100 || 0;
    const baseAmount = parseFloat(additionalInvestment) || 0;
    
    const periods = parseInt(duration);
    
    // Calculate the number of rows needed in the table
    let tableRows = 0;
    
    if (additionalInvestmentFrequency === 'each year') {
      // For yearly investments
      tableRows = durationUnit === 'years' ? periods : Math.ceil(periods / 12);
    } else {
      // For monthly investments
      tableRows = durationUnit === 'years' ? periods * 12 : periods;
    }
    
    const calculatedInvestments = Array.from({ length: tableRows }, (_, index) => {
      if (additionalInvestmentFrequency === 'each year') {
        // Yearly growth - apply indexation annually
        const yearMultiplier = Math.pow(1 + growthRate, index);
        const amount = (baseAmount * yearMultiplier).toFixed(2);
        return { amount };
      } else {
        // Monthly investments - apply indexation only at year boundaries
        const yearIndex = Math.floor(index / 12);
        const yearMultiplier = Math.pow(1 + growthRate, yearIndex);
        const amount = (baseAmount * yearMultiplier).toFixed(2);
        return { amount };
      }
    });
  
  setAdditionalInvestments(calculatedInvestments);
};

  const deleteManualInvestment = (index: number) => {
    const newInvestments = additionalInvestments.filter((_, i) => i !== index);
    setAdditionalInvestments(newInvestments);
  };

  const addManualInvestment = () => {
    setAdditionalInvestments([...additionalInvestments, { amount: "" }]);
  };
  
  const getMonthName = (monthIndex: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex % 12];
  };

  const [calculationResult, setCalculationResult] = useState<{
  finalBalance: number;
  breakdown: { period: number; label: string; balance: number }[];
} | null>(null);

  // Add this function before the return statement
  const handleCalculate = () => {
    const result = calculateInvestment();
    setCalculationResult(result);
  };

const calculateInvestment = () => {
  // Parse input values
  const initial = parseFloat(initialInvestment) || 0;
  const annualRate = parseFloat(interestRate) / 100 || 0;
  const periods = parseInt(duration) || 0;
  
  const isMonthlyDuration = durationUnit === 'months';
  const isMonthlyInvestment = additionalInvestmentFrequency === 'each month';
  
  // Convert everything to months for calculation
  const totalMonths = isMonthlyDuration ? periods : periods * 12;
  const totalYears = totalMonths / 12;
  
  let finalBalance = 0;
  const results = [];
  
  if (isMonthlyInvestment) {
    // MONTHLY INVESTMENTS - Simple and correct approach
    
    // 1. Initial investment with interest
    finalBalance = initial * (1 + annualRate * totalYears);
    
    // 2. Add each monthly investment with its specific interest
    for (let month = 0; month < totalMonths; month++) {
      if (month < additionalInvestments.length) {
        const monthlyAmount = parseFloat(additionalInvestments[month]?.amount) || 0;
        const monthsRemaining = totalMonths - month; // -1 because invested at END of month
        const yearsRemaining = monthsRemaining / 12;
        const investmentWithInterest = monthlyAmount * (1 + annualRate * yearsRemaining);
        finalBalance += investmentWithInterest;
      }
    }
    
    // Create yearly breakdown - SIMPLIFIED
    for (let year = 1; year <= Math.ceil(totalYears); year++) {
      const monthsUpToYear = Math.min(year * 12, totalMonths);
      let yearlyBalance = initial * (1 + annualRate * (monthsUpToYear / 12));
      
      // Add monthly investments up to this year
      for (let month = 0; month < monthsUpToYear; month++) {
        if (month < additionalInvestments.length) {
          const monthlyAmount = parseFloat(additionalInvestments[month]?.amount) || 0;
          const monthsRemainingAtInvestment = totalMonths - month - 1;
          const monthsEarnedByYear = Math.min(monthsRemainingAtInvestment, monthsUpToYear - month - 1);
          const yearsEarned = monthsEarnedByYear / 12;
          yearlyBalance += monthlyAmount * (1 + annualRate * yearsEarned);
        }
      }
      
      results.push({
        period: year,
        label: `Year ${year}`,
        balance: yearlyBalance
      });
    }
    
  } else {
    // YEARLY INVESTMENTS - Fixed logic
    const calculationYears = isMonthlyDuration ? Math.ceil(periods / 12) : periods;
    
    let balance = initial;
    for (let year = 1; year <= calculationYears; year++) {
      // Apply annual interest to current balance
      if (reinvest) {
        balance = balance * (1 + annualRate);
      }
      
      // Add yearly investment at the END of the year
      if (year - 1 < additionalInvestments.length) {
        const additionalAmount = parseFloat(additionalInvestments[year - 1]?.amount) || 0;
        balance += additionalAmount;
      }
      
      results.push({
        period: year,
        label: `Year ${year}`,
        balance: balance
      });
    }
    finalBalance = balance;
  }
  
  return {
    finalBalance: finalBalance,
    breakdown: results
  };
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
                {t("indexCalculatorPage.header")}
              </h1>
            </div>
            <LanguageDropdown />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-xl mx-auto bg-white rounded-lg border border-gray-200 p-6">
          {/* Initial Investment Section */}
          <div className="mb-3">
            <Label htmlFor="initial-investment" className="text-sm md:text-sm font-medium text-gray-500 mb-2 block">
              {t("indexCalculatorPage.initialInvestment")}
            </Label>
            <div className="flex gap-2">
              <CurrencyInput
                value={initialInvestment}
                onValueChange={(value) => setInitialInvestment(value || '')}
                placeholder=""
                prefix=""
                className="max-w-[185px] text-sm md:text-sm flex p-2 h-10 md:h-10 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-400 focus:border-gray-400" 
              />
              <select className="w-24 px-3 border border-gray-300 rounded-md text-sm md:text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400">
                <option>RUB</option>
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
              </select>
            </div>
          </div>

          {/* Duration Section */}
          <div className="mb-3">
            <Label htmlFor="duration" className="text-sm font-medium text-gray-500 mb-2 block ">
              {t("indexCalculatorPage.duration")}
            </Label>
            <div className="flex gap-2">
             <Input
                type="number"
                value={duration}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d+$/.test(value)) {
                    setDuration(value);
                  }
                }}
                placeholder=""
                className="text-sm md:text-sm flex p-2 h-10 md:h-10 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 max-w-[80px]"
                step="1"
                min="0"
              />
              <select 
                value={durationUnit}
                onChange={(e) => setDurationUnit(e.target.value as "years" | "months")}
                className="w-28 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"              >
                <option value="years">{t("indexCalculatorPage.years")}</option>
                <option value="months">{t("indexCalculatorPage.months")}</option>
              </select>
            </div>
          </div>

          {/* Interest Rate Section */}
          <div className="mb-6">
            <Label htmlFor="interest-rate" className="text-sm font-medium text-gray-500 mb-2 block">
              {t("indexCalculatorPage.interestRate")}
            </Label>
            <div className="flex gap-2">
              <CurrencyInput
                value={interestRate}
                onValueChange={(value) => setInterestRate(value || '')}
                placeholder=""
                prefix=""
                className={"text-sm md:text-sm flex p-2 h-10 md:h-10 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 max-w-[80px] " 
                    + hideNumberArrows}
              />
              <div 
                className="w-32 px-0 py-2 border-0 rounded-md text-sm bg-white text-gray-500">
                {t("indexCalculatorPage.perYear")}
              </div>
            </div>
          </div>

          {/* Reinvest Section */}
          <div className="mb-6">
            <div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                id="reinvest"
                onCheckedChange={(checked) => setReinvest(checked as boolean)} />
                <Label className="text-gray-500" htmlFor="terms">{t("indexCalculatorPage.reinvest")}</Label>
              </div>
            </div>

          </div>

          {/* Additional Investment Section */}
          <div className="mb-8">
            <Label htmlFor="additional-investment" className="text-sm font-medium text-gray-500 mb-2 block">
              {t("indexCalculatorPage.additionalInvestment")}
            </Label>
            
            <div className="flex gap-2 mb-4">
              <CurrencyInput
                value={additionalInvestment}
                onValueChange={(value) => setAdditionalInvestment(value || '')}
                placeholder=""
                prefix=""
                readOnly={isManualMode}
                className={`max-w-[185px] text-sm  flex p-2 h-10 md:h-10 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 ${
                  isManualMode ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
              <select 
                value={additionalInvestmentFrequency}
                onChange={(e) => setAdditionalInvestmentFrequency(e.target.value as "each year" | "each month")}
                disabled={isManualMode}
                className={`w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 ${
                  isManualMode ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                <option value="each year">{t("indexCalculatorPage.eachYear")}</option>
                <option value="each month">{t("indexCalculatorPage.eachMonth")}</option>
              </select>
            </div>

            {/* Indexation/Growth Rate - Label above input */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium text-gray-500">
                  {t("indexCalculatorPage.additionalInvestmentGrowthRate")}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <CurrencyInput
                  value={additionalInvestmentGrowthRate}
                  onValueChange={(value) => setAdditionalInvestmentGrowthRate(value || '')}
                  placeholder=""
                  prefix=""
                  readOnly={isManualMode}
                  className={`text-sm md:text-sm flex p-2 h-10 md:h-10 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 max-w-[80px] ${
                    isManualMode ? 'bg-gray-50 cursor-not-allowed' : ''
                  }`}
                />
                <div className="text-sm text-gray-500">
                  {t("indexCalculatorPage.perYear")}
                </div>
              </div>
            </div>
              <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsManualMode(!isManualMode)}
              className={`mb-3 text-xs h-7 px-2 ${isManualMode ? 'font-medium text-gray-900 bg-gray-100' : 'text-gray-500 opacity-90'}`}
            >
              {isManualMode ? (
                <>
                  <Edit className="h-3 w-3 mr-1" />
                  {t("indexCalculatorPage.manualMode")}
                </>
              ) : (
                t("indexCalculatorPage.setManually")
              )}
            </Button>

            
            {/* Additional Investments Table - Collapsible */}
            {(parseInt(duration) > 0 || isManualMode) && (
              <Collapsible className="border border-gray-200 rounded-lg">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-3 md:p-4 hover:bg-gray-50">
                    <span className="text-sm font-medium">{t("indexCalculatorPage.showAdditionalInvestments")}</span>
                    <ChevronsUpDown className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="border-t border-gray-200">
                  {additionalInvestmentFrequency === 'each month' ? (
                    // Monthly investments with year grouping
                    <div className="space-y-4 p-4">
                      {Array.from({ length: Math.ceil(additionalInvestments.length / 12) }, (_, yearIndex) => {
                        const yearStart = yearIndex * 12;
                        const yearEnd = Math.min(yearStart + 12, additionalInvestments.length);
                        const yearInvestments = additionalInvestments.slice(yearStart, yearEnd);
                        
                        return (
                          <Collapsible key={yearIndex} className="border border-gray-200 rounded-lg">
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" className="w-full justify-between p-3 hover:bg-gray-50">
                                <span className="text-sm font-medium">
                                  {t("indexCalculatorPage.yearHeader")} {yearIndex + 1}
                                </span>
                                <ChevronsUpDown className="h-4 w-4" />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              {/* Desktop Table */}
                              <div className="hidden md:block">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="w-auto px-4 py-3 text-sm bg-white font-medium">
                                        {t("indexCalculatorPage.monthHeader")}
                                      </TableHead>
                                      <TableHead className="w-[200px] px-4 py-3 text-sm bg-white font-medium text-right">
                                        {t("indexCalculatorPage.amountHeader")}
                                      </TableHead>
                                      <TableHead className="w-[50px] px-2 py-3 text-sm bg-white text-center">
                                        {isManualMode && t("indexCalculatorPage.actionsHeader")}
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {yearInvestments.map((investment, monthIndex) => {
                                      const absoluteIndex = yearStart + monthIndex;
                                      const monthNumber = absoluteIndex + 1;
                                      return (
                                        <TableRow key={absoluteIndex} className="hover:bg-transparent">
                                          <TableCell className="px-7 py-3 text-sm font-medium">
                                            {getMonthName(monthIndex)} ({monthNumber})
                                          </TableCell>
                                          <TableCell className="px-4 py-3 text-sm text-right">
                                            <CurrencyInput
                                              value={investment.amount}
                                              onValueChange={(value) => handleManualAmountChange(absoluteIndex, value || '')}
                                              placeholder=""
                                              prefix=""
                                              readOnly={!isManualMode}
                                              className={`text-right w-full h-10 text-sm px-3 ${
                                                isManualMode 
                                                  ? 'border border-gray-200 rounded-md bg-white' 
                                                  : 'bg-transparent border-0 cursor-default'
                                              }`}
                                            />
                                          </TableCell>
                                          <TableCell className="px-2 py-3 text-sm text-center">
                                            {isManualMode && (
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteManualInvestment(absoluteIndex)}
                                                className="h-10 w-10 p-0 text-red-500 hover:text-red-700"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            )}
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </div>

                              {/* Mobile Table */}
                              <div className="md:hidden">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="w-auto px-3 py-2 text-sm bg-white">
                                        {t("indexCalculatorPage.monthHeader")}
                                      </TableHead>
                                      <TableHead className="w-[120px] px-0.5 py-2 text-sm bg-white text-right">
                                        {t("indexCalculatorPage.amountHeader")}
                                      </TableHead>
                                      <TableHead className="w-[40px] px-0.5 py-2 text-sm bg-white"></TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {yearInvestments.map((investment, monthIndex) => {
                                      const absoluteIndex = yearStart + monthIndex;
                                      const monthNumber = absoluteIndex + 1;
                                      return (
                                        <TableRow key={absoluteIndex} className="hover:bg-transparent">
                                          <TableCell className="px-6 py-1.5">
                                            <div className="text-sm font-medium">
                                              {getMonthName(monthIndex)} ({monthNumber})
                                            </div>
                                          </TableCell>
                                          <TableCell className="px-0.5 py-1.5">
                                            <CurrencyInput
                                              value={investment.amount}
                                              onValueChange={(value) => handleManualAmountChange(absoluteIndex, value || '')}
                                              placeholder=""
                                              prefix=""
                                              readOnly={!isManualMode}
                                              className={`text-right w-full h-8 text-sm px-1.5 ${
                                                isManualMode 
                                                  ? 'border border-gray-200 rounded-md bg-white' 
                                                  : 'bg-transparent border-0'
                                              }`}
                                            />
                                          </TableCell>
                                          <TableCell className="px-0.5 py-1.5">
                                            {isManualMode && (
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteManualInvestment(absoluteIndex)}
                                                className="h-8 w-8 p-0 shrink-0"
                                              >
                                                <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                              </Button>
                                            )}
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      })}
                    </div>
                  ) : (
                    // Yearly investments - simple table
                    <>
                      {/* Desktop Table */}
                      <div className="hidden md:block">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-auto px-4 py-3 text-sm bg-white font-medium">
                                {t("indexCalculatorPage.yearHeader")}
                              </TableHead>
                              <TableHead className="w-[200px] px-4 py-3 text-sm bg-white font-medium text-right">
                                {t("indexCalculatorPage.amountHeader")}
                              </TableHead>
                              <TableHead className="w-[50px] px-2 py-3 text-sm bg-white text-center">
                                {isManualMode && t("indexCalculatorPage.actionsHeader")}
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {additionalInvestments.map((investment, index) => (
                              <TableRow key={index} className="hover:bg-transparent">
                                <TableCell className="px-7 py-3 text-sm font-medium">
                                  {index + 1}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-sm text-right">
                                  <CurrencyInput
                                    value={investment.amount}
                                    onValueChange={(value) => handleManualAmountChange(index, value || '')}
                                    placeholder=""
                                    prefix=""
                                    readOnly={!isManualMode}
                                    className={`text-right w-full h-10 text-sm px-3 ${
                                      isManualMode 
                                        ? 'border border-gray-200 rounded-md bg-white' 
                                        : 'bg-transparent border-0 cursor-default'
                                    }`}
                                  />
                                </TableCell>
                                <TableCell className="px-2 py-3 text-sm text-center">
                                  {isManualMode && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => deleteManualInvestment(index)}
                                      className="h-10 w-10 p-0 text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                       <div className="md:hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-auto px-3 py-2 text-sm bg-white">
                                  {t("indexCalculatorPage.yearHeader")}
                                </TableHead>
                                <TableHead className="w-[120px] px-0.5 py-2 text-sm bg-white text-right">
                                  {t("indexCalculatorPage.amountHeader")}
                                </TableHead>
                                <TableHead className="w-[40px] px-0.5 py-2 text-sm bg-white"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {additionalInvestments.map((investment, index) => (
                                <TableRow key={index} className="hover:bg-transparent">
                                  <TableCell className="px-6 py-1.5">
                                    <div className="text-sm font-medium">{index + 1}</div>
                                  </TableCell>
                                  <TableCell className="px-0.5 py-1.5">
                                    <CurrencyInput
                                      value={investment.amount}
                                      onValueChange={(value) => handleManualAmountChange(index, value || '')}
                                      placeholder=""
                                      prefix=""
                                      readOnly={!isManualMode}
                                      className={`text-right w-full h-8 text-sm px-1.5 ${
                                        isManualMode 
                                          ? 'border border-gray-200 rounded-md bg-white' 
                                          : 'bg-transparent border-0'
                                      }`}
                                    />
                                  </TableCell>
                                  <TableCell className="px-0.5 py-1.5">
                                    {isManualMode && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteManualInvestment(index)}
                                        className="h-8 w-8 p-0 shrink-0"
                                      >
                                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                      </Button>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                    </>
                  )}

                  {/* Add Row Button for Manual Mode */}
                  {isManualMode && (
                    <div className="p-3 border-t border-gray-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addManualInvestment}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {additionalInvestmentFrequency === 'each month' 
                          ? t("indexCalculatorPage.addMonth") 
                          : t("indexCalculatorPage.addYear")
                        }
                      </Button>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
          {/* Calculate Button */}
          <Button 
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3"
            onClick={handleCalculate}
          >
            {t("common.calculate")}
          </Button>
          {calculationResult && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-3">{t("indexCalculatorPage.results")}</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("indexCalculatorPage.finalBalance")}:</span>
                  <span className="font-semibold">
                    {calculationResult.finalBalance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })} RUB
                  </span>
                </div>

              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}