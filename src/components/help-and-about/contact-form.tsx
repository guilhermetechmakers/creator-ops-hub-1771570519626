import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Send, MessageSquare, Loader2, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { submitSupportTicket } from '@/lib/help-and-about-ops'
import { supabase } from '@/lib/supabase'

const MAX_DESCRIPTION_LENGTH = 2000

const schema = z.object({
  title: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  description: z.string().max(MAX_DESCRIPTION_LENGTH, 'Message too long').optional(),
})

type FormData = z.infer<typeof schema>

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session)
    })
  }, [])

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '' },
  })

  const hasErrors = !!errors.title || !!errors.description
  const descriptionValue = watch('description') ?? ''
  const descriptionLength = descriptionValue.length

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      await submitSupportTicket(data.title, data.description)
      toast.success('Ticket submitted. We\'ll get back to you soon.')
      reset()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="animate-fade-in border-primary/10 bg-gradient-to-br from-card to-primary/5 transition-all duration-300 hover:shadow-card-hover hover:border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-h3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          Contact Support
        </CardTitle>
        <p className="text-small text-muted-foreground">
          Submit a ticket or request. We typically respond within 24 hours.
        </p>
      </CardHeader>
      <CardContent>
        {isAuthenticated === null ? (
          <div className="flex items-center justify-center py-12 animate-pulse" role="status" aria-label="Loading">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !isAuthenticated ? (
          <div
            className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-muted bg-muted/20 p-8 text-center animate-fade-in"
            role="status"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Sign in to submit a ticket</h3>
              <p className="text-small text-muted-foreground max-w-[280px]">
                Create an account or sign in to submit a support request. We typically respond within 24 hours.
              </p>
            </div>
            <Button asChild className="gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
              <Link to="/login-/-signup?mode=login">
                <LogIn className="h-4 w-4" />
                Sign in to submit
              </Link>
            </Button>
          </div>
        ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={cn(
            'space-y-4',
            hasErrors && 'animate-shake'
          )}
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="contact-title">Subject</Label>
            <Input
              id="contact-title"
              placeholder="Brief description of your issue"
              {...register('title')}
              className={cn(
                'transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring',
                errors.title && 'border-destructive focus-visible:ring-destructive'
              )}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'contact-title-error' : undefined}
            />
            {errors.title && (
              <p
                id="contact-title-error"
                className="text-small text-destructive"
                role="alert"
              >
                {errors.title.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="contact-description">Message</Label>
              <span
                className={cn(
                  'text-micro text-muted-foreground',
                  descriptionLength >= MAX_DESCRIPTION_LENGTH && 'text-destructive'
                )}
                aria-live="polite"
              >
                {descriptionLength}/{MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
            <Textarea
              id="contact-description"
              placeholder="Provide details about your request..."
              rows={4}
              maxLength={MAX_DESCRIPTION_LENGTH}
              {...register('description')}
              className={cn(
                'transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring',
                errors.description && 'border-destructive focus-visible:ring-destructive'
              )}
              aria-invalid={!!errors.description}
              aria-describedby={
                errors.description ? 'contact-description-error' : undefined
              }
            />
            {errors.description && (
              <p
                id="contact-description-error"
                className="text-small text-destructive"
                role="alert"
              >
                {errors.description.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Ticket
              </>
            )}
          </Button>
        </form>
        )}
      </CardContent>
    </Card>
  )
}
