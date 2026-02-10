type LoadingSpinnerProps = {
  size?: 'small' | 'large';
};

export function LoadingSpinner({ size = 'large' }: LoadingSpinnerProps) {
  const sizeClasses = size === 'small' ? 'w-6 h-6' : 'w-12 h-12';

  return (
    <div className="flex items-center justify-center p-8" role="status" aria-label="Loading">
      <div
        className={`${sizeClasses} border-3 border-border border-t-accent rounded-full animate-spin`}
      />
    </div>
  );
}
