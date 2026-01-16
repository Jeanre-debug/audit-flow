import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAudit } from '@/actions/audits'
import { AuditExecutor } from '@/components/audit/audit-executor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  User,
  FileText,
} from 'lucide-react'

interface AuditPageProps {
  params: Promise<{ id: string }>
}

export default async function AuditPage({ params }: AuditPageProps) {
  const { id } = await params
  const audit = await getAudit(id)

  if (!audit) {
    notFound()
  }

  // If audit is in progress, show the executor
  if (audit.status === 'in_progress' || audit.status === 'draft') {
    return <AuditExecutor audit={audit} />
  }

  // Otherwise, show audit results
  const passedResponses = audit.responses.filter((r) => r.passed).length
  const failedResponses = audit.responses.filter((r) => !r.passed).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/audits">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{audit.template.name}</h1>
            <Badge variant={audit.passed ? 'default' : 'destructive'}>
              {audit.passed ? (
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
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {audit.site.name}
            </span>
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {audit.auditor.name}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {audit.completedAt
                ? new Date(audit.completedAt).toLocaleDateString()
                : new Date(audit.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/reports/audit/${audit.id}`}>
            <FileText className="h-4 w-4 mr-2" />
            View Report
          </Link>
        </Button>
      </div>

      {/* Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Overall Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              <span className={audit.passed ? 'text-green-600' : 'text-red-600'}>
                {audit.percentage?.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={audit.percentage || 0}
              className="mt-2 h-2"
            />
            <p className="text-xs text-gray-500 mt-2">
              Passing score: {audit.template.passingScore}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Questions Passed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {passedResponses}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              out of {audit.responses.length} questions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Questions Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {failedResponses}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              non-conformances identified
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section Results */}
      <Card>
        <CardHeader>
          <CardTitle>Section Results</CardTitle>
          <CardDescription>Breakdown by audit section</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {audit.template.sections.map((section) => {
            const sectionResponses = audit.responses.filter((r) =>
              section.questions.some((q) => q.id === r.questionId)
            )
            const sectionPassed = sectionResponses.filter((r) => r.passed).length
            const sectionTotal = sectionResponses.length
            const sectionPercentage =
              sectionTotal > 0 ? (sectionPassed / sectionTotal) * 100 : 0

            return (
              <div key={section.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{section.title}</span>
                  <span className="text-sm text-gray-500">
                    {sectionPassed}/{sectionTotal} passed ({sectionPercentage.toFixed(0)}%)
                  </span>
                </div>
                <Progress value={sectionPercentage} className="h-2" />
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Failed Items */}
      {failedResponses > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Non-Conformances</CardTitle>
            <CardDescription>Items that did not pass</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {audit.template.sections.map((section) =>
                section.questions
                  .filter((q) => {
                    const response = audit.responses.find(
                      (r) => r.questionId === q.id
                    )
                    return response && !response.passed
                  })
                  .map((question) => {
                    const response = audit.responses.find(
                      (r) => r.questionId === question.id
                    )
                    return (
                      <div
                        key={question.id}
                        className="p-4 border border-red-200 bg-red-50 dark:bg-red-900/20 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{question.text}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Section: {section.title}
                            </p>
                            {response?.notes && (
                              <p className="text-sm mt-2">
                                <span className="font-medium">Notes:</span>{' '}
                                {response.notes}
                              </p>
                            )}
                          </div>
                          {question.isCritical && (
                            <Badge variant="destructive">Critical</Badge>
                          )}
                        </div>
                      </div>
                    )
                  })
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
