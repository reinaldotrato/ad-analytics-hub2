import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, PartyPopper, Target, Star } from 'lucide-react';

interface GoalCelebrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'daily' | 'monthly';
  sellerName?: string;
  goalValue: number;
  achievedValue: number;
}

export function GoalCelebrationDialog({
  open,
  onOpenChange,
  type,
  sellerName,
  goalValue,
  achievedValue,
}: GoalCelebrationDialogProps) {
  const [confetti, setConfetti] = useState<{ id: number; left: number; delay: number; color: string }[]>([]);

  useEffect(() => {
    if (open) {
      // Gerar confetes
      const newConfetti = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][Math.floor(Math.random() * 6)],
      }));
      setConfetti(newConfetti);
    }
  }, [open]);

  const getMessage = () => {
    if (type === 'daily') {
      return {
        title: 'Meta Diária Atingida! 🎯',
        subtitle: sellerName ? `Parabéns, ${sellerName}!` : 'Parabéns!',
        description: 'Você alcançou sua meta do dia. Continue com esse ritmo!',
        icon: Target,
      };
    }
    return {
      title: 'Meta Mensal Batida! 🏆',
      subtitle: sellerName ? `Incrível, ${sellerName}!` : 'Incrível!',
      description: 'Você superou a meta do mês. Isso merece uma celebração!',
      icon: Trophy,
    };
  };

  const message = getMessage();
  const Icon = message.icon;
  const percentAchieved = goalValue > 0 ? ((achievedValue / goalValue) * 100).toFixed(0) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        {/* Confetti animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {confetti.map((c) => (
            <div
              key={c.id}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                left: `${c.left}%`,
                top: '-10px',
                backgroundColor: c.color,
                animationDelay: `${c.delay}s`,
              }}
            />
          ))}
        </div>

        <DialogHeader className="text-center pt-6">
          <div className="mx-auto mb-4 relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center animate-bounce-slow">
              <Icon className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Star className="h-8 w-8 text-amber-400 animate-pulse" fill="currentColor" />
            </div>
          </div>
          <DialogTitle className="text-2xl">{message.title}</DialogTitle>
          <DialogDescription className="text-lg font-medium text-foreground">
            {message.subtitle}
          </DialogDescription>
        </DialogHeader>

        <div className="text-center py-4">
          <p className="text-muted-foreground mb-4">{message.description}</p>
          
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <div className="text-4xl font-bold text-primary">{percentAchieved}%</div>
            <div className="text-sm text-muted-foreground">da meta alcançada</div>
          </div>

          <div className="flex justify-center gap-2">
            <PartyPopper className="h-6 w-6 text-amber-500 animate-bounce" />
            <span className="text-lg font-medium">Excelente trabalho!</span>
            <PartyPopper className="h-6 w-6 text-amber-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>

        <div className="flex justify-center pb-4">
          <Button onClick={() => onOpenChange(false)} size="lg">
            Continuar vendendo! 💪
          </Button>
        </div>

        <style>{`
          @keyframes confetti {
            0% {
              transform: translateY(0) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(400px) rotate(720deg);
              opacity: 0;
            }
          }
          .animate-confetti {
            animation: confetti 3s ease-out forwards;
          }
          @keyframes bounce-slow {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          .animate-bounce-slow {
            animation: bounce-slow 2s ease-in-out infinite;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
