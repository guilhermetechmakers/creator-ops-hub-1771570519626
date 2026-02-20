import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface SocialOAuthButton {
  id: string
  label: string
  icon: LucideIcon
  onClick: () => void | Promise<void>
  disabled?: boolean
}

export interface SocialOAuthButtonsProps {
  buttons: SocialOAuthButton[]
  className?: string
}

export function SocialOAuthButtons({ buttons, className }: SocialOAuthButtonsProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {buttons.map(({ id, label, icon: Icon, onClick, disabled }) => (
        <Button
          key={id}
          type="button"
          variant="outline"
          className="w-full h-11 font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:border-primary/50 hover:bg-primary/5"
          onClick={onClick}
          disabled={disabled}
          aria-label={`Continue with ${label}`}
        >
          <Icon className="h-5 w-5 mr-2" aria-hidden />
          Continue with {label}
        </Button>
      ))}
    </div>
  )
}
