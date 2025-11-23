'use client'
import { useState } from 'react'
import { Page } from '../types'
import { HomePage } from './HomePage'
import { PortfolioAllocationPage } from './PortfolioAllocationPage'
import { PortfolioGrowthPage } from './PortfolioGrowthPage'
import { IndexCalculatorPage } from './IndexCalculatorPage'

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />
      case 'portfolioAllocation':
        return <PortfolioAllocationPage onNavigate={setCurrentPage} />
      case 'portfolioGrowth':
        return <PortfolioGrowthPage onNavigate={setCurrentPage} />
      case 'indexCalculator':
        return <IndexCalculatorPage onNavigate={setCurrentPage} />
      default:
        return <HomePage onNavigate={setCurrentPage} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {renderPage()}
    </div>
  )
}