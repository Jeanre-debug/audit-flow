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
  MapPin,
  Calendar,
  User,
  ImageIcon,
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Issues</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track and resolve non-conformances
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/issues/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Issue
          </Link>
        </Button>
      </div>

      {/* Summary Cards - 2x2 on mobile, 1x4 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold">{openIssues.length}</div>
            <p className="text-xs sm:text-sm text-gray-500">Open</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold text-red-600">
              {issues.filter((i) => i.priority === 'critical' && i.status !== 'closed').length}
            </div>
            <p className="text-xs sm:text-sm text-gray-500">Critical</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold text-orange-600">
              {issues.filter((i) => i.dueDate && new Date(i.dueDate) < new Date() && i.status !== 'closed').length}
            </div>
            <p className="text-xs sm:text-sm text-gray-500">Overdue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {closedIssues.length}
            </div>
            <p className="text-xs sm:text-sm text-gray-500">Closed</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="open">
        <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:inline-flex">
          <TabsTrigger value="open" className="text-xs sm:text-sm">
            Open ({openIssues.length})
          </TabsTrigger>
          <TabsTrigger value="resolved" className="text-xs sm:text-sm">
            Resolved ({resolvedIssues.length})
          </TabsTrigger>
          <TabsTrigger value="closed" className="text-xs sm:text-sm">
            Closed ({closedIssues.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            All ({issues.length})
          </TabsTrigger>
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
        <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
          <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
            No issues found
          </h3>
          <p className="text-gray-500 text-center text-sm">
            Issues are created from failed audit items or manually.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="space-y-3 sm:hidden">
        {issues.map((issue) => {
          const isOverdue =
            issue.dueDate &&
            new Date(issue.dueDate) < new Date() &&
            issue.status !== 'closed'

          return (
            <Link key={issue.id} href={`/issues/${issue.id}`}>
              <Card className="active:bg-gray-50 dark:active:bg-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-medium text-sm line-clamp-2">{issue.title}</h3>
                    {getPriorityBadge(issue.priority)}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {getStatusBadge(issue.status)}
                    {isOverdue && <Badge variant="destructive">Overdue</Badge>}
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    {issue.site && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {issue.site.name}
                      </span>
                    )}
                    {issue.assignedTo && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {issue.assignedTo.name}
                      </span>
                    )}
                    {issue.dueDate && (
                      <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
                        <Calendar className="h-3 w-3" />
                        {new Date(issue.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-2 pt-2 border-t text-xs text-gray-500">
                    {issue._count.comments > 0 && (
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {issue._count.comments}
                      </span>
                    )}
                    {issue._count.media > 0 && (
                      <span className="flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" />
                        {issue._count.media}
                      </span>
                    )}
                    {issue.audit && (
                      <span className="truncate">
                        From: {issue.audit.template.name}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Desktop Table View */}
      <Card className="hidden sm:block">
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
                      {issue._count.media > 0 && (
                        <span className="flex items-center gap-1">
                          <ImageIcon className="h-3 w-3" />
                          {issue._count.media}
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
    </>
  )
}
