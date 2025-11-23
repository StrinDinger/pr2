import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

const data = [
  { month: "Jan", value: 10000 },
  { month: "Feb", value: 10500 },
  { month: "Mar", value: 10200 },
  { month: "Apr", value: 11000 },
  { month: "May", value: 11800 },
  { month: "Jun", value: 12500 },
  { month: "Jul", value: 12200 },
  { month: "Aug", value: 13000 },
  { month: "Sep", value: 13500 },
  { month: "Oct", value: 14200 },
  { month: "Nov", value: 14800 },
  { month: "Dec", value: 15500 },
];

export function PortfolioGrowth() {
  const totalGrowth = ((data[data.length - 1].value - data[0].value) / data[0].value) * 100;

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <CardTitle>Portfolio Growth</CardTitle>
        <CardDescription>Track your portfolio over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Value"]}
                contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb" }}
              />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-between p-4 bg-green-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Total Growth</p>
            <p className="text-green-600">${(data[data.length - 1].value - data[0].value).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp className="h-5 w-5" />
            <span>+{totalGrowth.toFixed(1)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
