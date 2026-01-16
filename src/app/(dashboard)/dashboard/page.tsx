import Link from 'next/link'
import { requireOrganization } from '@/actions/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ClipboardCheck,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  MapPin,
  Thermometer,
  ArrowRight,
} from 'lucide-react'

async function getDashboardStats(organizationId: string) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const [
    openIssues,
    overdueIssues,
    auditsThisMonth,
    completedAudits,
    recentAudits,
    recentIssues,
    totalSites,
    totalAssets,
    todayLogs,
    issuesByPriority,
  ] = await Promise.all([
    prisma.issue.count({
      where: { organizationId, status: { in: ['open', 'in_progress'] } },
    }),
    prisma.issue.count({
      where: {
        organizationId,
        status: { in: ['open', 'in_progress'] },
        dueDate: { lt: now },
      },
    }),
    prisma.audit.count({
      where: { organizationId, createdAt: { gte: startOfMonth } },
    }),
    prisma.audit.count({
      where: { organizationId, status: 'completed' },
    }),
    prisma.audit.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        site: { select: { name: true } },
        template: { select: { name: true } },
      },
    }),
    prisma.issue.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        site: { select: { name: true } },
        assignedTo: { select: { name: true } },
      },
    }),
    prisma.site.count({
      where: { organizationId, isActive: true },
    }),
    prisma.asset.count({
      where: { organizationId, status: 'active' },
    }),
    prisma.logEntry.count({
      where: { organizationId, date: { gte: today } },
    }),
    prisma.issue.groupBy({
      by: ['priority'],
      where: { organizationId, status: { in: ['open', 'in_progress'] } },
      _count: true,
    }),
  ])

  // Calculate average score from completed audits
  const auditsWithScores = await prisma.audit.findMany({
    where: { organizationId, status: 'completed', percentage: { not: null } },
    select: { percentage: true },
  })
  const averageScore = auditsWithScores.length > 0
    ? auditsWithScores.reduce((sum, a) => sum + (a.percentage || 0), 0) / auditsWithScores.length
    : 0

  const criticalIssues = issuesByPriority.find((g) => g.priority === 'critical')?._count || 0
  const highIssues = issuesByPriority.find((g) => g.priority === 'high')?._count || 0

  return {
    openIssues,
    overdueIssues,
    auditsThisMonth,
    completedAudits,
    averageScore,
    recentAudits,
    recentIssues,
    totalSites,
    totalAssets,
    todayLogs,
    criticalIssues,
    highIssues,
  }
}

export default async function DashboardPage() {
  const { organization } = await requireOrganization()
  const stats = await getDashboardStats(organization.id)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back! Here&apos;s an overview of your compliance status.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/audits/new">
              <Plus className="h-4 w-4 mr-2" />
              New Audit
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/logs/new">
              <Thermometer className="h-4 w-4 mr-2" />
              Log Entry
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Open Issues
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openIssues}</div>
            {stats.overdueIssues > 0 && (
              <p className="text-xs text-red-500 mt-1">
                {stats.overdueIssues} overdue
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Audits This Month
            </CardTitle>
            <ClipboardCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.auditsThisMonth}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.completedAudits} total completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Average Score
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageScore.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Compliance rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Status
            </CardTitle>
            {stats.overdueIssues > 0 ? (
              <XCircle className="h-4 w-4 text-red-500" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.overdueIssues > 0 ? 'Action Needed' : 'Good'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.overdueIssues > 0 ? 'Address overdue issues' : 'All on track'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Audits */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Audits</CardTitle>
            <CardDescription>Latest audit activity</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentAudits.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No audits yet. Create your first audit to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {stats.recentAudits.map((audit) => (
                  <div key={audit.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {audit.template.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {audit.site.name} - {new Date(audit.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        audit.status === 'completed'
                          ? 'default'
                          : audit.status === 'in_progress'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {audit.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Issues */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Issues</CardTitle>
            <CardDescription>Latest non-conformances</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentIssues.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No issues found. Issues are created from failed audit items.
              </p>
            ) : (
              <div className="space-y-4">
                {stats.recentIssues.map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{issue.title}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {issue.site && <span>{issue.site.name}</span>}
                        {issue.dueDate && (
                          <>
                            <Clock className="h-3 w-3" />
                            <span>Due {new Date(issue.dueDate).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={
                        issue.priority === 'critical'
                          ? 'destructive'
                          : issue.priority === 'high'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {issue.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{stats.totalSites}</div>
                <p className="text-xs text-gray-500">Active Sites</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Thermometer className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats.totalAssets}</div>
                <p className="text-xs text-gray-500">Assets Tracked</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <ClipboardCheck className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{stats.todayLogs}</div>
                <p className="text-xs text-gray-500">Logs Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.criticalIssues}</div>
                <p className="text-xs text-gray-500">Critical Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Score */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Score</CardTitle>
          <CardDescription>Overall compliance performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-4xl font-bold">
                {stats.averageScore.toFixed(1)}%
              </span>
              <Badge variant={stats.averageScore >= 80 ? 'default' : 'destructive'}>
                {stats.averageScore >= 80 ? 'Compliant' : 'Needs Improvement'}
              </Badge>
            </div>
            <Progress value={stats.averageScore} className="h-3" />
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">{stats.completedAudits}</div>
                <p className="text-xs text-gray-500">Completed Audits</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-orange-600">{stats.openIssues}</div>
                <p className="text-xs text-gray-500">Open Issues</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-red-600">{stats.overdueIssues}</div>
                <p className="text-xs text-gray-500">Overdue</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/audits/new"
              className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <span className="font-medium">Start Audit</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/issues/new"
              className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
            >
              <span className="font-medium">Report Issue</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/logs/new"
              className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <span className="font-medium">New Log Entry</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/reports"
              className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <span className="font-medium">View Reports</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
