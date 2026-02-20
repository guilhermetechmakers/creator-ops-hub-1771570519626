import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export interface ToggleLoginSignupSwitchProps {
  /** Current mode: 'login' | 'signup' */
  mode: 'login' | 'signup'
  /** Callback when mode changes */
  onModeChange: (mode: 'login' | 'signup') => void
  className?: string
}

export function ToggleLoginSignupSwitch({
  mode,
  onModeChange,
  className,
}: ToggleLoginSignupSwitchProps) {
  return (
    <div
      role="tablist"
      aria-label="Authentication mode"
      className={cn(
        'inline-flex p-1 rounded-xl bg-muted/60 border border-input',
        className
      )}
    >
      <Button
        variant="ghost"
        size="sm"
        role="tab"
        aria-selected={mode === 'login'}
        aria-controls="login-panel"
        id="login-tab"
        onClick={() => onModeChange('login')}
        className={cn(
          'rounded-lg px-6 py-2.5 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          mode === 'login'
            ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        )}
      >
        Log in
      </Button>
      <Button
        variant="ghost"
        size="sm"
        role="tab"
        aria-selected={mode === 'signup'}
        aria-controls="signup-panel"
        id="signup-tab"
        onClick={() => onModeChange('signup')}
        className={cn(
          'rounded-lg px-6 py-2.5 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          mode === 'signup'
            ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        )}
      >
        Sign up
      </Button>
    </div>
  )
}
