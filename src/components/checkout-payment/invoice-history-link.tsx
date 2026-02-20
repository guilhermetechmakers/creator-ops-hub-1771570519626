import { Link } from 'react-router-dom'
import { FileText, ChevronRight, Receipt, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { toast } from 'sonner'
import type { Transaction } from '@/types/checkout'

export interface InvoiceHistoryLinkProps {
  transactions?: Transaction[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void | Promise<void>
  maxItems?: number
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  succeeded: 'default',
  pending: 'secondary',
  failed: 'destructive',
  refunded: 'outline',
}

export function InvoiceHistoryLink({
  transactions = [],
  isLoading = false,
  error = null,
  onRetry,
  maxItems = 5,
}: InvoiceHistoryLinkProps) {
  const items = (transactions ?? []).slice(0, maxItems)

  const handleRetry = async () => {
    if (!onRetry) return
    try {
      await onRetry()
      toast.success('Invoice history loaded')
    } catch {
      toast.error('Failed to load invoice history. Please try again.')
    }
  }

  return (
    <Card
      className="overflow-hidden border-primary/10 bg-gradient-to-br from-primary/5 via-primary/[0.03] to-transparent transition-all duration-300 hover:shadow-card-hover hover:border-primary/20"
      aria-labelledby="invoice-history-heading"
      aria-describedby="invoice-history-description"
    >
      <CardHeader>
        <CardTitle
          id="invoice-history-heading"
          as="h2"
          className="flex items-center gap-2"
        >
          <FileText className="h-5 w-5 text-primary" aria-hidden />
          Invoice history
        </CardTitle>
        <CardDescription id="invoice-history-description">
          Past transactions, upgrades, and payment activity. Export and manage invoices.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <ErrorState
            title="Could not load invoice history"
            description={error}
            onRetry={handleRetry}
            retryLabel="Try again"
            buttonAriaLabel="Retry loading invoice history"
          />
        ) : isLoading ? (
          <div className="space-y-4" role="status" aria-live="polite" aria-busy="true">
            <p className="text-sm text-muted-foreground flex items-center gap-2" id="invoice-loading-label">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Loading invoice history…
            </p>
            <div className="space-y-4" aria-hidden>
              <Skeleton className="h-10 w-full" shimmer />
              <Skeleton className="h-10 w-full" shimmer />
              <Skeleton className="h-10 w-full" shimmer />
              <Skeleton className="h-10 w-full" shimmer />
              <Skeleton className="h-10 w-28" shimmer />
            </div>
          </div>
        ) : items.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/20 bg-muted/30 py-16 px-6 text-center"
            role="status"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Receipt className="h-10 w-10 text-primary" aria-hidden />
            </div>
            <p className="mt-6 font-semibold text-h3">No invoices yet</p>
            <p className="mt-2 text-small text-muted-foreground max-w-sm">
              Your transaction history will appear here after your first payment. Choose a plan above to get started.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
              <Button
                variant="default"
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                asChild
                aria-label="Upgrade your plan to get started with your first invoice"
              >
                <Link to="/dashboard/checkout-/-payment#plans">
                  Upgrade plan to get started
                  <ChevronRight className="h-4 w-4 ml-1" aria-hidden />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                asChild
                aria-label="View full transaction history"
              >
                <Link to="/dashboard/order-transaction-history">
                  View full history
                  <ChevronRight className="h-4 w-4 ml-1" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]">Invoice</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((tx) => (
                    <TableRow
                      key={tx.id}
                      className="transition-colors duration-200 hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">
                        {new Date(tx.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${tx.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={STATUS_VARIANTS[tx.status] ?? 'secondary'}
                          className="capitalize"
                        >
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {tx.invoice_url ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-8 px-2"
                          >
                            <a
                              href={tx.invoice_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80"
                              aria-label={`View invoice for ${tx.description}`}
                            >
                              View
                            </a>
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-small">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Button
              variant="outline"
              className="mt-4 w-full transition-all duration-200 hover:scale-[1.02] hover:shadow-elevated sm:w-auto"
              asChild
              aria-label="View all invoices in transaction history"
            >
              <Link to="/dashboard/order-transaction-history">
                View all invoices
                <ChevronRight className="h-4 w-4 ml-1" aria-hidden />
              </Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
