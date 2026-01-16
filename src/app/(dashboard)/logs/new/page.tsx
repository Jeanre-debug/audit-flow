'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react'
import { createLogEntry } from '@/actions/logs'

interface LogTemplate {
  id: string
  name: string
  type: string
  fields: {
    name: string
    label: string
    type: string
    required: boolean
    assetId?: string
    options?: string[]
    minValue?: number
    maxValue?: number
    unit?: string
  }[]
}

interface Site {
  id: string
  name: string
}

interface Reading {
  fieldName: string
  value: string
  numericValue?: number
  assetId?: string
  isException: boolean
  exceptionNote: string
}

export default function NewLogEntryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedTemplateId = searchParams.get('templateId')

  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [templates, setTemplates] = useState<LogTemplate[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<LogTemplate | null>(null)
  const [siteId, setSiteId] = useState('')
  const [shift, setShift] = useState('')
  const [notes, setNotes] = useState('')
  const [readings, setReadings] = useState<Record<string, Reading>>({})

  useEffect(() => {
    async function loadData() {
      try {
        const [templatesRes, sitesRes] = await Promise.all([
          fetch('/api/log-templates').then((r) => r.json()),
          fetch('/api/sites').then((r) => r.json()),
        ])
        setTemplates(templatesRes.data || [])
        setSites(sitesRes.data || [])

        if (preselectedTemplateId) {
          const template = templatesRes.data?.find(
            (t: LogTemplate) => t.id === preselectedTemplateId
          )
          if (template) {
            selectTemplate(template)
          }
        }
      } catch (err) {
        setError('Failed to load data')
      } finally {
        setDataLoading(false)
      }
    }
    loadData()
  }, [preselectedTemplateId])

  const selectTemplate = (template: LogTemplate) => {
    setSelectedTemplate(template)
    const initialReadings: Record<string, Reading> = {}
    template.fields.forEach((field) => {
      initialReadings[field.name] = {
        fieldName: field.name,
        value: '',
        assetId: field.assetId,
        isException: false,
        exceptionNote: '',
      }
    })
    setReadings(initialReadings)
  }

  const updateReading = (fieldName: string, updates: Partial<Reading>) => {
    setReadings((prev) => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], ...updates },
    }))
  }

  const handleSubmit = async () => {
    if (!selectedTemplate) {
      setError('Please select a template')
      return
    }

    setLoading(true)
    setError(null)

    const readingsArray = Object.values(readings).map((r) => ({
      ...r,
      numericValue: r.value ? parseFloat(r.value) : undefined,
    }))

    const result = await createLogEntry({
      templateId: selectedTemplate.id,
      siteId: siteId || undefined,
      shift: shift || undefined,
      notes: notes || undefined,
      readings: readingsArray,
    })

    if (result.success) {
      router.push('/logs')
    } else {
      setError(result.error || 'Failed to create log entry')
      setLoading(false)
    }
  }

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/logs">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">New Log Entry</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Template Selection */}
      {!selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>Select Log Template</CardTitle>
            <CardDescription>Choose a template to record your log entry</CardDescription>
          </CardHeader>
          <CardContent>
            {templates.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No log templates available.</p>
                <Button asChild>
                  <Link href="/logs/templates/new">Create Template</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {templates.map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    className="justify-start h-auto py-4"
                    onClick={() => selectTemplate(template)}
                  >
                    <div className="text-left">
                      <p className="font-medium">{template.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{template.type}</p>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Entry Form */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedTemplate.name}</CardTitle>
                <CardDescription className="capitalize">
                  {selectedTemplate.type} log
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedTemplate(null)}>
                Change
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Site and Shift */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Site</Label>
                <Select value={siteId} onValueChange={setSiteId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select site" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites.map((site) => (
                      <SelectItem key={site.id} value={site.id}>
                        {site.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Shift</Label>
                <Select value={shift} onValueChange={setShift}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                    <SelectItem value="night">Night</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Readings */}
            <div className="space-y-4">
              <h3 className="font-medium">Readings</h3>
              {selectedTemplate.fields.map((field) => {
                const reading = readings[field.name]
                const isOutOfRange =
                  field.type === 'number' &&
                  reading?.value &&
                  ((field.minValue !== undefined &&
                    parseFloat(reading.value) < field.minValue) ||
                    (field.maxValue !== undefined &&
                      parseFloat(reading.value) > field.maxValue))

                return (
                  <div key={field.name} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {field.unit && (
                        <span className="text-sm text-gray-500">{field.unit}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {field.type === 'number' ? (
                        <Input
                          type="number"
                          step="any"
                          value={reading?.value || ''}
                          onChange={(e) =>
                            updateReading(field.name, { value: e.target.value })
                          }
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          className={isOutOfRange ? 'border-red-500' : ''}
                        />
                      ) : field.type === 'select' && field.options ? (
                        <Select
                          value={reading?.value || ''}
                          onValueChange={(value) =>
                            updateReading(field.name, { value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : field.type === 'checkbox' ? (
                        <Switch
                          checked={reading?.value === 'true'}
                          onCheckedChange={(checked) =>
                            updateReading(field.name, { value: String(checked) })
                          }
                        />
                      ) : (
                        <Input
                          type={field.type === 'time' ? 'time' : 'text'}
                          value={reading?.value || ''}
                          onChange={(e) =>
                            updateReading(field.name, { value: e.target.value })
                          }
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                      )}
                    </div>

                    {isOutOfRange && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span>
                          Out of range ({field.minValue} - {field.maxValue} {field.unit})
                        </span>
                      </div>
                    )}

                    {(isOutOfRange || reading?.isException) && (
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm">
                          <Switch
                            checked={reading?.isException || false}
                            onCheckedChange={(checked) =>
                              updateReading(field.name, { isException: checked })
                            }
                          />
                          Mark as Exception
                        </label>
                        {reading?.isException && (
                          <Input
                            value={reading.exceptionNote || ''}
                            onChange={(e) =>
                              updateReading(field.name, { exceptionNote: e.target.value })
                            }
                            placeholder="Explain the exception..."
                          />
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes..."
                rows={2}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Entry
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
