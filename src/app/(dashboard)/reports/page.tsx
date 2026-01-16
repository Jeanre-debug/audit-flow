import Link from 'next/link'
import { requireOrganization } from '@/actions/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  FileText,
  Download,
  ClipboardCheck,
  AlertTriangle,
  TrendingUp,
  Calendar,
} from 'lucide-react'

async function getReportData(organizationId: string) {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [recentAudits, openIssues, issuesByPriority, auditsByMonth] = await Promise.all([
    prisma.audit.findMany({
      where: {
        organizationId,
        status: 'completed',
      },
      orderBy: { completedAt: 'desc' },
      take: 10,
      include: {
        template: { select: { name: true } },
        site: { select: { name: true } },
        auditor: { select: { name: true } },
      },
    }),
    prisma.issue.count({
      where: {
        organizationId,
        status: { in: ['open', 'in_progress'] },
      },
    }),
    prisma.issue.groupBy({
      by: ['priority'],
      where: { organizationId, status: { in: ['open', 'in_progress'] } },
      _count: true,
    }),
    prisma.audit.groupBy({
      by: ['status'],
      where: {
        organizationId,
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: true,
    }),
  ])

  return { recentAudits, openIssues, issuesByPriority, auditsByMonth }
}

export default async function ReportsPage() {
  const { organization } = await requireOrganization()
  const { recentAudits, openIssues, issuesByPriority, auditsByMonth } = await getReportData(
    organization.id
  )

  const totalAuditsThisMonth = auditsByMonth.reduce((sum, g) => sum + g._count, 0)
  const completedAuditsThisMonth =
    auditsByMonth.find((g) => g.status === 'completed')?._count || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and export compliance reports
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{totalAuditsThisMonth}</div>
                <p className="text-sm text-gray-500">Audits This Month</p>
              </div>
              <ClipboardCheck className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{completedAuditsThisMonth}</div>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{openIssues}</div>
                <p className="text-sm text-gray-500">Open Issues</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {issuesByPriority.find((g) => g.priority === 'critical')?._count || 0}
                </div>
                <p className="text-sm text-gray-500">Critical Issues</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-blue-500" />
              Audit Reports
            </CardTitle>
            <CardDescription>
              View completed audit reports with scores and findings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              {recentAudits.length} recent audits available
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="#recent-audits">View Audits</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Issue Register
            </CardTitle>
            <CardDescription>
              Track all non-conformances and corrective actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              {openIssues} open issues requiring attention
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/issues">View Issues</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              Compliance Summary
            </CardTitle>
            <CardDescription>
              Monthly compliance overview and trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Track your compliance metrics over time
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard">View Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Audits */}
      <Card id="recent-audits">
        <CardHeader>
          <CardTitle>Recent Audit Reports</CardTitle>
          <CardDescription>Completed audits available for review and export</CardDescription>
        </CardHeader>
        <CardContent>
          {recentAudits.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No completed audits yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Auditor</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAudits.map((audit) => (
                  <TableRow key={audit.id}>
                    <TableCell className="font-medium">
                      {audit.template.name}
                    </TableCell>
                    <TableCell>{audit.site.name}</TableCell>
                    <TableCell>{audit.auditor.name || 'Unknown'}</TableCell>
                    <TableCell>
                      <span
                        className={
                          audit.passed
                            ? 'text-green-600 font-medium'
                            : 'text-red-600 font-medium'
                        }
                      >
                        {audit.percentage?.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={audit.passed ? 'default' : 'destructive'}>
                        {audit.passed ? 'Passed' : 'Failed'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {audit.completedAt
                        ? new Date(audit.completedAt).toLocaleDateString()
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/audits/${audit.id}`}>View</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/reports/audit/${audit.id}`}>
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
