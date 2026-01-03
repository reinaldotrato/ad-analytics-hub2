import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert as AlertUI, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Info, ExternalLink } from "lucide-react";

export interface Alert {
  level: 'info' | 'warning' | 'critical';
  message: string;
  action?: {
    label: string;
    handler: () => void;
  };
}

interface CapacityAlertsProps {
  alerts: Alert[];
}

const alertConfig = {
  info: {
    icon: Info,
    variant: 'default' as const,
    className: 'border-blue-500/50 bg-blue-500/10',
  },
  warning: {
    icon: AlertTriangle,
    variant: 'default' as const,
    className: 'border-yellow-500/50 bg-yellow-500/10',
  },
  critical: {
    icon: AlertTriangle,
    variant: 'destructive' as const,
    className: 'border-destructive/50 bg-destructive/10',
  },
};

export function CapacityAlerts({ alerts }: CapacityAlertsProps) {
  if (!alerts || alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AlertUI className="border-green-500/50 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription>
              Todos os sistemas operando normalmente
            </AlertDescription>
          </AlertUI>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Alertas ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert, index) => {
          const config = alertConfig[alert.level];
          const Icon = config.icon;

          return (
            <AlertUI key={index} className={config.className}>
              <Icon className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{alert.message}</span>
                {alert.action && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={alert.action.handler}
                    className="ml-2 gap-1"
                  >
                    {alert.action.label}
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
              </AlertDescription>
            </AlertUI>
          );
        })}
      </CardContent>
    </Card>
  );
}
