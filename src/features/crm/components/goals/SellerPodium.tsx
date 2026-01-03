import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface PodiumSeller {
  id: string;
  name: string;
  avatarUrl?: string;
  value: number;
  valueGoal: number;
  progressPercent: number;
}

interface SellerPodiumProps {
  sellers: PodiumSeller[];
}

export function SellerPodium({ sellers }: SellerPodiumProps) {
  if (sellers.length === 0) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const podiumConfig = [
    {
      position: 1,
      icon: Trophy,
      height: 'h-32',
      bgGradient: 'bg-gradient-to-b from-amber-400 to-yellow-500',
      borderColor: 'border-amber-400',
      shadowColor: 'shadow-amber-400/50',
      order: 'order-2',
      avatarSize: 'h-20 w-20',
      textColor: 'text-amber-500',
    },
    {
      position: 2,
      icon: Medal,
      height: 'h-24',
      bgGradient: 'bg-gradient-to-b from-slate-300 to-slate-400',
      borderColor: 'border-slate-400',
      shadowColor: 'shadow-slate-400/50',
      order: 'order-1',
      avatarSize: 'h-16 w-16',
      textColor: 'text-slate-500',
    },
    {
      position: 3,
      icon: Award,
      height: 'h-20',
      bgGradient: 'bg-gradient-to-b from-amber-600 to-amber-800',
      borderColor: 'border-amber-700',
      shadowColor: 'shadow-amber-700/50',
      order: 'order-3',
      avatarSize: 'h-16 w-16',
      textColor: 'text-amber-700',
    },
  ];

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="h-5 w-5 text-amber-500" />
        <h3 className="font-semibold text-lg">Pódio do Mês</h3>
      </div>

      <div className="flex justify-center items-end gap-4">
        {podiumConfig.map((config) => {
          const seller = sellers[config.position - 1];
          if (!seller) return null;

          const Icon = config.icon;
          const metBatida = seller.progressPercent >= 100;

          return (
            <div
              key={config.position}
              className={cn(
                "flex flex-col items-center animate-fade-in",
                config.order
              )}
              style={{ animationDelay: `${config.position * 100}ms` }}
            >
              {/* Avatar com medalha */}
              <div className="relative mb-2">
                <Avatar
                  className={cn(
                    config.avatarSize,
                    "border-4 shadow-lg",
                    config.borderColor,
                    config.shadowColor,
                    metBatida && "ring-4 ring-green-400 ring-offset-2"
                  )}
                >
                  <AvatarImage src={seller.avatarUrl} />
                  <AvatarFallback className={cn("text-lg font-bold", config.bgGradient, "text-white")}>
                    {getInitials(seller.name)}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "absolute -top-2 -right-2 rounded-full p-1",
                    config.bgGradient,
                    "shadow-md"
                  )}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>
                {metBatida && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-lg">
                    🎉
                  </div>
                )}
              </div>

              {/* Nome e stats */}
              <p className="font-semibold text-sm text-center max-w-24 truncate mb-1">
                {seller.name.split(' ')[0]}
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                {formatCurrency(seller.value)}
              </p>

              {/* Pódio */}
              <div
                className={cn(
                  "w-24 rounded-t-lg flex flex-col items-center justify-start pt-2 shadow-lg",
                  config.height,
                  config.bgGradient
                )}
              >
                <span className="text-2xl font-bold text-white drop-shadow-md">
                  {config.position}º
                </span>
                <span className="text-xs text-white/90 font-medium mt-1">
                  {seller.progressPercent.toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
