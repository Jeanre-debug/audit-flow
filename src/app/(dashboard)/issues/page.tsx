import Link from 'next/link'
import { getIssues } from '@/actions/issues'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react'

function getPriorityBadge(priority: string) {
  const variants: Record<string, 'destructive' | 'default' | 'secondary' | 'outline'> = {
    critical: 'destructive',
    high: 'destructive',
    medium: 'default',
    low: 'secondary',
  }
  return <Badge variant={variants[priority] || 'outline'}>{priority}</Badge>
}

function getStatusBadge(status: string) {
  const config: Record<string, { variant: 'destructive' | 'default' | 'secondary' | 'outline'; icon?: React.ReactNode }> = {
    open: { variant: 'destructive', icon: <AlertTriangle className="h-3 w-3 mr-1" /> },
    in_progress: { variant: 'default', icon: <Clock className="h-3 w-3 mr-1" /> },
    resolved: { variant: 'secondary', icon: <CheckCircle2 className="h-3 w-3 mr-1" /> },
    verified: { variant: 'outline', icon: <CheckCircle2 className="h-3 w-3 mr-1" /> },
    closed: { variant: 'outline' },
  }
  const { variant, icon } = config[status] || { variant: 'outline' as const }
  return (
    <Badge variant={variant}>
      {icon}
      {status.replace('_', ' ')}
    </Badge>
  )
}

export default async function IssuesPage() {
  const issues = await getIssues()

  const openIssues = issues.filter((i) => i.status === 'open' || i.status === 'in_progress')
  const resolvedIssues = issues.filter((i) => i.status === 'resolved' || i.status === 'verified')
  const closedIssues = issues.filter((i) => i.status === 'closed')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Issues</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and resolve non-conformances
          </p>
        </div>
        <Button asChild>
          <Link href="/issues/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Issue
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{openIssues.length}</div>
            <p className="text-sm text-gray-500">Open Issues</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {issues.filter((i) => i.priority === 'critical' && i.status !== 'closed').length}
            </div>
            <p className="text-sm text-gray-500">Critical</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {issues.filter((i) => i.dueDate && new Date(i.dueDate) < new Date() && i.status !== 'closed').length}
            </div>
            <p className="text-sm text-gray-500">Overdue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {closedIssues.length}
            </div>
            <p className="text-sm text-gray-500">Closed</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="open">
        <TabsList>
          <TabsTrigger value="open">
            Open ({openIssues.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved ({resolvedIssues.length})
          </TabsTrigger>
          <TabsTrigger value="closed">
            Closed ({closedIssues.length})
          </TabsTrigger>
          <TabsTrigger value="all">All ({issues.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="mt-4">
          <IssuesList issues={openIssues} />
        </TabsContent>
        <TabsContent value="resolved" className="mt-4">
          <IssuesList issues={resolvedIssues} />
        </TabsContent>
        <TabsContent value="closed" className="mt-4">
          <IssuesList issues={closedIssues} />
        </TabsContent>
        <TabsContent value="all" className="mt-4">
          <IssuesList issues={issues} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function IssuesList({
  issues,
}: {
  issues: Awaited<ReturnType<typeof getIssues>>
}) {
  if (issues.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No issues found
          </h3>
          <p className="text-gray-500 text-center">
            Issues are created from failed audit items or manually.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Site</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {issues.map((issue) => {
            const isOverdue =
              issue.dueDate &&
              new Date(issue.dueDate) < new Date() &&
              issue.status !== 'closed'

            return (
              <TableRow key={issue.id}>
                <TableCell>
                  <Link
                    href={`/issues/${issue.id}`}
                    className="font-medium hover:underline"
                  >
                    {issue.title}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    {issue.audit && (
                      <span>From: {issue.audit.template.name}</span>
                    )}
                    {issue._count.comments > 0 && (
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {issue._count.comments}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {issue.site ? (
                    <Link
                      href={`/sites/${issue.site.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {issue.site.name}
                    </Link>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </TableCell>
                <TableCell>{getPriorityBadge(issue.priority)}</TableCell>
                <TableCell>{getStatusBadge(issue.status)}</TableCell>
                <TableCell>
                  {issue.assignedTo?.name || (
                    <span className="text-gray-400">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>
                  {issue.dueDate ? (
                    <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                      {new Date(issue.dueDate).toLocaleDateString()}
                      {isOverdue && ' (Overdue)'}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/issues/${issue.id}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
