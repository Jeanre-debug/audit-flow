'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Loader2,
  Save,
} from 'lucide-react'
import { createTemplate, updateTemplate, type TemplateFormData } from '@/actions/templates'

const questionTypes = [
  { value: 'yes_no', label: 'Yes/No' },
  { value: 'pass_fail', label: 'Pass/Fail' },
  { value: 'numeric', label: 'Numeric' },
  { value: 'text', label: 'Text' },
  { value: 'photo', label: 'Photo' },
  { value: 'multi_choice', label: 'Multiple Choice' },
  { value: 'rating', label: 'Rating (1-5)' },
]

const categories = [
  'food-safety',
  'hygiene',
  'haccp',
  'fire-safety',
  'health-safety',
  'quality',
  'operational',
  'other',
]

interface Question {
  id: string
  text: string
  description?: string
  type: string
  isRequired: boolean
  isCritical: boolean
  weight: number
  minValue?: number
  maxValue?: number
  unit?: string
  options?: string[]
}

interface Section {
  id: string
  title: string
  description?: string
  weight: number
  questions: Question[]
  isExpanded: boolean
}

interface TemplateBuilderProps {
  template?: {
    id: string
    name: string
    description: string | null
    category: string | null
    passingScore: number
    sections: {
      id: string
      title: string
      description: string | null
      weight: number
      questions: {
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
      }[]
    }[]
  }
}

export function TemplateBuilder({ template }: TemplateBuilderProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(template?.name || '')
  const [description, setDescription] = useState(template?.description || '')
  const [category, setCategory] = useState(template?.category || '')
  const [passingScore, setPassingScore] = useState(template?.passingScore || 80)

  const [sections, setSections] = useState<Section[]>(
    template?.sections.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description || undefined,
      weight: s.weight,
      isExpanded: true,
      questions: s.questions.map((q) => ({
        id: q.id,
        text: q.text,
        description: q.description || undefined,
        type: q.type,
        isRequired: q.isRequired,
        isCritical: q.isCritical,
        weight: q.weight,
        minValue: q.minValue || undefined,
        maxValue: q.maxValue || undefined,
        unit: q.unit || undefined,
        options: q.options,
      })),
    })) || []
  )

  const addSection = () => {
    setSections([
      ...sections,
      {
        id: crypto.randomUUID(),
        title: '',
        weight: 1,
        questions: [],
        isExpanded: true,
      },
    ])
  }

  const removeSection = (sectionId: string) => {
    setSections(sections.filter((s) => s.id !== sectionId))
  }

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    setSections(
      sections.map((s) => (s.id === sectionId ? { ...s, ...updates } : s))
    )
  }

  const addQuestion = (sectionId: string) => {
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              questions: [
                ...s.questions,
                {
                  id: crypto.randomUUID(),
                  text: '',
                  type: 'yes_no',
                  isRequired: true,
                  isCritical: false,
                  weight: 1,
                },
              ],
            }
          : s
      )
    )
  }

  const removeQuestion = (sectionId: string, questionId: string) => {
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? { ...s, questions: s.questions.filter((q) => q.id !== questionId) }
          : s
      )
    )
  }

  const updateQuestion = (
    sectionId: string,
    questionId: string,
    updates: Partial<Question>
  ) => {
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.map((q) =>
                q.id === questionId ? { ...q, ...updates } : q
              ),
            }
          : s
      )
    )
  }

  const handleSave = async () => {
    setError(null)
    setLoading(true)

    if (!name.trim()) {
      setError('Template name is required')
      setLoading(false)
      return
    }

    if (sections.length === 0) {
      setError('At least one section is required')
      setLoading(false)
      return
    }

    for (const section of sections) {
      if (!section.title.trim()) {
        setError('All sections must have a title')
        setLoading(false)
        return
      }
      if (section.questions.length === 0) {
        setError(`Section "${section.title}" must have at least one question`)
        setLoading(false)
        return
      }
      for (const question of section.questions) {
        if (!question.text.trim()) {
          setError(`All questions must have text in section "${section.title}"`)
          setLoading(false)
          return
        }
      }
    }

    const data: TemplateFormData = {
      name,
      description: description || undefined,
      category: category || undefined,
      passingScore,
      sections: sections.map((s, sIndex) => ({
        title: s.title,
        description: s.description,
        order: sIndex,
        weight: s.weight,
        questions: s.questions.map((q, qIndex) => ({
          text: q.text,
          description: q.description,
          type: q.type as any,
          isRequired: q.isRequired,
          isCritical: q.isCritical,
          order: qIndex,
          weight: q.weight,
          minValue: q.minValue,
          maxValue: q.maxValue,
          unit: q.unit,
          options: q.options,
        })),
      })),
    }

    const result = template
      ? await updateTemplate(template.id, data)
      : await createTemplate(data)

    setLoading(false)

    if (result.success) {
      router.push('/audits/templates')
    } else {
      setError(result.error || 'Failed to save template')
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Daily Kitchen Inspection"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this audit template"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="passingScore">Passing Score (%)</Label>
            <Input
              id="passingScore"
              type="number"
              min={0}
              max={100}
              value={passingScore}
              onChange={(e) => setPassingScore(parseInt(e.target.value) || 0)}
              className="w-32"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Sections</h2>
          <Button onClick={addSection}>
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>

        {sections.map((section, sIndex) => (
          <Card key={section.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                <Input
                  value={section.title}
                  onChange={(e) =>
                    updateSection(section.id, { title: e.target.value })
                  }
                  placeholder="Section title"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    updateSection(section.id, { isExpanded: !section.isExpanded })
                  }
                >
                  {section.isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSection(section.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardHeader>

            {section.isExpanded && (
              <CardContent className="space-y-4">
                <Textarea
                  value={section.description || ''}
                  onChange={(e) =>
                    updateSection(section.id, { description: e.target.value })
                  }
                  placeholder="Section description (optional)"
                  rows={1}
                />

                {/* Questions */}
                <div className="space-y-3">
                  {section.questions.map((question, qIndex) => (
                    <div
                      key={question.id}
                      className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
                    >
                      <div className="flex items-start gap-2 mb-3">
                        <span className="text-sm text-gray-500 mt-2">
                          Q{qIndex + 1}
                        </span>
                        <div className="flex-1 space-y-3">
                          <Input
                            value={question.text}
                            onChange={(e) =>
                              updateQuestion(section.id, question.id, {
                                text: e.target.value,
                              })
                            }
                            placeholder="Question text"
                          />
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <Select
                              value={question.type}
                              onValueChange={(value) =>
                                updateQuestion(section.id, question.id, {
                                  type: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {questionTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {question.type === 'numeric' && (
                              <>
                                <Input
                                  type="number"
                                  placeholder="Min"
                                  value={question.minValue ?? ''}
                                  onChange={(e) =>
                                    updateQuestion(section.id, question.id, {
                                      minValue: e.target.value
                                        ? parseFloat(e.target.value)
                                        : undefined,
                                    })
                                  }
                                />
                                <Input
                                  type="number"
                                  placeholder="Max"
                                  value={question.maxValue ?? ''}
                                  onChange={(e) =>
                                    updateQuestion(section.id, question.id, {
                                      maxValue: e.target.value
                                        ? parseFloat(e.target.value)
                                        : undefined,
                                    })
                                  }
                                />
                                <Input
                                  placeholder="Unit (e.g., °F)"
                                  value={question.unit || ''}
                                  onChange={(e) =>
                                    updateQuestion(section.id, question.id, {
                                      unit: e.target.value,
                                    })
                                  }
                                />
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-sm">
                              <Switch
                                checked={question.isRequired}
                                onCheckedChange={(checked) =>
                                  updateQuestion(section.id, question.id, {
                                    isRequired: checked,
                                  })
                                }
                              />
                              Required
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                              <Switch
                                checked={question.isCritical}
                                onCheckedChange={(checked) =>
                                  updateQuestion(section.id, question.id, {
                                    isCritical: checked,
                                  })
                                }
                              />
                              <span className="text-red-600">Critical</span>
                            </label>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeQuestion(section.id, question.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addQuestion(section.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </CardContent>
            )}
          </Card>
        ))}

        {sections.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500 mb-4">
                Add sections to organize your audit questions
              </p>
              <Button onClick={addSection}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Section
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="h-4 w-4 mr-2" />
          {template ? 'Save Changes' : 'Create Template'}
        </Button>
      </div>
    </div>
  )
}
