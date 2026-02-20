import * as React from 'react'
import { cn } from '@/lib/utils'

interface SheetContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SheetContext = React.createContext<SheetContextValue | null>(null)

function useSheet() {
  const context = React.useContext(SheetContext)
  if (!context) {
    throw new Error('Sheet components must be used within a Sheet')
  }
  return context
}

interface SheetProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

function Sheet({ open = false, onOpenChange, children }: SheetProps) {
  return (
    <SheetContext.Provider value={{ open: open ?? false, onOpenChange: onOpenChange ?? (() => {}) }}>
      {children}
    </SheetContext.Provider>
  )
}

const SheetTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ onClick, ...props }, ref) => (
  <button
    ref={ref}
    onClick={(e) => {
      onClick?.(e)
      useSheet().onOpenChange(true)
    }}
    {...props}
  />
))
SheetTrigger.displayName = 'SheetTrigger'

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'left' | 'right'
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ className, side = 'left', children, ...props }, ref) => {
    const { open, onOpenChange } = useSheet()

    return (
      <>
        {open && (
          <div
            className="fixed inset-0 z-40 bg-black/50 animate-fade-in"
            onClick={() => onOpenChange(false)}
            aria-hidden="true"
          />
        )}
        <div
          ref={ref}
          className={cn(
            'fixed top-0 z-50 h-full w-80 max-w-[85vw] bg-card shadow-xl transition-transform duration-300',
            side === 'left' ? 'left-0' : 'right-0',
            open ? 'translate-x-0' : side === 'left' ? '-translate-x-full' : 'translate-x-full',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </>
    )
  }
)
SheetContent.displayName = 'SheetContent'

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
)

const SheetTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={cn('text-lg font-semibold', className)} {...props} />
)

const SheetClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, ...props }, ref) => {
  const { onOpenChange } = useSheet()
  return (
    <button
      ref={ref}
      onClick={(e) => {
        onClick?.(e)
        onOpenChange(false)
      }}
      {...props}
    />
  )
})
SheetClose.displayName = 'SheetClose'

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose }
