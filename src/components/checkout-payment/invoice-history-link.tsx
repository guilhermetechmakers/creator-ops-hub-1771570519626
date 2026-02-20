import { Link } from 'react-router-dom'
import { FileText, ChevronRight, Receipt } from 'lucide-react'
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
import type { Transaction } from '@/types/checkout'

export interface InvoiceHistoryLinkProps {
  transactions?: Transaction[]
  isLoading?: boolean
  maxItems?: number
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  succeeded: 'default',
  pending: 'secondary',
  failed: 'destructive',
  refunded: 'outline',
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    date: '2025-02-15',
    description: 'Pro Plan - Monthly',
    amount: 29,
    status: 'succeeded',
    invoice_url: '#',
  },
  {
    id: '2',
    date: '2025-01-15',
    description: 'Pro Plan - Monthly',
    amount: 29,
    status: 'succeeded',
    invoice_url: '#',
  },
  {
    id: '3',
    date: '2024-12-15',
    description: 'Free to Pro upgrade',
    amount: 29,
    status: 'succeeded',
    invoice_url: '#',
  },
]

export function InvoiceHistoryLink({
  transactions = MOCK_TRANSACTIONS,
  isLoading = false,
  maxItems = 5,
}: InvoiceHistoryLinkProps) {
  const items = transactions.slice(0, maxItems)

  return (
    <Card className="overflow-hidden border-primary/10 bg-gradient-to-br from-primary/5 via-primary/[0.03] to-transparent transition-all duration-300 hover:shadow-card-hover hover:border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Invoice history
        </CardTitle>
        <CardDescription>
          Past transactions, upgrades, and payment activity. Export and manage invoices.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" shimmer />
            <Skeleton className="h-10 w-full" shimmer />
            <Skeleton className="h-10 w-full" shimmer />
            <Skeleton className="h-10 w-full" shimmer />
            <Skeleton className="h-10 w-28" shimmer />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/20 bg-muted/30 py-16 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Receipt className="h-10 w-10 text-primary" />
            </div>
            <p className="mt-6 font-semibold text-h3">No invoices yet</p>
            <p className="mt-2 text-small text-muted-foreground max-w-sm">
              Your transaction history will appear here after your first payment. Complete a plan upgrade above to get started.
            </p>
            <Button
              variant="default"
              size="lg"
              className="mt-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
              asChild
            >
              <Link to="/dashboard/checkout-/-payment#plans">
                Upgrade plan
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
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
                        {tx.invoice_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-8 px-2"
                          >
                            <Link
                              to={tx.invoice_url}
                              className="text-primary hover:text-primary/80"
                            >
                              View
                            </Link>
                          </Button>
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
            >
              <Link to="/dashboard/checkout-/-payment">
                View all invoices
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
