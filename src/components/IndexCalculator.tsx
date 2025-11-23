import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Calculator } from "lucide-react";
import { useState } from "react";

export function IndexCalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculateReturn = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const t = parseFloat(years);

    if (p && r && t) {
      const futureValue = p * Math.pow(1 + r, t);
      setResult(futureValue);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <CardTitle>Index Calculator</CardTitle>
        <CardDescription>Calculate expected returns</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="principal">Initial Investment ($)</Label>
          <Input
            id="principal"
            type="number"
            placeholder="10000"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rate">Annual Return (%)</Label>
          <Input
            id="rate"
            type="number"
            placeholder="7"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="years">Time Period (years)</Label>
          <Input
            id="years"
            type="number"
            placeholder="10"
            value={years}
            onChange={(e) => setYears(e.target.value)}
          />
        </div>
        <Button onClick={calculateReturn} className="w-full">
          <Calculator className="mr-2 h-4 w-4" />
          Calculate
        </Button>
        {result !== null && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Future Value</p>
            <p className="text-blue-600">${result.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
