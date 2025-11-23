"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { IndexCalculator } from '../components/IndexCalculator';

type Language = 'en' | 'ru'

// Your existing translations object - copy exactly as is
const translations = {
  ru: {
    common: {
      enterAmount: "Введите сумму",
      calculate: "Рассчитать",
      warning: "Внимание",
      portfolio: "Портфель",
      totalAllocated: "Итого распределено",
      other: "Прочие",
      yes: "Да",
      no: "Нет"
    },
    homePage: {
      investorsCalculatorHeader: "Калькулятор инвестиций",
      portfolioAllocation: "Портфель", 
      portfolioAllocationDescription: "Распределить сумму для покупки акций", 
      investmentCalculator: "Калькулятор вложений",
      investmentCalculatorDescription: "Рассчитать сумму в конце периода"
    },
    months: {
      january: "Янв.",
      february: "Фев.",
      march: "Март",
      april: "Апр.",
      may: "Май",
      june: "Июнь",
      july: "Июль",
      august: "Авг.",
      september: "Сент.",
      october: "Окт.",
      november: "Нояб.",
      december: "Дек."
    },
    portfolioAllocation: {
      totalStocks: "Акций",
      portfolioDistributionByWeight: "Распределение по весу",
      totalWeight: "Вес",
      totalSum: "Сумма",
      header: "Портфель",
      investmentLabel: "Планирую инвестировать",
      portfolioHeader: "Состав портфеля",
      addRow: "Добавить строку",
      additionalCommands: "Дополнительно",
      distributeWeightsEvenly: "Распределить веса равномерно",
      copyIndexIMOEX: "Заполнить по индексу Мосбиржи",
      stock: "Акция",
      price: "Цена",
      weight: "Вес",
      lotSize: "Размер лота",
      lots: "Лоты",
      sum: "Сумма",
      // Table headers
      stockHeader: "Акция",
      priceHeader: "Цена", 
      weightHeader: "Вес",
      lotSizeHeader: "Размер лота",
      lotsHeader: "Лоты",
      sumHeader: "Сумма",
      // Mobile labels
      lotsMobile: "Лоты:",
      sumMobile: "Сумма:"
    },
    allocationSummary: {
      header: "Итоги по портфелю",
      totalBudget: "К распределению",
      totalInvested: "Распределено", 
      remaining: "Остаток",
      utilization: "Использовано средств"
    },
    indexCalculatorPage:{
      header: "Калькулятор вложений",
      initialInvestment: "Начальное вложение",
      duration: "Срок",
      years: "лет",
      months:"месяцев",
      indexCalculatorPage: "",
      interestRate: "Ставка",
      additionalInvestmentGrowthRate: "Индексация",
      perYear: "% годовых",
      reinvest: "Реинвестировать доход",
      additionalInvestment:"Доп. вложения",
      eachYear: "раз в год",
      eachMonth: "раз в месяц",
      showAdditionalInvestments: "Вложения",
      yearHeader:"Год",
      monthHeader: "Месяц",
      amountHeader: "Вложение",
      setManually: "Указать произвольные значения",
      manualMode: "Произвольный режим",
      addYear: "Добавить",
      actionsHeader: "",
      results: "Результаты",
      finalBalance: "Итоговая сумма",
      breakdown: "Изменение за период"
    },
    validation: {
      incompleteFields: "Значения (акция, цена и вес) должны быть заполнены во всех строках. Цена и вес должны быть положительными.",
      weightExceeds: "Общий вес превышает 100%",
      investmentRequired: "Введите сумму инвестиций"
    }
  },
  en: {
    common: {
      enterAmount: "Enter amount",
      calculate: "Calculate",
      warning: "Warning",
      portfolio: "Portfolio",
      totalAllocated: "Total Allocated",
      other: "Other",
      yes: "Yes",
      no: "No"
    },
    months: {
      january: "Jan",
      february: "Feb",
      march: "Mar",
      april: "Apr",
      may: "May",
      june: "Jun",
      july: "Jul",
      august: "Aug",
      september: "Sep",
      october: "Oct",
      november: "Nov",
      december: "Dec"
    },
    homePage: {
      investorsCalculatorHeader: "Investment calculator",
      portfolioAllocation: "Portfolio",
      portfolioAllocationDescription: "Plan your investment distribution",
      investmentCalculator: "Investment calculator", 
      investmentCalculatorDescription: "Calculate expected returns"
    },
    portfolioAllocation: {
      totalStocks: "Stocks",
      totalWeight: "Weight",
      totalSum: "Sum",
      header: "Portfolio Allocation",
      investmentLabel: "Investment (planned)",
      portfolioHeader: "Portfolio",
      portfolioDistributionByWeight: "Distribution by weight",
      addRow: "Add Row",
      additionalCommands: "More",
      distributeWeightsEvenly: "Distribute weights evenly",
      copyIndexIMOEX: "Copy index IMOEX", 
      stock: "Stock",
      price: "Price",
      weight: "Weight",
      lotSize: "Lot Size",
      lots: "Lots",
      sum: "Sum",
      // Table headers
      stockHeader: "Stock",
      priceHeader: "Price",
      weightHeader: "Weight", 
      lotSizeHeader: "Lot Size",
      lotsHeader: "Lots",
      sumHeader: "Sum",
      // Mobile labels
      lotsMobile: "Lots:",
      sumMobile: "Sum:"
    },
    allocationSummary: {
      header: "Portfolio Summary",
      totalBudget: "Total Budget",
      totalInvested: "Total Invested",
      remaining: "Remaining",
      utilization: "Utilization"
    },
    validation: {
      incompleteFields: "Please fill in all required fields (stock, price, weight) with positive values for all rows",
      weightExceeds: "Total weight exceeds 100% (current: {current}%)",
      investmentRequired: "Please, enter an investment amount"
    },
    indexCalculatorPage:{
      header: "Investment calculator",
      initialInvestment: "Initial investment",
      duration: "Duration",
      years: "years",
      months: "months",
      indexCalculatorPage: "",
      interestRate: "Interest rate",
      additionalInvestmentGrowthRate: "Indexation",
      perYear: "% year",
      reinvest: "Reinvest",
      additionalInvestment:"Additional investment",
      eachYear: "each year",
      eachMonth: "each month",
      showAdditionalInvestments: "Additional investments",
      yearHeader: "Year",
      monthHeader: "Month",
      amountHeader: "Amount",
      setManually: "Set manually",
      addYear: "Add",
      actionsHeader: "",
      manualMode: "Manual mode",
      results:"Results",
      breakdown: "Breakdown",
      finalBalance: "Total amount"
    },
  }
};

interface LanguageContextType {
  currentLanguage: Language;
  changeLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
  return "ru";
  // Detect browser language on initial load
  if (typeof window !== 'undefined') {
    const browserLang = navigator.language; // e.g., 'en-US', 'ru-RU'
    if (browserLang.startsWith('ru')) return 'ru';
    if (browserLang.startsWith('en')) return 'en';
  }
  return 'ru'; // fallback
});
  
  const changeLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
  };

  // Your existing t function - copy exactly as is
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[currentLanguage];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Key not found, return the original key for debugging
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};