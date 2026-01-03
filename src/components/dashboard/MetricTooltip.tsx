import { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { getMetricDefinition } from "@/lib/metricDefinitions";

export interface MetricTooltipProps {
  children?: ReactNode;
  content?: string;
  metricKey?: string;
  metric?: string; // Alias for metricKey for backward compatibility
}

export function MetricTooltip({ children, content, metricKey, metric }: MetricTooltipProps) {
  // Support both metricKey and metric props
  const key = metricKey || metric;
  const tooltipContent = content || (key ? getMetricDefinition(key) : "");

  if (!tooltipContent) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children || (
            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
          )}
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
