import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type LoadingProps = {
  /**
   * Optional message to display below the spinner
   */
  message?: string;
  /**
   * Additional class names to apply to the container
   */
  className?: string;
  /**
   * Size of the spinner (default: 'default')
   */
  size?: 'sm' | 'default' | 'lg';
};

export function Loading({
  message,
  className,
  size = 'default',
  ...props
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const textSizes = {
    sm: 'text-sm',
    default: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2',
        className
      )}
      {...props}
    >
      <Loader2
        className={cn(
          'animate-spin text-primary',
          sizeClasses[size]
        )}
      />
      {message && (
        <p
          className={cn(
            'text-muted-foreground',
            textSizes[size]
          )}
        >
          {message}
        </p>
      )}
    </div>
  );
}
