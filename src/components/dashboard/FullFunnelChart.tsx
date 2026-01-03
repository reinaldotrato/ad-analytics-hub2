import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface FullFunnelChartProps {
  data?: any;
  isLoading?: boolean;
}

export function FullFunnelChart({ data, isLoading }: FullFunnelChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Funil Completo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  const rawData = Array.isArray(data) ? data : (data?.stages || []);
  const chartData = rawData.map((item: any, index: number) => ({
    ...item,
    stage: item.stage || item.name || `Etapa ${index + 1}`,
    value: item.value || item.count || 0,
    fill: item.fill || `hsl(${220 + index * 20}, 70%, ${50 + index * 5}%)`,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funil Completo</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="stage" type="category" width={100} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
              }}
            />
            <Bar dataKey="value" fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
