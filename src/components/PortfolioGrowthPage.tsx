import { Page } from "./App";
import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";

interface PortfolioGrowthPageProps {
  onNavigate: (page: Page) => void;
}

export function PortfolioGrowthPage({ onNavigate }: PortfolioGrowthPageProps) {
  return (
    <>
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => onNavigate("home")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1>Portfolio Growth</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-500">Portfolio growth tracker coming soon...</p>
        </div>
      </main>
    </>
  );
}
