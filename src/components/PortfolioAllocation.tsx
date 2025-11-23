import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Stocks", value: 45, color: "#ff0000" },
  { name: "Bonds", value: 30, color: "#00ff00" },
];

export function PortfolioAllocation() {
  return (
    <Card className="border-4 border-blue-500">
      <CardHeader>
        <CardTitle>Portfolio Allocation - DEBUG</CardTitle>
        <CardDescription>Testing if chart renders</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 300, border: '2px solid red' }}>
          <h3>Test Chart - Should show colored segments</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400">
          <h4 className="font-bold">Debug Info:</h4>
          <p>If you see bright red/green segments above, chart is working</p>
          <p>If you only see gray container, chart is not rendering</p>
        </div>
      </CardContent>
    </Card>
  );
}