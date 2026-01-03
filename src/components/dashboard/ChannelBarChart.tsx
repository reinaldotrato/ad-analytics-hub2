import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ChannelData {
  channel: string;
  spend: number;
  leads: number;
  cpl: number;
}

interface ChannelBarChartProps {
  data?: ChannelData[];
  isLoading?: boolean;
  title?: string;
}

export function ChannelBarChart({
  data = [],
  isLoading,
  title = "Desempenho por Canal",
}: ChannelBarChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="channel" />
            <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" />
            <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--secondary))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
              }}
              formatter={(value: number, name: string) => {
                if (name === "spend" || name === "cpl") {
                  return [
                    new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(value),
                    name === "spend" ? "Investimento" : "CPL",
                  ];
                }
                return [value, "Leads"];
              }}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="spend"
              fill="hsl(var(--primary))"
              name="Investimento"
            />
            <Bar
              yAxisId="right"
              dataKey="leads"
              fill="hsl(var(--secondary))"
              name="Leads"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
