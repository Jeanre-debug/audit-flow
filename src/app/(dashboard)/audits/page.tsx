import Link from 'next/link'
import { getAudits } from '@/actions/audits'
import { getTemplates } from '@/actions/templates'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  ClipboardCheck,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react'

function getStatusBadge(status: string, passed?: boolean | null) {
  switch (status) {
    case 'completed':
      return (
        <Badge variant={passed ? 'default' : 'destructive'}>
          {passed ? (
            <>
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Passed
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3 mr-1" />
              Failed
            </>
          )}
        </Badge>
      )
    case 'in_progress':
      return (
        <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          In Progress
        </Badge>
      )
    case 'draft':
      return <Badge variant="outline">Draft</Badge>
    case 'reviewed':
      return <Badge variant="default">Reviewed</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default async function AuditsPage() {
  const [audits, templates] = await Promise.all([getAudits(), getTemplates()])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audits</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Conduct audits and manage templates
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/audits/templates">
              <FileText className="h-4 w-4 mr-2" />
              Templates
            </Link>
          </Button>
          <Button asChild>
            <Link href="/audits/new">
              <Plus className="h-4 w-4 mr-2" />
              Start Audit
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Audits</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <AuditsList audits={audits} />
        </TabsContent>

        <TabsContent value="in_progress" className="mt-4">
          <AuditsList audits={audits.filter((a) => a.status === 'in_progress')} />
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <AuditsList audits={audits.filter((a) => a.status === 'completed')} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AuditsList({
  audits,
}: {
  audits: Awaited<ReturnType<typeof getAudits>>
}) {
  if (audits.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ClipboardCheck className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No audits found
          </h3>
          <p className="text-gray-500 text-center mb-4">
            Start your first audit to track compliance.
          </p>
          <Button asChild>
            <Link href="/audits/new">
              <Plus className="h-4 w-4 mr-2" />
              Start Audit
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
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
          {audits.map((audit) => (
            <TableRow key={audit.id}>
              <TableCell>
                <div>
                  <Link
                    href={`/audits/${audit.id}`}
                    className="font-medium hover:underline"
                  >
                    {audit.template.name}
                  </Link>
                  {audit.template.category && (
                    <p className="text-xs text-gray-500">{audit.template.category}</p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Link
                  href={`/sites/${audit.site.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {audit.site.name}
                </Link>
              </TableCell>
              <TableCell>{audit.auditor.name || 'Unknown'}</TableCell>
              <TableCell>
                {audit.percentage !== null ? (
                  <span
                    className={
                      audit.passed
                        ? 'text-green-600 font-medium'
                        : 'text-red-600 font-medium'
                    }
                  >
                    {audit.percentage.toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </TableCell>
              <TableCell>{getStatusBadge(audit.status, audit.passed)}</TableCell>
              <TableCell>
                {new Date(audit.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/audits/${audit.id}`}>
                    {audit.status === 'in_progress' ? 'Continue' : 'View'}
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
