import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  id?: string;
}

export function GlassCard({ children, className, hover = false, onClick, id }: GlassCardProps) {
  return (
    <div
      id={id}
      onClick={onClick}
      className={cn(
        'glass-card',
        hover && 'cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}
