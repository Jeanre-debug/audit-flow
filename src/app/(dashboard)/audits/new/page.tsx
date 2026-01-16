'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Loader2, ClipboardCheck } from 'lucide-react'
import { startAudit } from '@/actions/audits'

interface Template {
  id: string
  name: string
  category: string | null
  _count: { sections: number }
}

interface Site {
  id: string
  name: string
}

export default function NewAuditPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [selectedSite, setSelectedSite] = useState('')
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [templatesRes, sitesRes] = await Promise.all([
          fetch('/api/templates').then((r) => r.json()),
          fetch('/api/sites').then((r) => r.json()),
        ])
        setTemplates(templatesRes.data || [])
        setSites(sitesRes.data || [])
      } catch (err) {
        setError('Failed to load data')
      } finally {
        setDataLoading(false)
      }
    }
    loadData()
  }, [])

  const handleStart = async () => {
    if (!selectedTemplate || !selectedSite) {
      setError('Please select a template and site')
      return
    }

    setLoading(true)
    setError(null)

    const result = await startAudit({
      templateId: selectedTemplate,
      siteId: selectedSite,
    })

    if (result.success && result.auditId) {
      router.push(`/audits/${result.auditId}`)
    } else {
      setError(result.error || 'Failed to start audit')
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
          <Link href="/audits">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Start New Audit
        </h1>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardCheck className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No templates available
            </h3>
            <p className="text-gray-500 text-center mb-4">
              Create an audit template first to start conducting audits.
            </p>
            <Button asChild>
              <Link href="/audits/templates/new">Create Template</Link>
            </Button>
          </CardContent>
        </Card>
      ) : sites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardCheck className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No sites available
            </h3>
            <p className="text-gray-500 text-center mb-4">
              Add a site first to conduct audits.
            </p>
            <Button asChild>
              <Link href="/sites/new">Add Site</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Select Template and Site</CardTitle>
            <CardDescription>
              Choose the audit template and location for this audit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Audit Template *</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div>
                        <span>{template.name}</span>
                        {template.category && (
                          <span className="ml-2 text-xs text-gray-500">
                            ({template.category})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Site *</Label>
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a site" />
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

            <div className="flex justify-end pt-4">
              <Button onClick={handleStart} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Start Audit
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
