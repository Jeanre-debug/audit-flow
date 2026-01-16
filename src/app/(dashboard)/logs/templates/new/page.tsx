'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react'
import { createLogTemplate } from '@/actions/logs'

interface Field {
  id: string
  name: string
  label: string
  type: 'number' | 'text' | 'select' | 'checkbox' | 'time'
  required: boolean
  options: string[]
  minValue?: number
  maxValue?: number
  unit?: string
}

const logTypes = [
  { value: 'temperature', label: 'Temperature Log' },
  { value: 'cleaning', label: 'Cleaning Checklist' },
  { value: 'opening', label: 'Opening Checklist' },
  { value: 'closing', label: 'Closing Checklist' },
  { value: 'receiving', label: 'Receiving Log' },
  { value: 'waste', label: 'Waste Log' },
  { value: 'other', label: 'Other' },
]

const fieldTypes = [
  { value: 'number', label: 'Number' },
  { value: 'text', label: 'Text' },
  { value: 'select', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'time', label: 'Time' },
]

export default function NewLogTemplatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('temperature')
  const [frequency, setFrequency] = useState<'hourly' | 'daily' | 'weekly' | 'monthly'>('daily')
  const [fields, setFields] = useState<Field[]>([])

  const addField = () => {
    setFields([
      ...fields,
      {
        id: crypto.randomUUID(),
        name: '',
        label: '',
        type: 'number',
        required: true,
        options: [],
      },
    ])
  }

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id))
  }

  const updateField = (id: string, updates: Partial<Field>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)))
  }

  const handleSubmit = async () => {
    setError(null)

    if (!name.trim()) {
      setError('Template name is required')
      return
    }

    if (fields.length === 0) {
      setError('At least one field is required')
      return
    }

    for (const field of fields) {
      if (!field.label.trim()) {
        setError('All fields must have a label')
        return
      }
    }

    setLoading(true)

    const result = await createLogTemplate({
      name,
      description: description || undefined,
      type,
      frequency,
      fields: fields.map((f) => ({
        name: f.label.toLowerCase().replace(/\s+/g, '_'),
        label: f.label,
        type: f.type,
        required: f.required,
        options: f.options,
        minValue: f.minValue,
        maxValue: f.maxValue,
        unit: f.unit,
      })),
    })

    if (result.success) {
      router.push('/logs/templates')
    } else {
      setError(result.error || 'Failed to create template')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/logs/templates">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Create Log Template</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
                placeholder="e.g., Walk-in Cooler Temps"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {logTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
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
              placeholder="Brief description of this log template"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={(v: typeof frequency) => setFrequency(v)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Fields</CardTitle>
          <Button onClick={addField} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Add fields to define what data this log will capture.
            </p>
          ) : (
            fields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Field {index + 1}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeField(field.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Label *</Label>
                    <Input
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      placeholder="e.g., Cooler #1 Temperature"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={field.type}
                      onValueChange={(v: Field['type']) => updateField(field.id, { type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldTypes.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {field.type === 'number' && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Min Value</Label>
                      <Input
                        type="number"
                        value={field.minValue ?? ''}
                        onChange={(e) =>
                          updateField(field.id, {
                            minValue: e.target.value ? parseFloat(e.target.value) : undefined,
                          })
                        }
                        placeholder="Min"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Value</Label>
                      <Input
                        type="number"
                        value={field.maxValue ?? ''}
                        onChange={(e) =>
                          updateField(field.id, {
                            maxValue: e.target.value ? parseFloat(e.target.value) : undefined,
                          })
                        }
                        placeholder="Max"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unit</Label>
                      <Input
                        value={field.unit || ''}
                        onChange={(e) => updateField(field.id, { unit: e.target.value })}
                        placeholder="e.g., °F"
                      />
                    </div>
                  </div>
                )}

                {field.type === 'select' && (
                  <div className="space-y-2">
                    <Label>Options (comma separated)</Label>
                    <Input
                      value={field.options.join(', ')}
                      onChange={(e) =>
                        updateField(field.id, {
                          options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      placeholder="Option 1, Option 2, Option 3"
                    />
                  </div>
                )}

                <label className="flex items-center gap-2">
                  <Switch
                    checked={field.required}
                    onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                  />
                  <span className="text-sm">Required field</span>
                </label>
              </div>
            ))
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Template
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
