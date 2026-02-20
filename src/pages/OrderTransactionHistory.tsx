import { useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Receipt,
  Download,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Trash2,
  ArrowUpDown,
  FilterX,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Select, type SelectOption } from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ErrorState } from '@/components/ui/error-state'
import { useOrderTransactionHistory } from '@/hooks/use-order-transaction-history'
import { createStripeCustomerPortal } from '@/lib/stripe-ops'
import { toast } from 'sonner'
import type { OrderTransaction } from '@/types/order-transaction-history'

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  succeeded: 'default',
  pending: 'secondary',
  failed: 'destructive',
  refunded: 'outline',
}

const SORT_OPTIONS: SelectOption[] = [
  { value: 'created_at-desc', label: 'Date (newest)' },
  { value: 'created_at-asc', label: 'Date (oldest)' },
  { value: 'amount_cents-desc', label: 'Amount (high to low)' },
  { value: 'amount_cents-asc', label: 'Amount (low to high)' },
  { value: 'status-asc', label: 'Status (A–Z)' },
  { value: 'title-asc', label: 'Description (A–Z)' },
]

const STATUS_OPTIONS: SelectOption[] = [
  { value: '', label: 'All statuses' },
  { value: 'succeeded', label: 'Succeeded' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
]

function exportToCsv(items: OrderTransaction[]) {
  const headers = ['Date', 'Description', 'Amount', 'Status', 'Invoice URL']
  const rows = items.map((t) => [
    new Date(t.created_at).toLocaleDateString(),
    t.title,
    `$${t.amount.toFixed(2)}`,
    t.status,
    t.invoice_url ?? '',
  ])
  const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function OrderTransactionHistoryPage() {
  const [page, setPage] = useState(1)
  const [sortValue, setSortValue] = useState('created_at-desc')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [sortBy, sortOrder] = sortValue.split('-') as ['created_at' | 'amount_cents' | 'status' | 'title', 'asc' | 'desc']

  const {
    items,
    total,
    totalPages,
    limit,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    deleteTransaction,
    isDeleting,
  } = useOrderTransactionHistory({
    page,
    limit: 20,
    sortBy: sortBy ?? 'created_at',
    sortOrder: sortOrder ?? 'desc',
    status: statusFilter || undefined,
  })

  useEffect(() => {
    document.title = 'Order & Transaction History | Creator Ops Hub'
    return () => {
      document.title = 'Creator Ops Hub'
    }
  }, [])

  const handleExport = useCallback(() => {
    if (items.length === 0) {
      toast.error('No transactions to export')
      return
    }
    exportToCsv(items)
    toast.success('Exported to CSV')
  }, [items])

  const handleManagePaymentMethods = useCallback(async () => {
    try {
      const { url } = await createStripeCustomerPortal(
        `${window.location.origin}/dashboard/order-transaction-history`
      )
      window.location.href = url
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to open billing portal')
    }
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteId) return
    try {
      await deleteTransaction(deleteId)
      toast.success('Transaction removed')
      setDeleteId(null)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }, [deleteId, deleteTransaction, refetch])

  const start = total === 0 ? 0 : (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  return (
    <div className="space-y-8 max-w-6xl animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="mb-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
            aria-label="Navigate back to Settings"
          >
            <Link to="/dashboard/settings">
              <ArrowLeft className="h-4 w-4 mr-1" aria-hidden />
              Back to Settings
            </Link>
          </Button>
          <h1 className="text-h1 font-bold flex items-center gap-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            <Receipt className="h-8 w-8 text-primary" />
            Order & Transaction History
          </h1>
          <p className="text-muted-foreground mt-1">
            Invoices, subscription activity, and payment methods. Export and audit your billing history.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={items.length === 0}
            className="transition-transform duration-200 hover:scale-[1.02]"
            aria-label="Export transaction history to CSV file"
          >
            <Download className="h-4 w-4 mr-1" aria-hidden />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManagePaymentMethods}
            className="transition-transform duration-200 hover:scale-[1.02]"
            aria-label="Manage payment methods in billing portal"
          >
            <CreditCard className="h-4 w-4 mr-1" aria-hidden />
            Manage payment methods
          </Button>
          <Button
            variant="default"
            size="sm"
            asChild
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/25 transition-transform duration-200 hover:scale-[1.02]"
            aria-label="Go to Billing and plans page"
          >
            <Link to="/dashboard/checkout-/-payment">
              Billing & plans
              <ExternalLink className="h-4 w-4 ml-1" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>

      {/* Billing link card */}
      <Card className="overflow-hidden border-primary/10 bg-gradient-to-br from-primary/5 via-primary/[0.03] to-transparent transition-all duration-300 hover:shadow-card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-h3">
            <CreditCard className="h-5 w-5 text-primary" />
            Ledger
          </CardTitle>
          <CardDescription>
            Past transactions, upgrades, downgrades, and payment activity. Links back to Billing UI for plan changes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <label htmlFor="transaction-sort" className="text-small font-medium text-muted-foreground">
                Sort:
              </label>
              <Select
                id="transaction-sort"
                options={SORT_OPTIONS}
                value={sortValue}
                onChange={(e) => setSortValue(e.target.value)}
                className="w-[180px]"
                aria-label="Sort transactions by date, amount, status, or description"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="transaction-status-filter" className="text-small font-medium text-muted-foreground">
                Status:
              </label>
              <Select
                id="transaction-status-filter"
                options={STATUS_OPTIONS}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="w-[140px]"
                aria-label="Filter transactions by status"
              />
            </div>
          </div>

          {isError && (
            <ErrorState
              title="Failed to load transactions"
              description={error ?? 'We couldn\'t load your transaction history. Please try again.'}
              onRetry={() => refetch()}
              retryLabel="Retry"
              buttonAriaLabel="Retry loading transaction history"
            />
          )}

          {!isError && isLoading ? (
            <div className="space-y-4" role="status" aria-live="polite" aria-label="Loading transaction history">
              <Skeleton className="h-10 w-full" shimmer />
              <Skeleton className="h-10 w-full" shimmer />
              <Skeleton className="h-10 w-full" shimmer />
              <Skeleton className="h-10 w-full" shimmer />
              <Skeleton className="h-10 w-full" shimmer />
              <Skeleton className="h-10 w-48" shimmer />
            </div>
          ) : !isError && items.length === 0 ? (
            statusFilter ? (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/20 bg-muted/30 py-16 px-6 text-center animate-fade-in">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <FilterX className="h-10 w-10 text-primary" aria-hidden />
                </div>
                <p className="mt-6 font-semibold text-h3">No transactions match your filters</p>
                <p className="mt-2 text-small text-muted-foreground max-w-sm">
                  Try clearing the status filter or adjusting your search to see more results.
                </p>
                <Button
                  variant="default"
                  size="lg"
                  className="mt-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
                  onClick={() => {
                    setStatusFilter('')
                    setPage(1)
                  }}
                  aria-label="Clear status filter to show all transactions"
                >
                  <FilterX className="h-4 w-4 mr-2" aria-hidden />
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/20 bg-muted/30 py-16 px-6 text-center animate-fade-in">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Receipt className="h-10 w-10 text-primary" aria-hidden />
                </div>
                <p className="mt-6 font-semibold text-h3">No transactions yet</p>
                <p className="mt-2 text-small text-muted-foreground max-w-sm">
                  Your transaction history will appear here after your first payment. Upgrade your plan to get started.
                </p>
                <Button
                  variant="default"
                  size="lg"
                  className="mt-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
                  asChild
                  aria-label="Upgrade plan to get started"
                >
                  <Link to="/dashboard/checkout-/-payment#plans">
                    Upgrade plan
                    <ChevronRight className="h-4 w-4 ml-1" aria-hidden />
                  </Link>
                </Button>
              </div>
            )
          ) : !isError ? (
            <div className="relative">
              {isFetching && (
                <div
                  className="absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-background/60 backdrop-blur-[2px]"
                  role="status"
                  aria-live="polite"
                  aria-label="Refreshing transaction list"
                >
                  <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
                </div>
              )}
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky top-0 bg-card z-10">
                        <span className="flex items-center gap-1">
                          Date
                          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                        </span>
                      </TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Invoice</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((tx) => (
                      <TableRow
                        key={tx.id}
                        className="transition-colors duration-200 hover:bg-muted/50 hover:shadow-sm"
                      >
                        <TableCell className="font-medium">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{tx.title}</TableCell>
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
                              aria-label={`View invoice for ${tx.title}`}
                            >
                              <a
                                href={tx.invoice_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80"
                              >
                                View
                              </a>
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-small">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeleteId(tx.id)}
                            disabled={isDeleting}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            aria-label={`Delete transaction: ${tx.title}`}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-small text-muted-foreground">
                    Showing {start}–{end} of {total}
                  </p>
                  <nav className="flex items-center gap-2" aria-label="Transaction history pagination">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="transition-transform duration-200 hover:scale-[1.02]"
                      aria-label="Go to previous page"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden />
                    </Button>
                    <span className="text-small font-medium px-2" aria-live="polite">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="transition-transform duration-200 hover:scale-[1.02]"
                      aria-label="Go to next page"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </Button>
                  </nav>
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the transaction from your history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default OrderTransactionHistoryPage
