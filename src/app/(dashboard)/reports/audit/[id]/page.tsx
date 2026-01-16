import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAudit } from '@/actions/audits'
import { requireOrganization } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PrintButton } from '@/components/reports/print-button'
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'

interface AuditReportPageProps {
  params: Promise<{ id: string }>
}

export default async function AuditReportPage({ params }: AuditReportPageProps) {
  const { id } = await params
  const { organization } = await requireOrganization()
  const audit = await getAudit(id)

  if (!audit) {
    notFound()
  }

  return (
    <>
      {/* Header - Hidden when printing */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/reports">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Audit Report</h1>
        </div>
        <PrintButton />
      </div>

      {/* Printable Report */}
      <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow print:shadow-none print:p-0">
        {/* Report Header */}
        <div className="border-b pb-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {audit.template.name}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                Audit Report
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {organization.name}
              </p>
              <p className="text-gray-500">
                {audit.completedAt
                  ? new Date(audit.completedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'In Progress'}
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <p className="text-sm text-gray-500">Site</p>
            <p className="font-semibold">{audit.site.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Auditor</p>
            <p className="font-semibold">{audit.auditor.name || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Score</p>
            <p
              className={`text-2xl font-bold ${
                audit.passed ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {audit.percentage?.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Result</p>
            <Badge
              variant={audit.passed ? 'default' : 'destructive'}
              className="text-base px-3 py-1"
            >
              {audit.passed ? 'PASSED' : 'FAILED'}
            </Badge>
          </div>
        </div>

        {/* Score Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Total Score: {audit.totalScore?.toFixed(1)} / {audit.maxScore?.toFixed(1)} points
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              Passing Score: {audit.template.passingScore}%
            </span>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {audit.template.sections.map((section) => {
            const sectionResponses = audit.responses.filter((r) =>
              section.questions.some((q) => q.id === r.questionId)
            )
            const sectionPassed = sectionResponses.filter((r) => r.passed).length
            const sectionTotal = sectionResponses.length
            const sectionPercentage =
              sectionTotal > 0 ? (sectionPassed / sectionTotal) * 100 : 0

            return (
              <div key={section.id} className="break-inside-avoid">
                <div className="flex items-center justify-between border-b pb-2 mb-4">
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                  <span className="text-gray-500">
                    {sectionPassed}/{sectionTotal} ({sectionPercentage.toFixed(0)}%)
                  </span>
                </div>

                {section.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {section.description}
                  </p>
                )}

                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500">
                      <th className="pb-2 w-1/2">Question</th>
                      <th className="pb-2">Response</th>
                      <th className="pb-2 text-center">Result</th>
                      <th className="pb-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.questions.map((question) => {
                      const response = audit.responses.find(
                        (r) => r.questionId === question.id
                      )

                      let displayValue = '—'
                      if (response) {
                        if (response.boolValue !== null) {
                          displayValue =
                            question.type === 'yes_no'
                              ? response.boolValue
                                ? 'Yes'
                                : 'No'
                              : response.boolValue
                              ? 'Pass'
                              : 'Fail'
                        } else if (response.numericValue !== null) {
                          displayValue = `${response.numericValue}${question.unit || ''}`
                        } else if (response.value) {
                          displayValue = response.value
                        }
                      }

                      return (
                        <tr key={question.id} className="border-t">
                          <td className="py-3 pr-4">
                            <p className="font-medium">{question.text}</p>
                            {question.isCritical && (
                              <span className="text-xs text-red-500">Critical</span>
                            )}
                          </td>
                          <td className="py-3">{displayValue}</td>
                          <td className="py-3 text-center">
                            {response ? (
                              response.passed ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500 inline" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500 inline" />
                              )
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="py-3 text-sm text-gray-500">
                            {response?.notes || ''}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
          })}
        </div>

        {/* Non-Conformances Summary */}
        {audit.responses.filter((r) => !r.passed).length > 0 && (
          <div className="mt-8 break-inside-avoid">
            <h2 className="text-xl font-semibold border-b pb-2 mb-4">
              Non-Conformances Summary
            </h2>
            <div className="space-y-3">
              {audit.template.sections.map((section) =>
                section.questions
                  .filter((q) => {
                    const response = audit.responses.find((r) => r.questionId === q.id)
                    return response && !response.passed
                  })
                  .map((question) => {
                    const response = audit.responses.find(
                      (r) => r.questionId === question.id
                    )
                    return (
                      <div
                        key={question.id}
                        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3"
                      >
                        <p className="font-medium">{question.text}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Section: {section.title}
                        </p>
                        {response?.notes && (
                          <p className="text-sm mt-1">Notes: {response.notes}</p>
                        )}
                      </div>
                    )
                  })
              )}
            </div>
          </div>
        )}

        {/* Signature */}
        {audit.auditorSignedAt && (
          <div className="mt-8 pt-6 border-t">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-gray-500">Auditor Signature</p>
                <p className="font-semibold">{audit.auditor.name}</p>
                <p className="text-sm text-gray-500">
                  Signed: {new Date(audit.auditorSignedAt).toLocaleString()}
                </p>
              </div>
              {audit.reviewerSignedAt && audit.reviewer && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">Reviewer Signature</p>
                  <p className="font-semibold">{audit.reviewer.name}</p>
                  <p className="text-sm text-gray-500">
                    Signed: {new Date(audit.reviewerSignedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500">
          <p>Generated by AuditFlow</p>
          <p>Report ID: {audit.id}</p>
        </div>
      </div>
    </>
  )
}
