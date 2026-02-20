import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { FAQItem } from '@/types/help-and-about'

const FAQ_ITEMS: FAQItem[] = [
  {
    id: '1',
    question: 'How do I get started with Creator Ops Hub?',
    answer:
      'Sign up for a free account, connect your social accounts in Integrations, and create your first content project in Content Studio. Use the dashboard to track usage and analytics.',
  },
  {
    id: '2',
    question: 'What are OpenClaw credits?',
    answer:
      'OpenClaw credits power AI features like content generation and research. Each plan includes a monthly allowance. Credits are consumed per AI request and do not roll over.',
  },
  {
    id: '3',
    question: 'How do I connect my social accounts?',
    answer:
      'Go to Integrations > Add Integration. We support YouTube, Instagram, TikTok, and more. OAuth is used for secure connection.',
  },
  {
    id: '4',
    question: 'Can I cancel my subscription anytime?',
    answer:
      'Yes. You can downgrade or cancel from Settings > Billing. Your data remains accessible until the end of the billing period.',
  },
  {
    id: '5',
    question: 'How do I get API access?',
    answer:
      'Generate an API key from Settings > Security. Include it in the Authorization header for API requests. See API docs for details.',
  },
  {
    id: '6',
    question: 'Where can I find my usage and billing?',
    answer:
      'Settings > Billing shows your plan, usage, and invoice history. OpenClaw credit usage is tracked separately.',
  },
]

interface FAQItemProps {
  item: FAQItem
  isOpen: boolean
  onToggle: () => void
}

function FAQItemRow({ item, isOpen, onToggle }: FAQItemProps) {
  return (
    <div
      className="border-b border-border last:border-0"
      aria-expanded={isOpen}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg px-1 -mx-1"
        aria-controls={`faq-answer-${item.id}`}
        aria-expanded={isOpen}
        id={`faq-question-${item.id}`}
      >
        <span className="font-medium text-foreground">{item.question}</span>
        <ChevronDown
          className={cn(
            'h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <div
        id={`faq-answer-${item.id}`}
        role="region"
        aria-labelledby={`faq-question-${item.id}`}
        className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <p className="pb-4 pl-1 text-small text-muted-foreground">
          {item.answer}
        </p>
      </div>
    </div>
  )
}

export function FAQ() {
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null)

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-h3">
          <HelpCircle className="h-5 w-5 text-primary" />
          Frequently Asked Questions
        </CardTitle>
        <p className="text-small text-muted-foreground">
          Common questions and answers
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-0">
          {FAQ_ITEMS.map((item) => (
            <FAQItemRow
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onToggle={() =>
                setOpenId((prev) => (prev === item.id ? null : item.id))
              }
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
