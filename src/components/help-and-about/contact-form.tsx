import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Send, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { submitSupportTicket } from '@/lib/help-and-about-ops'

const schema = z.object({
  title: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  description: z.string().max(2000, 'Message too long').optional(),
})

type FormData = z.infer<typeof schema>

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '' },
  })

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
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-h3">
          <MessageSquare className="h-5 w-5 text-primary" />
          Contact Support
        </CardTitle>
        <p className="text-small text-muted-foreground">
          Submit a ticket or request. We typically respond within 24 hours.
        </p>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="contact-title">Subject</Label>
            <Input
              id="contact-title"
              placeholder="Brief description of your issue"
              {...register('title')}
              className={errors.title ? 'border-destructive' : ''}
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
            <Label htmlFor="contact-description">Message</Label>
            <Textarea
              id="contact-description"
              placeholder="Provide details about your request..."
              rows={4}
              {...register('description')}
              className={errors.description ? 'border-destructive' : ''}
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
            className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <span className="animate-pulse">Sending...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Ticket
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
