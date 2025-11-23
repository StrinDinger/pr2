'use client'

import { Page } from "../types";
import { PieChart, Calculator, TrendingUp } from "lucide-react";
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageDropdown } from  "./LanguageDropdown"
import { useState, useEffect } from 'react';

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { t, currentLanguage, changeLanguage } = useLanguage();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state or nothing during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="h-9 w-9 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </header>
        {/* Add more loading skeletons if needed */}
      </div>
    );
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">
              {t("homePage.investorsCalculatorHeader")}
            </h1>
            <LanguageDropdown />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2 max-w-6xl mx-auto">
          <button
            onClick={() => onNavigate("portfolioAllocation")}
            className="bg-white border-2 border-gray-200 rounded-lg p-12 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer group"
          >
            <div className="flex flex-col items-center gap-4">
              <PieChart className="h-16 w-16 text-gray-400 group-hover:text-blue-500 transition-colors" />
              <h2 className="text-center">{t('homePage.portfolioAllocation')}</h2>
              <p className="text-gray-500 text-center text-sm">
                {t('homePage.portfolioAllocationDescription')}
              </p>
            </div>
          </button>

          <button
            onClick={() => onNavigate("indexCalculator")}
            className="bg-white border-2 border-gray-200 rounded-lg p-12 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer group"
          >
            <div className="flex flex-col items-center gap-4">
              <Calculator className="h-16 w-16 text-gray-400 group-hover:text-blue-500 transition-colors" />
              <h2 className="text-center">{t('homePage.investmentCalculator')}</h2>
              <p className="text-gray-500 text-center text-sm">
                {t('homePage.investmentCalculatorDescription')}
              </p>
            </div>
          </button>
        </div>
      </main>
    </>
  );
}