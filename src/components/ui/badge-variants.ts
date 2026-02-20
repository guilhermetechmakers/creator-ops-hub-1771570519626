import { cva } from 'class-variance-authority'

export const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground',
        destructive:
          'border-transparent bg-destructive text-white',
        outline: 'text-foreground',
        success:
          'border-transparent bg-success text-white',
        warning:
          'border-transparent bg-amber-500 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)
