import { AlertTriangle, AlertCircle, Info, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface CapacityAlert {
  type: string;
  level: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  action?: string;
}

interface CapacityAlertsProps {
  alerts?: CapacityAlert[];
}

const levelConfig = {
  info: {
    icon: Info,
    variant: "default" as const,
  },
  warning: {
    icon: AlertTriangle,
    variant: "default" as const,
  },
  error: {
    icon: AlertCircle,
    variant: "destructive" as const,
  },
  success: {
    icon: CheckCircle,
    variant: "default" as const,
  },
};

export function CapacityAlerts({ alerts = [] }: CapacityAlertsProps) {
  if (alerts.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        Nenhum alerta ativo no momento
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => {
        const config = levelConfig[alert.level];
        const Icon = config.icon;

        return (
          <Alert key={index} variant={config.variant}>
            <Icon className="h-4 w-4" />
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>{alert.message}</span>
              {alert.action && (
                <Button variant="outline" size="sm" className="ml-2">
                  {alert.action}
                </Button>
              )}
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
}
