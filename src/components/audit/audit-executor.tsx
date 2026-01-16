'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Save,
  Flag,
  Camera,
  Loader2,
} from 'lucide-react'
import { saveAuditResponse, completeAudit } from '@/actions/audits'

interface Question {
  id: string
  text: string
  description: string | null
  type: string
  isRequired: boolean
  isCritical: boolean
  weight: number
  minValue: number | null
  maxValue: number | null
  unit: string | null
  options: string[]
}

interface Section {
  id: string
  title: string
  description: string | null
  questions: Question[]
}

interface Response {
  id: string
  questionId: string
  value: string | null
  boolValue: boolean | null
  numericValue: number | null
  notes: string | null
  flagged: boolean
  passed: boolean | null
}

interface AuditExecutorProps {
  audit: {
    id: string
    status: string
    template: {
      name: string
      passingScore: number
      sections: Section[]
    }
    site: {
      name: string
    }
    responses: Response[]
  }
}

export function AuditExecutor({ audit }: AuditExecutorProps) {
  const router = useRouter()
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, Partial<Response>>>(
    Object.fromEntries(
      audit.responses.map((r) => [r.questionId, r])
    )
  )
  const [saving, setSaving] = useState<string | null>(null)
  const [completing, setCompleting] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)

  const sections = audit.template.sections
  const currentSection = sections[currentSectionIndex]

  const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0)
  const answeredQuestions = Object.values(responses).filter(
    (r) => r.boolValue !== undefined || r.value !== undefined || r.numericValue !== undefined
  ).length
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0

  const saveResponse = useCallback(
    async (questionId: string, data: Partial<Response>) => {
      setSaving(questionId)
      setResponses((prev) => ({
        ...prev,
        [questionId]: { ...prev[questionId], ...data },
      }))

      await saveAuditResponse({
        auditId: audit.id,
        questionId,
        value: data.value ?? undefined,
        boolValue: data.boolValue ?? undefined,
        numericValue: data.numericValue ?? undefined,
        notes: data.notes ?? undefined,
        flagged: data.flagged ?? false,
      })

      setSaving(null)
    },
    [audit.id]
  )

  const handleComplete = async () => {
    setCompleting(true)
    const result = await completeAudit(audit.id)
    setCompleting(false)

    if (result.success) {
      setShowCompleteDialog(false)
      router.push(`/audits/${audit.id}`)
      router.refresh()
    }
  }

  const renderQuestion = (question: Question, index: number) => {
    const response = responses[question.id] || {}

    return (
      <Card key={question.id} className="relative">
        {question.isCritical && (
          <Badge variant="destructive" className="absolute top-2 right-2">
            Critical
          </Badge>
        )}
        <CardHeader className="pb-2">
          <div className="flex items-start gap-2">
            <span className="text-sm font-medium text-gray-500">
              Q{index + 1}
            </span>
            <div className="flex-1">
              <CardTitle className="text-base font-medium">
                {question.text}
                {question.isRequired && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </CardTitle>
              {question.description && (
                <p className="text-sm text-gray-500 mt-1">
                  {question.description}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Yes/No or Pass/Fail */}
          {(question.type === 'yes_no' || question.type === 'pass_fail') && (
            <div className="flex gap-2">
              <Button
                variant={response.boolValue === true ? 'default' : 'outline'}
                onClick={() => saveResponse(question.id, { boolValue: true })}
                disabled={saving === question.id}
                className="flex-1"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {question.type === 'yes_no' ? 'Yes' : 'Pass'}
              </Button>
              <Button
                variant={response.boolValue === false ? 'destructive' : 'outline'}
                onClick={() => saveResponse(question.id, { boolValue: false })}
                disabled={saving === question.id}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                {question.type === 'yes_no' ? 'No' : 'Fail'}
              </Button>
            </div>
          )}

          {/* Numeric */}
          {question.type === 'numeric' && (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="any"
                value={response.numericValue ?? ''}
                onChange={(e) =>
                  saveResponse(question.id, {
                    numericValue: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
                placeholder={`Enter value${question.unit ? ` (${question.unit})` : ''}`}
                className="w-40"
              />
              {question.unit && (
                <span className="text-gray-500">{question.unit}</span>
              )}
              {(question.minValue !== null || question.maxValue !== null) && (
                <span className="text-xs text-gray-500">
                  Range: {question.minValue ?? '—'} to {question.maxValue ?? '—'}
                </span>
              )}
            </div>
          )}

          {/* Text */}
          {question.type === 'text' && (
            <Textarea
              value={response.value || ''}
              onChange={(e) => saveResponse(question.id, { value: e.target.value })}
              placeholder="Enter your response"
              rows={2}
            />
          )}

          {/* Rating */}
          {question.type === 'rating' && (
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  variant={response.numericValue === rating ? 'default' : 'outline'}
                  onClick={() => saveResponse(question.id, { numericValue: rating })}
                  disabled={saving === question.id}
                  className="w-12 h-12 text-lg"
                >
                  {rating}
                </Button>
              ))}
            </div>
          )}

          {/* Photo */}
          {question.type === 'photo' && (
            <Button variant="outline" disabled>
              <Camera className="h-4 w-4 mr-2" />
              Take Photo (Coming Soon)
            </Button>
          )}

          {/* Notes and Flag */}
          <div className="mt-4 pt-4 border-t flex items-end gap-4">
            <div className="flex-1">
              <Label className="text-xs text-gray-500">Notes</Label>
              <Input
                value={response.notes || ''}
                onChange={(e) => saveResponse(question.id, { notes: e.target.value })}
                placeholder="Add notes (optional)"
                className="mt-1"
              />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Switch
                checked={response.flagged || false}
                onCheckedChange={(checked) =>
                  saveResponse(question.id, { flagged: checked })
                }
              />
              <Flag className="h-4 w-4 text-orange-500" />
              Flag
            </label>
          </div>

          {saving === question.id && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{audit.template.name}</h1>
          <p className="text-gray-500">{audit.site.name}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Progress</div>
          <div className="text-lg font-semibold">
            {answeredQuestions} / {totalQuestions}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={progress} className="h-2" />

      {/* Section Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {sections.map((section, index) => {
          const sectionAnswered = section.questions.filter(
            (q) => responses[q.id]?.boolValue !== undefined ||
                   responses[q.id]?.value !== undefined ||
                   responses[q.id]?.numericValue !== undefined
          ).length
          const isComplete = sectionAnswered === section.questions.length
          const isCurrent = index === currentSectionIndex

          return (
            <Button
              key={section.id}
              variant={isCurrent ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentSectionIndex(index)}
              className="shrink-0"
            >
              {isComplete && <CheckCircle2 className="h-4 w-4 mr-1" />}
              {section.title}
              <Badge variant="secondary" className="ml-2">
                {sectionAnswered}/{section.questions.length}
              </Badge>
            </Button>
          )
        })}
      </div>

      {/* Current Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">{currentSection.title}</h2>
        {currentSection.description && (
          <p className="text-gray-500 mb-4">{currentSection.description}</p>
        )}
        <div className="space-y-4">
          {currentSection.questions.map((question, index) =>
            renderQuestion(question, index)
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => setCurrentSectionIndex((i) => Math.max(0, i - 1))}
          disabled={currentSectionIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous Section
        </Button>

        {currentSectionIndex < sections.length - 1 ? (
          <Button
            onClick={() =>
              setCurrentSectionIndex((i) => Math.min(sections.length - 1, i + 1))
            }
          >
            Next Section
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={() => setShowCompleteDialog(true)}>
            <Save className="h-4 w-4 mr-2" />
            Complete Audit
          </Button>
        )}
      </div>

      {/* Complete Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Audit</DialogTitle>
            <DialogDescription>
              Are you sure you want to complete this audit? Make sure all questions
              are answered.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center justify-between text-sm">
              <span>Questions Answered</span>
              <span className="font-medium">
                {answeredQuestions} / {totalQuestions}
              </span>
            </div>
            {answeredQuestions < totalQuestions && (
              <div className="flex items-center gap-2 mt-2 text-orange-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">
                  {totalQuestions - answeredQuestions} questions remaining
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleComplete} disabled={completing}>
              {completing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Audit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
